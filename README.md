# Screenshoter

> Minimalist Electron app to quickly capture, manage, and organize your screenshots.

Screenshoter is a cross-platform desktop application built with Electron that provides a fast and intuitive way to capture, edit, and manage screenshots. It features instant screen capture, region selection, clipboard integration, a screenshot library with preview and editing capabilities, and seamless cross-platform support.

## Features

### Core Functionality

- **Fullscreen Capture**: Capture the entire screen with a single click or keyboard shortcut
- **Partial Screen Capture**: Select and capture specific regions of your screen
- **Global Keyboard Shortcuts**: 
  - macOS: `Command+Shift+S`
  - Windows/Linux: `Super+Shift+S`
- **Automatic Clipboard Copy**: Screenshots are automatically copied to clipboard
- **Screenshot Library**: View all your screenshots in a beautiful masonry grid layout
- **Preview & Edit**: Open screenshots in a preview window with drawing tools
- **Detail View**: View screenshots in full detail with metadata
- **Drawing Tools**: Annotate screenshots with:
  - Pen (freehand drawing)
  - Rectangle
  - Circle
  - Line
  - Arrow
  - Customizable colors and brush sizes
- **Zoom & Pan**: Navigate large screenshots with zoom and pan controls
- **Screenshot Management**:
  - Delete screenshots
  - Rename screenshots (updates filename)
  - Copy to clipboard
  - Save as (export to different location)
  - Show in folder
- **Customizable Settings**:
  - Choose default save directory
  - Automatic directory creation
- **System Tray Integration**: Access the app from the system tray
- **Multi-Monitor Support**: Works seamlessly across multiple displays
- **Cross-Platform**: Native support for Windows, macOS, and Linux

## Technologies

### Core Stack

- **Framework**: [Electron](https://www.electronjs.org/) ^39.2.6
- **Frontend**: 
  - [React](https://react.dev/) ^19.2.1
  - [TypeScript](https://www.typescriptlang.org/) ^5.9.3
  - [Tailwind CSS](https://tailwindcss.com/) ^4.1.17
- **Build Tools**:
  - [Vite](https://vitejs.dev/) ^7.2.6
  - [Electron Vite](https://electron-vite.org/) ^5.0.0
  - [Electron Builder](https://www.electron.build/) ^26.0.12

### Additional Libraries

- **Database**: SQLite via `node:sqlite` (native, synchronous)
- **Query Builder**: [sql-bricks](https://github.com/CSNW/sql-bricks) ^3.0.1
- **State Management**: [electron-store](https://github.com/sindresorhus/electron-store) ^11.0.2
- **Routing**: 
  - [electron-router-dom](https://github.com/electron-vite/electron-router-dom) ^2.1.0
  - [react-router-dom](https://reactrouter.com/) ^7.10.1
- **UI Components**:
  - [Lucide React](https://lucide.dev/) ^0.561.0 (icons)
  - [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) (styling utilities)
- **Toolkit**: [@electron-toolkit](https://github.com/alex8088/electron-toolkit) (preload, utils, configs)

## Architecture

### Project Structure

```
treenshoter/
├── src/
│   ├── main/              # Electron main process
│   │   ├── constants/     # App constants (settings, shortcuts)
│   │   ├── database/      # SQLite database management
│   │   │   ├── fns/       # Database operations (insert, update)
│   │   │   ├── migrations/# Database migrations (v1, v2, v3)
│   │   │   ├── init.ts    # Database bootstrap
│   │   │   └── manager.ts # Database singleton
│   │   ├── events/        # IPC event handlers
│   │   │   ├── dock.ts
│   │   │   ├── escape.ts
│   │   │   ├── finish-selection.ts
│   │   │   ├── library.ts
│   │   │   ├── print.ts   # Screenshot capture logic
│   │   │   ├── settings.ts
│   │   │   └── utils/     # Event utilities
│   │   ├── permission/    # Permission management (screen recording)
│   │   ├── pictures/      # Image file management
│   │   ├── shortcuts/     # Global keyboard shortcuts
│   │   ├── states/        # Global state management
│   │   ├── store/         # Persistent settings storage
│   │   ├── ui/            # Window and tray creation
│   │   ├── utils/         # Utility functions
│   │   └── index.ts       # Main entry point
│   ├── preload/           # Context bridge scripts
│   │   └── index.ts       # Preload script
│   ├── renderer/          # React frontend
│   │   └── src/
│   │       ├── screens/   # Main application screens
│   │       │   ├── library.tsx    # Screenshot library
│   │       │   ├── settings.tsx   # Settings screen
│   │       │   ├── overlay.tsx   # Overlay for selection
│   │       │   ├── dock.tsx      # Dock toolbar
│   │       │   ├── preview.tsx   # Preview with editing
│   │       │   └── detail.tsx    # Detail view
│   │       ├── components/        # React components
│   │       │   ├── library/      # Library components
│   │       │   ├── preview/      # Preview components
│   │       │   ├── detail/       # Detail components
│   │       │   └── ui/           # Shared UI components
│   │       ├── utils/            # Frontend utilities
│   │       ├── routes.tsx        # Route definitions
│   │       └── main.tsx          # React entry point
│   └── shared/            # Shared code between main and renderer
│       ├── communication/ipc/   # IPC channel definitions
│       ├── enum/                # Shared enums
│       └── types/               # TypeScript types
├── build/                 # Build assets (icons, entitlements)
├── resources/             # App resources
└── electron.vite.config.ts # Vite configuration
```

### Main Process (`src/main/`)

The main process handles all system-level operations:

- **Database Management**: SQLite database with migration system
- **IPC Handlers**: Communication bridge between main and renderer processes
- **Window Management**: Creates and manages multiple window types (library, settings, preview, detail, overlay, dock)
- **Screenshot Capture**: Uses Electron's `desktopCapturer` API for screen capture
- **File Management**: Saves screenshots to configured directory
- **Global Shortcuts**: Registers system-wide keyboard shortcuts
- **System Tray**: Creates and manages system tray icon
- **Permissions**: Handles screen recording permissions (especially on macOS)

### Renderer Process (`src/renderer/`)

The renderer process contains the React frontend:

- **Screens**: Six main screens for different functionalities
- **Components**: Reusable React components
- **Drawing System**: Canvas-based drawing tools for annotation
- **Zoom System**: Image zoom and pan functionality
- **State Management**: React hooks for local state

### IPC Communication

The app uses Electron's IPC (Inter-Process Communication) for secure communication:

- **Channels**: Prefixed with `electron:screenshoter:*` or `electron:library:*`
- **Main Process**: Uses `ipcMain.handle()` for async operations and `ipcMain.on()` for events
- **Renderer Process**: Uses `ipcRenderer.invoke()` for calls with responses and `ipcRenderer.send()` for events
- **Preload**: Exposes safe API via `contextBridge.exposeInMainWorld("api", api)`

## How It Works

### Application Flow

1. **Initialization**:
   - App starts and initializes SQLite database
   - Registers global keyboard shortcut
   - Creates system tray icon
   - Sets up IPC handlers

2. **Screenshot Capture**:
   - User presses global shortcut (`Command+Shift+S` / `Super+Shift+S`)
   - Overlay windows are created on all displays
   - Dock window appears at bottom of primary screen
   - User selects mode (Fullscreen or Partial Screen)
   - For Partial Screen: User drags to select region
   - Screenshot is captured using `desktopCapturer`
   - Image is saved to configured directory
   - Screenshot metadata is stored in SQLite database
   - Image is copied to clipboard
   - Preview window opens automatically

3. **Screenshot Management**:
   - Library screen displays all screenshots in masonry grid
   - User can view, edit, delete, rename, or export screenshots
   - Preview screen allows annotation with drawing tools
   - Changes are saved back to the file system

### Database Schema

The SQLite database stores screenshot metadata:

```sql
CREATE TABLE screenshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filepath TEXT NOT NULL,
  title TEXT,
  size INTEGER NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  mimetype TEXT NOT NULL DEFAULT 'image/png',
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Screenshot Type

```typescript
interface Screenshot {
  id: number
  filepath: string
  title: string | null
  width: number
  height: number
  size: number
  timestamp: string
}
```

## Installation & Development

### Prerequisites

- **Node.js**: v18 or higher
- **pnpm**: Package manager (install with `npm install -g pnpm`)

### Install Dependencies

```bash
pnpm install
```

### Development

Start the development server with hot reload:

```bash
pnpm dev
```

### Type Checking

Check TypeScript types for both main and renderer processes:

```bash
pnpm typecheck
```

Or individually:

```bash
pnpm typecheck:node  # Main process
pnpm typecheck:web   # Renderer process
```

### Build

Build the application for production:

```bash
# Build for current platform
pnpm build

# Build for specific platforms
pnpm build:mac      # macOS
pnpm build:win      # Windows
pnpm build:linux    # Linux

# Build unpacked (for testing)
pnpm build:unpack
```

### Linting & Formatting

```bash
pnpm lint      # Run ESLint
pnpm format    # Format with Prettier
```

## Usage

### Taking Screenshots

1. **Press the global shortcut**: `Command+Shift+S` (macOS) or `Super+Shift+S` (Windows/Linux)
2. **Select capture mode**:
   - **Fullscreen**: Click the fullscreen button or click anywhere on the overlay
   - **Partial Screen**: Click the partial screen button, then drag to select a region
3. **Screenshot is captured**: Automatically saved, copied to clipboard, and preview window opens

### Using the Library

- **Open Library**: Click "Library" in the dock or system tray menu
- **View Screenshots**: Browse all screenshots in a masonry grid
- **Actions**:
  - Click a screenshot to open detail view
  - Right-click for context menu (delete, copy, save as, show in folder)
  - Edit title by clicking on the title field

### Editing Screenshots

1. **Open Preview**: Automatically opens after capture, or click a screenshot in library
2. **Select Tool**: Choose from pen, rectangle, circle, line, or arrow
3. **Customize**: Select color and brush size
4. **Draw**: Click and drag on the image
5. **Zoom**: Use `Ctrl/Cmd + Scroll` to zoom, drag to pan
6. **Save**: Click save to update the screenshot file

### Settings

- **Open Settings**: Click "Settings" in dock or system tray
- **Configure**:
  - Default screenshot save directory
  - Other preferences (as available)

### System Tray

- **Access**: Right-click the tray icon
- **Options**:
  - Open Library
  - Open Settings
  - Quit

## Code Patterns

### Naming Conventions

- **Classes**: PascalCase with specific suffixes:
  - `Manager` - Singleton managers
  - `Window` - Window classes
  - `Event` - IPC event handlers
  - `Op` - Database operations
  - `State` - Global state classes
- **Methods/Variables**: camelCase
- **Files**: kebab-case
- **Constants**: UPPER_SNAKE_CASE in object properties

### Class Structure

- **Managers**: Singleton with static `getInstance()` method
- **Windows**: Static class with private `_instance`, methods `create()`, `toggle()`, `hide()`
- **Events**: Static class with `register()` method that registers IPC handlers
- **States**: Static class with getter/setter for private property
- **Operations**: Static class with `execute()` method that receives database and params

### IPC Patterns

- **Channels**: `electron:screenshoter:*` or `electron:library:*`
- **Main**: `ipcMain.handle()` for async with return, `ipcMain.on()` for events
- **Renderer**: `ipcRenderer.invoke()` for calls with response, `ipcRenderer.send()` for events
- **Preload**: Expose via `contextBridge.exposeInMainWorld("api", api)`

### Formatting

The project uses Biome for formatting (configured to use tabs, double quotes, semicolons as needed).

### Import Organization

Order: 1) External libraries, 2) @electron-toolkit/*, 3) node:*, 4) Electron, 5) Relative imports

## Database Migrations

The app uses a migration system to manage database schema changes:

- **v1**: Initial schema with screenshots table
- **v2**: Added `title` column to screenshots
- **v3**: Added default settings (save directory, font size)

Migrations run automatically on app startup via `BootstrapDatabase.bootstrap()`.

## Platform-Specific Features

- **macOS**: 
  - Screen recording permission handling
  - Dock icon configuration
  - Workspace visibility settings
- **Windows/Linux**: 
  - Alternative keyboard shortcuts
  - Platform-specific window behaviors

## Contributing

This project follows specific coding patterns and conventions. Please refer to the `.cursor/rules/` directory for detailed guidelines on:

- Naming conventions
- Class structure patterns
- IPC communication patterns
- Code formatting standards

## License

Copyright (c) 2024 pedroaba. All Rights Reserved.

This software is proprietary and confidential. No part of this software may be copied, reproduced, distributed, modified, or used in any manner whatsoever without the prior written permission of the copyright holder.

See [LICENSE](LICENSE) for full terms and restrictions.

## Author

pedroaba <pedr.augustobarbosa.aparecido@gmail.com>

---

**Version**: 1.0.0
