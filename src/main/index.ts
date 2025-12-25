import { electronApp, optimizer, platform } from '@electron-toolkit/utils'
import { app, BrowserWindow, globalShortcut, net, protocol } from 'electron'

import { settings } from './constants/settings'
import { BootstrapDatabase } from './database/init'
import { EscapeEvent } from './events/escape'
import { LibraryEvents } from './events/library'
import { SettingsEvents } from './events/settings'
import { PrintShortcut } from './shortcuts/print'
import { QuitState } from './states/quit'

import { TrayWindow } from './ui/tray'
import { DockEvent } from './events/dock'
import { PrintEvent } from './events/print'
import { NotificationEvent } from './events/notification'
import { SetTitleEvents } from './events/set-title'
import { GlobalEvent } from './events/global'

app.setAboutPanelOptions({
  applicationName: settings.ELECTRON_APP_NAME,
  applicationVersion: settings.ELECTRON_APP_VERSION,
  version: settings.ELECTRON_APP_VERSION,
  copyright: settings.ELECTRON_APP_AUTHOR,
  website: settings.ELECTRON_APP_WEBSITE,
  iconPath: settings.ELECTRON_APP_ICON,
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.pedroaba.screenshoter')
  BootstrapDatabase.bootstrap()

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  protocol.handle('media', (req) => {
    const path = req.url.slice('media://'.length)
    return net.fetch(`file://${path}`)
  })

  if (platform.isMacOS) {
    app.dock?.setIcon(settings.ELECTRON_APP_ICON)
  }

  TrayWindow.create()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      TrayWindow.create()
    }
  })

  PrintShortcut.register()

  EscapeEvent.register()
  LibraryEvents.register()
  SettingsEvents.register()
  DockEvent.register()
  PrintEvent.register()
  NotificationEvent.register()
  SetTitleEvents.register()
  GlobalEvent.register()
})

app.on('before-quit', () => {
  QuitState.state = true
  globalShortcut.unregisterAll()

  BrowserWindow.getAllWindows().forEach((window) => {
    window.close()
  })
})

app.on('window-all-closed', function () {
  // DO NOTHING
})
