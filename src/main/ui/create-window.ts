import path from 'node:path'
import { app, BrowserWindow } from 'electron'
import { platform } from '@electron-toolkit/utils'

import { registerRoute } from '../../../routers'

type Route = Parameters<typeof registerRoute>[0]

interface WindowProps extends Electron.BrowserWindowConstructorOptions {
  id: Route['id']
  query?: Route['query']
}

export function createWindow(
  { id, query, ...options }: Omit<WindowProps, 'webPreferences'>,
  webPreferences?: WindowProps['webPreferences'],
) {
  const window = new BrowserWindow({
    minWidth: 800,
    show: false,
    resizable: true,
    alwaysOnTop: true,
    ...options,

    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,

      sandbox: false,
      ...webPreferences,
    },
  })

  registerRoute({
    id,
    query,
    browserWindow: window,
    htmlFile: path.join(__dirname, '../renderer/index.html'),
  })

  window.on('ready-to-show', () => {
    window.show()
  })

  return window
}

export function createLibraryScreen() {
  if (platform.isMacOS) {
    app.dock?.show()
  }

  const mainWindow = createWindow({
    id: 'library',
    alwaysOnTop: false,
  })

  mainWindow.on('closed', () => {
    BrowserWindow.getAllWindows().forEach((browserWindow) => {
      browserWindow.close()
    })
  })
}

export function createSettingsWindow() {
  if (platform.isMacOS) {
    app.dock?.show()
  }

  const settingsWindow = createWindow({
    id: 'settings',
    alwaysOnTop: false,
  })

  settingsWindow.on('closed', () => {
    BrowserWindow.getAllWindows().forEach((browserWindow) => {
      browserWindow.close()
    })
  })
}

export function createPreviewWindow() {
  if (platform.isMacOS) {
    app.dock?.show()
  }

  createWindow(
    {
      id: 'preview',
      width: 1000,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      show: false,
      autoHideMenuBar: true,
      backgroundColor: '#09090b',
      alwaysOnTop: false,
    },
    {
      webSecurity: false,
    },
  )
}
