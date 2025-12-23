import path from 'node:path'
import { BrowserWindow } from 'electron'

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

    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,

      sandbox: false,
      ...webPreferences,
    },

    ...options,
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
  const mainWindow = createWindow({
    id: 'library',
  })

  mainWindow.on('closed', () => {
    BrowserWindow.getAllWindows().forEach((browserWindow) => {
      browserWindow.close()
    })
  })
}

export function createSettingsWindow() {
  const settingsWindow = createWindow({
    id: 'settings',
  })

  settingsWindow.on('closed', () => {
    BrowserWindow.getAllWindows().forEach((browserWindow) => {
      browserWindow.close()
    })
  })
}
