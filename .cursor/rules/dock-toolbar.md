# Dock Toolbar - Implementação de Seleção de Modo

## Contexto da Funcionalidade

A toolbar flutuante (dock) é exibida quando o usuário pressiona o atalho global `Command+Shift+S` (Mac) ou `Super+Shift+S` (Windows/Linux). Ela permite selecionar o modo de captura de tela e mantém o estado do modo selecionado entre aberturas/fechamentos.

## Arquitetura

### Classes Principais

**`DockWindow`** (`src/main/ui/dock.ts`)
- Singleton que gerencia a janela do dock
- Reutiliza a mesma janela (não recria se já existe)
- Posiciona no centro inferior da tela
- Gerencia visibilidade com `toggle()`, `hide()`
- Coordena com `OverlaysManager` para mostrar/esconder overlays

**`OverlaysManager`** (`src/main/ui/overlay.ts`)
- Gerencia múltiplos overlays (um por display)
- Cria overlays transparentes em todos os monitores
- Envia modo atual para overlays quando são criados
- Limpa overlays quando dock é fechado

**`PrintscreenModeState`** (`src/main/states/mode.ts`)
- State singleton que armazena o modo atual
- Modos possíveis: `"fullscreen"`, `"partialscreen"`, `"record"`, `"record-partial"`
- Persiste entre aberturas/fechamentos do dock

**`SelectModeEvent`** (`src/main/events/select-mode.ts`)
- Registra handler IPC para mudanças de modo
- Mapeia modos do dock para modos do overlay
- Envia modo atualizado para todos os overlays ativos
- Expõe handler para obter modo atual via IPC

## Modos de Captura

### Implementados
- **Fullscreen**: Captura a tela inteira do display
- **Partialscreen**: Permite selecionar área específica da tela

### Não Implementados (com fallback)
- **Record**: Gravação de tela completa
  - Mostra alerta: "Gravação de tela ainda não foi implementada. Voltando para o modo de captura de área selecionada."
  - Automaticamente volta para `partialscreen`
- **Record Partial**: Gravação de área selecionada
  - Mesmo tratamento do `record`
  - Volta para `partialscreen`

## Sistema de Estado

### Persistência de Modo
- Modo é armazenado em `PrintscreenModeState`
- Dock restaura modo ao ser aberto via `getCurrentMode()`
- Overlay recebe modo quando é criado e ao mudar
- Estado persiste entre sessões (mantém último modo selecionado)

### Sincronização Dock ↔ Overlay
- Dock envia modo via `selectMode(mode)` → IPC `electron:screenshoter:mode-select`
- Main process mapeia modos e envia para overlays
- Overlay busca modo atual na inicialização
- Overlay também recebe atualizações via IPC quando modo muda

## Mapeamento de Modos

### Dock → Overlay
- `"fullscreen"` → `"fullscreen"`
- `"partialscreen"` → `"area"`
- `"record"` → `"fullscreen"` (fallback, não usado)
- `"record-partial"` → `"area"` (fallback, não usado)

### Função de Mapeamento
```typescript
function mapModeToOverlay(mode: string): "fullscreen" | "area" {
  if (mode === "partialscreen" || mode === "record-partial") {
    return "area"
  }
  if (mode === "record") {
    return "fullscreen"
  }
  return mode === "area" ? "area" : "fullscreen"
}
```

## Inicialização e Restauração

### Dock (`src/renderer/src/dock.ts`)
1. Ao inicializar, busca modo atual via `getCurrentMode()`
2. Restaura estado visual dos botões (`data-state="selected"`)
3. Sincroniza variável `selectedMode` local
4. Fallback para `fullscreen` se houver erro

### Overlay (`src/renderer/src/overlay.ts`)
1. Ao inicializar, busca modo atual via `getCurrentMode()`
2. Mapeia modo do dock para modo do overlay
3. Define modo no `SelectionState`
4. Também recebe modo via IPC quando dock muda

### Main Process (`src/main/ui/overlay.ts`)
1. Quando overlay está pronto (`ready-to-show`)
2. Busca modo atual de `PrintscreenModeState`
3. Mapeia e envia para overlay via IPC
4. Garante que overlay recebe modo mesmo se criado antes de mudanças

## Tratamento de Botões de Gravação

### Lógica de Fallback
```typescript
function handleSelectMode(mode: Mode) {
  // Handle recording modes - show alert and fallback to partialscreen
  if (mode === Mode.RECORD || mode === Mode.RECORD_PARTIAL) {
    alert("Gravação de tela ainda não foi implementada. Voltando para o modo de captura de área selecionada.")
    mode = Mode.PARTIALSCREEN
  }
  // ... resto da lógica
}
```

### Comportamento
- Usuário clica em botão de gravação
- Alerta é exibido informando que não está implementado
- Modo é automaticamente alterado para `partialscreen`
- Estado visual é atualizado
- Modo é sincronizado com overlay

## IPC Handlers

### Main Process (`src/main/events/select-mode.ts`)
- `electron:screenshoter:mode-select`: Recebe mudança de modo do dock
  - Atualiza `PrintscreenModeState`
  - Mapeia modo para overlay
  - Envia para todos os overlays ativos
- `electron:screenshoter:get-current-mode`: Retorna modo atual
  - Usado por dock e overlay na inicialização

### Preload (`src/preload/index.ts`)
- `selectMode(mode: string)`: Envia mudança de modo
- `getCurrentMode(): Promise<string>`: Obtém modo atual

## Estrutura de Dados

### Modos do Dock
```typescript
enum Mode {
  FULLSCREEN = "fullscreen",
  PARTIALSCREEN = "partialscreen",
  RECORD = "record",
  RECORD_PARTIAL = "record-partial",
}
```

### Modos do Overlay
```typescript
type Mode = "fullscreen" | "area"
```

## Estilos e Layout

### Dock Toolbar
- Posição: Centro inferior da tela
- Largura: Máximo 600px ou largura da tela - 40px
- Altura: 60px
- Fundo: Transparente com blur
- Botões: Grid horizontal com ícones SVG
- Estado visual: `data-state="selected"` para botão ativo

### Botões
- **Fullscreen**: Ícone de tela cheia
- **Partialscreen**: Ícone de scan/eye
- **Record**: Ícone de aperture (não funcional)
- **Record Partial**: Ícone de vídeo (não funcional)
- **Close**: Botão X para fechar dock
- **Library**: Botão para abrir biblioteca

## Fluxo de Dados

1. Usuário pressiona `Command+Shift+S`
2. `PrintShortcut` detecta atalho
3. `DockWindow.toggle()` mostra/esconde dock
4. Se mostrando, `OverlaysManager.shows()` cria overlays
5. Dock busca modo atual e restaura estado visual
6. Overlays recebem modo atual quando criados
7. Usuário seleciona modo no dock
8. Modo é enviado via IPC para main process
9. Main process atualiza estado e envia para overlays
10. Overlays atualizam comportamento (fullscreen vs área selecionada)

## Problemas Resolvidos

1. **Modo não restaurado**: Dock agora busca modo atual na inicialização
2. **Overlay com modo errado**: Overlay busca modo ao inicializar e recebe quando criado
3. **Mapeamento incorreto**: Função `mapModeToOverlay()` converte corretamente
4. **Botões de gravação**: Tratamento com alerta e fallback automático
5. **Sincronização**: Estado sincronizado entre dock e overlay

## Arquivos Principais

- `src/renderer/dock.html` - Estrutura HTML do dock
- `src/renderer/assets/styles/dock.css` - Estilos do dock
- `src/renderer/src/dock.ts` - Lógica do renderer (dock)
- `src/main/ui/dock.ts` - Gerenciamento da janela do dock
- `src/main/ui/overlay.ts` - Gerenciamento dos overlays
- `src/main/events/select-mode.ts` - Handlers IPC de modo
- `src/main/states/mode.ts` - Estado do modo
- `src/main/shortcuts/print.ts` - Registro do atalho global
- `src/preload/index.ts` - API exposta ao renderer

## Padrões Seguidos

- Singleton para `DockWindow` e `OverlaysManager`
- State pattern para `PrintscreenModeState`
- IPC via `ipcMain.on()` para eventos e `ipcMain.handle()` para respostas
- Formatação Biome (tabs, aspas duplas, semicolons asNeeded)
- Nomenclatura: PascalCase classes, camelCase métodos
- Enum para modos do dock, type para modos do overlay

## Limitações Conhecidas

- Gravação de tela não está implementada (mostra alerta e fallback)
- Estado não persiste entre reinicializações do app (apenas na sessão)
- Overlays são recriados a cada abertura do dock (não reutilizados)

## Melhorias Futuras Potenciais

- Implementar gravação de tela (record e record-partial)
- Persistir estado do modo entre reinicializações (localStorage/SQLite)
- Reutilizar overlays ao invés de recriar
- Adicionar atalhos de teclado para mudar modo diretamente
- Melhorar feedback visual ao mudar modo
- Adicionar tooltips nos botões do dock

