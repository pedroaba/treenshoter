# Preview Window - Implementação de Ferramentas de Desenho

## Contexto da Funcionalidade

A janela de preview (`PreviewWindow`) foi implementada para exibir screenshots capturados com ferramentas de desenho integradas. A janela abre automaticamente após cada captura e permite editar a imagem antes de salvar.

## Arquitetura

### Classes Principais

**`PreviewWindow`** (`src/main/ui/preview.ts`)
- Singleton que gerencia a janela de preview
- Reutiliza a mesma janela para múltiplos screenshots
- Mostra o dock macOS ao abrir (não esconde ao fechar)
- Carrega `preview.html` com ID do screenshot

**`PreviewManager`** (`src/renderer/src/preview.ts`)
- Orquestra toda a lógica da janela de preview
- Gerencia `ImageZoomer`, `DrawingManager` e `FloatingToolbar`
- Conecta eventos dos botões de ação

**`DrawingManager`** (`src/renderer/src/preview.ts`)
- Gerencia desenho no canvas sobreposto à imagem
- Suporta ferramentas: pen, rectangle, circle, line, arrow
- Mantém array de `Shape[]` para redesenho
- Método `clear()` para limpar todos os desenhos
- Método `getImageWithDrawing()` retorna imagem composta (original + desenhos)

**`ImageZoomer`** (`src/renderer/src/preview.ts`)
- Gerencia zoom (Ctrl/Cmd + scroll) e pan (arrastar)
- Modo de desenho: desabilita zoom/pan quando `drawingMode = true`
- Botão de reset de zoom

**`FloatingToolbar`** (`src/renderer/src/preview.ts`)
- Gerencia toolbar flutuante na parte inferior
- Popovers para cor e tamanho
- Rastreia `currentSize` para sincronização do slider
- Tooltips (exceto botão de tamanho)

## Ferramentas de Desenho

### Implementadas
- **Pen**: Desenho livre, adiciona pontos ao path
- **Rectangle**: Desenha retângulo com preview em tempo real
- **Circle**: Desenha elipse com preview em tempo real
- **Line**: Desenha linha reta com preview
- **Arrow**: Desenha linha + cabeça da seta com preview

### Removidas (não funcionavam)
- **Text**: Removida completamente (botão, lógica, tipos)
- **Select**: Removida completamente (causava bugs)

### Sistema de Desenho
- Formas são salvas em array `shapes: Shape[]`
- Preview usa redesenho completo (não snapshot)
- Validação de tamanho mínimo para evitar formas muito pequenas
- Canvas redimensiona dinamicamente com `ResizeObserver`

## Controles

### Seletor de Cor
- Popover com grid de 9 cores predefinidas
- Cores: Vermelho, Azul, Verde, Amarelo, Laranja, Roxo, Rosa, Branco, Preto
- Indicador visual (`color-indicator`) mostra cor atual
- Tooltip "Color"

### Seletor de Tamanho
- Slider de 1-20px
- Popover com slider horizontal
- Exibe valor atual em pixels
- **Importante**: Rastreia `currentSize` para sincronização correta
- Sem tooltip (removido)

### Botão Reset/Clear
- Ícone de reset (setas circulares)
- Animação: rotação de 720° em 1.2s
- Chama `drawingManager.clear()`
- Tooltip "Clear Canvas"

## Botões de Ação (Sidebar)

### Copy
- Feedback: ícone muda para check por 1.5s
- Notificação: "Copied! - Image copied to clipboard"
- Usa `copyScreenshotWithDrawing()` se houver desenhos

### Save
- Loading: spinner durante operação
- Botão desabilitado durante processo
- Notificação: "Saved! - Screenshot saved successfully"
- Sobrescreve arquivo original com desenhos

### Save As
- Mesmo estilo de loading do Save
- Diálogo de seleção de arquivo
- Notificação após salvar

### Show in Folder
- Abre Finder/Explorer
- Feedback visual de clique

### Delete
- Confirmação antes de deletar
- Fecha janela após deletar

## IPC Handlers

### Main Process (`src/main/events/library.ts`)
- `electron:library:save-image-with-drawing`: Salva base64 como arquivo
- `electron:library:copy-image-with-drawing`: Copia base64 para clipboard
- `electron:library:save`: Salva screenshot (com ou sem desenhos)
- `electron:library:save-as`: Salva como novo arquivo
- `electron:library:copy`: Copia screenshot
- `electron:library:copy-drawing`: Copia screenshot com desenhos

### Preload (`src/preload/index.ts`)
- `saveImageWithDrawing(id, imageDataUrl)`
- `copyImageWithDrawing(imageDataUrl)`
- `saveScreenshot(dataUrl, filepath)`
- `saveScreenshotAs(filepathOrDataUrl)`
- `copyScreenshot(filepath)`
- `copyScreenshotWithDrawing(dataUrl)`

## Estrutura de Dados

### Shape Interface
```typescript
interface Shape {
  type: "pen" | "rectangle" | "circle" | "line" | "arrow"
  x: number
  y: number
  width?: number
  height?: number
  endX?: number
  endY?: number
  color: string
  size: number
  path?: Array<{ x: number; y: number }> // Para pen
}
```

## Estilos e Layout

### Toolbar Flutuante
- Posição: `bottom: 20px`, centralizado
- Fundo: `rgba(30, 30, 30, 0.95)` com blur
- Organização: 3 grupos separados por separadores
- Tooltips: Aparecem acima dos botões

### Sidebar
- Padding: 24px
- Gap entre seções: 16px
- Gap dentro das seções: 14px
- Gap label/value: 6px
- Gap botões actions: 10px

### Animações
- Reset: `rotate2x` - 720° em 1.2s
- Tooltips: fade in/out
- Popovers: fade in com translateY
- Botões: scale(0.95) no click

## Problemas Resolvidos

1. **Slider de tamanho**: Adicionado `currentSize` para rastrear valor atual
2. **Formas não apareciam**: Refatorado sistema de redesenho
3. **Seta incompleta**: Corrigido `drawArrow` para desenhar linha + cabeça
4. **Retângulo não aparecia**: Validação de tamanho mínimo
5. **Linha como ponto**: Correção na lógica de desenho
6. **Tooltip do tamanho**: Regras CSS para esconder quando sem atributo

## Fluxo de Dados

1. Screenshot capturado → `InsertOp.execute()` retorna ID
2. `PreviewWindow.create(id)` abre janela
3. Renderer carrega dados via `getScreenshotById(id)`
4. `DrawingManager` gerencia desenho no canvas
5. Ao salvar/copiar: `getImageWithDrawing()` compõe imagem + desenhos
6. IPC envia base64 para main process
7. Main process salva/copia e dispara notificação

## Notificações

- Usa `NotificationDispatcher.dispatch()` do main process
- Notificações aparecem no sistema operacional
- Títulos e mensagens configuráveis
- Disparadas automaticamente após operações

## Gerenciamento do Dock macOS

### Comportamento Atual
- **O app sempre aparece no dock**: Todas as chamadas de `app.dock.hide()` foram removidas
- **Dock visível permanentemente**: O app permanece visível no dock mesmo quando todas as janelas estão fechadas
- **Mostra dock ao abrir janelas**: Janelas mostram o dock ao serem criadas (`app.dock.show()`)

### Arquivos Afetados
- `src/main/ui/preview.ts`: Removido `app.dock.hide()` no evento `closed`
- `src/main/ui/library.ts`: Removido `app.dock.hide()` no evento `closed`
- `src/main/ui/settings.ts`: Removido `app.dock.hide()` no evento `closed`
- `src/main/ui/window.ts`: Removido `app.dock.hide()` no evento `close`
- `src/main/index.ts`: Removido `app.dock.hide()` na inicialização

### Motivação
O comportamento anterior escondia o dock quando janelas eram fechadas, mas como outras janelas podem estar abertas simultaneamente, o dock deve permanecer visível para garantir acesso consistente ao app.

## Arquivos Principais

- `src/renderer/preview.html` - Estrutura HTML
- `src/renderer/assets/styles/preview.css` - Estilos
- `src/renderer/src/preview.ts` - Lógica do renderer
- `src/main/ui/preview.ts` - Gerenciamento da janela
- `src/main/events/library.ts` - Handlers IPC
- `src/preload/index.ts` - API exposta ao renderer

## Padrões Seguidos

- Singleton para `PreviewWindow`
- Classes estáticas quando apropriado
- IPC via `ipcMain.handle()` e `ipcRenderer.invoke()`
- Formatação Biome (tabs, aspas duplas, semicolons asNeeded)
- Nomenclatura: PascalCase classes, camelCase métodos

## Limitações Conhecidas

- Funcionalidade de texto foi removida (não funcionava)
- Funcionalidade de select foi removida (causava bugs)
- Notificações dependem de permissões do OS

## Melhorias Futuras Potenciais

- Undo/redo
- Mais ferramentas (texto, formas preenchidas)
- Atalhos de teclado
- Otimização para imagens grandes
- Melhorias de acessibilidade

