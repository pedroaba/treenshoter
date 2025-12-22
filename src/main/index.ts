import { electronApp, optimizer, platform } from '@electron-toolkit/utils'
import { app, BrowserWindow, globalShortcut, net, protocol } from 'electron'

import { settings } from './constants/settings'
import { BootstrapDatabase } from './database/init'
import { EscapeEvent } from './events/escape'
import { FinishSelectionEvent } from './events/finish-selection'
import { LibraryEvents } from './events/library'
import { OpenLibraryEvent } from './events/open-library'
import { PrintFullscreenEvent } from './events/print-full-screen'
import { SelectModeEvent } from './events/select-mode'
import { SettingsEvents } from './events/settings'
import { PrintShortcut } from './shortcuts/print'
import { QuitState } from './states/quit'

import { TrayWindow } from './ui/tray'
import { DockEvent } from './events/dock'
import { PrintEvent } from './events/print'
import { NotificationEvent } from './events/notification'

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

  PrintFullscreenEvent.register()
  SelectModeEvent.register()
  EscapeEvent.register()
  FinishSelectionEvent.register()
  LibraryEvents.register()
  OpenLibraryEvent.register()
  SettingsEvents.register()
  DockEvent.register()
  PrintEvent.register()
  NotificationEvent.register()
})

app.on('before-quit', () => {
  QuitState.state = true
  globalShortcut.unregisterAll()

  BrowserWindow.getAllWindows().forEach((window) => {
    window.close()
  })
})

app.on('window-all-closed', () => {})
