# Screenshoter - Regras e Padrões do Projeto

## Visão Geral
Screenshoter é uma aplicação Electron minimalista construída com TypeScript e Vite para captura de screenshots (fullscreen ou parcial) com atalho global, dock flutuante para seleção de modo e banco de dados para histórico.

## Stack Tecnológica
- **Core**: Electron, TypeScript
- **Build Tool**: Vite (electron-vite)
- **Database**: Native `node:sqlite` com `sql-bricks` para construção de queries
- **Linting/Formatting**: Biome
- **Package Manager**: pnpm

## Estrutura de Arquivos

### Organização Principal
```
src/
├── main/           # Processo principal Node.js
│   ├── constants/  # Constantes e configurações
│   ├── database/   # Setup SQLite e migrations
│   ├── events/     # Handlers IPC
│   ├── pictures/   # Gerenciamento de arquivos
│   ├── shortcuts/  # Atalhos globais
│   ├── states/     # Estados da aplicação
│   ├── ui/         # Gerenciadores de janelas (Dock, Overlay, Library, etc.)
│   └── utils/      # Utilitários diversos
├── preload/        # Scripts de context bridge
└── renderer/       # Frontend UI (HTML/CSS/TS)
    ├── src/        # Lógica do renderer (dock.ts, overlay.ts, etc.)
    └── assets/     # CSS e assets estáticos
```

## Padrões de Código

### Nomenclatura

#### Classes
- **PascalCase** para nomes de classes
- Classes de gerenciamento: sufixo `Manager` (ex: `DatabaseManager`, `PictureManager`)
- Classes de janelas: sufixo `Window` (ex: `DockWindow`, `LibraryWindow`)
- Classes de eventos: sufixo `Event` (ex: `PrintFullscreenEvent`, `SelectModeEvent`)
- Classes de operações: sufixo `Op` (ex: `InsertOp`, `UpdateOp`)
- Classes de estado: sufixo `State` (ex: `QuitState`, `PrintscreenModeState`)

#### Métodos e Variáveis
- **camelCase** para métodos e variáveis
- Métodos estáticos de registro: `register()` (ex: `PrintFullscreenEvent.register()`)
- Métodos estáticos de criação: `create()` (ex: `DockWindow.create()`)
- Métodos estáticos de instância: `getInstance()` (ex: `DatabaseManager.getInstance()`)

#### Constantes
- **camelCase** para objetos de constantes (ex: `settings`, `shortcuts`)
- Propriedades em **UPPER_SNAKE_CASE** dentro de objetos de constantes
- Enums em **PascalCase** com valores em **UPPERCASE** (ex: `Mode.FULLSCREEN`)

#### Arquivos
- **kebab-case** para nomes de arquivos (ex: `print-full-screen.ts`, `finish-selection.ts`)
- **camelCase** para arquivos de utilitários (ex: `dispatch-simple-notifications.ts`)

### Padrões de Classes

#### Classes Singleton (Managers)
```typescript
export class DatabaseManager {
	private static instance: DatabaseSync | null = null

	static getInstance() {
		if (DatabaseManager.instance) {
			return DatabaseManager.instance
		}
		// ... inicialização
		DatabaseManager.instance = db
		return db
	}
}
```

#### Classes de Janelas
```typescript
export class DockWindow {
	private static _instance: BrowserWindow | null = null

	static create() {
		if (DockWindow._instance && !DockWindow._instance.isDestroyed()) {
			return DockWindow._instance
		}
		// ... criação da janela
		return DockWindow._instance
	}

	static toggle() { /* ... */ }
	static hide() { /* ... */ }
}
```

#### Classes de Eventos IPC
```typescript
export class PrintFullscreenEvent {
	static register() {
		ipcMain.handle("electron:screenshoter:fullscreen", async () => {
			// ... lógica do handler
		})
	}
}
```

#### Classes de Estado
```typescript
export class QuitState {
	private static _state = false

	static get state(): boolean {
		return QuitState._state
	}

	static set state(value: boolean) {
		QuitState._state = value
	}
}
```

### Padrões de IPC (Inter-Process Communication)

#### Nomenclatura de Canais
- Handlers: `electron:screenshoter:*` ou `electron:library:*`
- Exemplos:
  - `electron:print-full-screen`
  - `electron:screenshoter:mode-select`
  - `electron:library:get-all`
  - `electron:library:delete`

#### Handlers no Main Process
- Usar `ipcMain.handle()` para operações assíncronas que retornam valores
- Usar `ipcMain.on()` para eventos unidirecionais

#### Invocações no Renderer
- Usar `ipcRenderer.invoke()` para chamadas que esperam resposta
- Usar `ipcRenderer.send()` para eventos unidirecionais
- Usar `ipcRenderer.on()` para escutar eventos do main process

#### Preload API
- Expor APIs customizadas via `contextBridge.exposeInMainWorld("api", api)`
- Manter APIs do Electron via `contextBridge.exposeInMainWorld("electron", electronAPI)`

### Padrões de Banco de Dados

#### Operações de Database
- Classes de operação com método estático `execute()`
- Usar `sql-bricks` para construção de queries
- Usar `DatabaseSync` do `node:sqlite`

```typescript
export class InsertOp {
	static execute(db: DatabaseSync, { table, items }: InsertParams) {
		const { text, values } = sqlBricks
			.insertInto(table, items)
			.toParams({ placeholder: "?" })
		const stmt = db.prepare(text)
		stmt.run(...values)
	}
}
```

#### Migrations
- Arquivos de migration: `migration_v1.ts`, `migration_v2.ts`
- Executar migrations no bootstrap do database

### Padrões de UI

#### Estrutura de Janelas
- Cada janela tem seu próprio arquivo HTML e TS
- CSS separado por componente em `assets/styles/`
- Bootstrap do renderer no próprio arquivo TS

#### Renderer Process
- Importar estilos CSS no início do arquivo TS
- Usar enums para modos/seleções
- Funções de handler com prefixo `handle` (ex: `handleCloseDock()`)
- Função `bootstrap()` para inicialização

### Padrões de Formatação (Biome)

#### Configurações Aplicadas
- **Indentação**: Tabs
- **Aspas**: Duplas (`"`)
- **Semicolons**: `asNeeded` (somente quando necessário)
- **Organização de imports**: Habilitada (`organizeImports: "on"`)

#### Regras de Linter
- Regras recomendadas habilitadas
- `noStaticOnlyClass: "off"` (permitir classes apenas estáticas)

### Padrões de TypeScript

#### Configuração
- Usar `tsconfig.node.json` para main/preload
- Usar `tsconfig.web.json` para renderer
- `composite: true` para ambos
- Estender configurações do `@electron-toolkit/tsconfig`

#### Tipos e Interfaces
- Interfaces para contratos (ex: `ScreenshoterEvent`)
- Types para parâmetros complexos
- Usar tipos do Electron quando disponíveis

### Padrões de Imports

#### Ordem de Imports
1. Imports de bibliotecas externas
2. Imports de `@electron-toolkit/*`
3. Imports de módulos Node.js (`node:*`)
4. Imports de Electron
5. Imports relativos do projeto

#### Exemplos
```typescript
import { electronApp, optimizer, platform } from "@electron-toolkit/utils"
import { app, BrowserWindow, globalShortcut } from "electron"
import path from "node:path"
import { DatabaseManager } from "../database/manager"
```

### Padrões de Constantes

#### Arquivos de Constantes
- Agrupar constantes relacionadas em objetos
- Usar `export const` para objetos de configuração
- Valores em UPPER_SNAKE_CASE dentro dos objetos

```typescript
export const settings = {
	ELECTRON_RENDERER_URL_KEY: "ELECTRON_RENDERER_URL",
	ELECTRON_APP_ICON: icon,
	ELECTRON_APP_NAME: "Screenshoter",
}
```

### Padrões de Tratamento de Erros

#### Notificações
- Usar classes utilitárias para dispatch de notificações
- `NotificationDispatcher.dispatch()` para notificações simples
- `DispatcherSuccessNotification.dispatch()` para notificações de sucesso

#### Logs
- Usar `console.error()` para erros
- Usar `console.log()` para logs informativos

### Padrões de Build

#### Electron Vite
- Externalizar dependências nativas (`better-sqlite3`)
- Usar `externalizeDepsPlugin()` para main e preload
- Configuração separada para main, preload e renderer

#### Scripts
- `dev`: Desenvolvimento com hot reload
- `build`: Build de produção com typecheck
- `build:mac/win/linux`: Builds específicos por plataforma

## Convenções Adicionais

### Platform-Specific Code
- Usar `platform.isMacOS`, `platform.isWindows`, `platform.isLinux` do `@electron-toolkit/utils`
- Agrupar código específico de plataforma em blocos condicionais

### File System
- Usar `app.getPath()` para caminhos do sistema
- Criar diretórios com `fs.mkdirSync(directory, { recursive: true })`
- Verificar existência com `fs.existsSync()`

### Window Management
- Sempre verificar se a janela não foi destruída antes de usar
- Usar `alwaysOnTop: true` para janelas flutuantes
- `skipTaskbar: true` para janelas que não devem aparecer na taskbar
- `transparent: true` e `frame: false` para janelas customizadas

## Checklist para Novos Arquivos

- [ ] Nome do arquivo em kebab-case
- [ ] Classe em PascalCase com sufixo apropriado
- [ ] Métodos estáticos quando aplicável
- [ ] Imports organizados (Biome organiza automaticamente)
- [ ] Formatação com tabs e aspas duplas
- [ ] TypeScript strict habilitado
- [ ] Tratamento de erros apropriado
- [ ] Notificações para feedback do usuário quando necessário

