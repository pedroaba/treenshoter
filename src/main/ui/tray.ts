import { app, Menu, nativeImage, Tray } from 'electron'
import { settings } from '../constants/settings'
import { QuitState } from '../states/quit'
import { GetTrayIconSize } from '../utils/get-tray-icon-size'
import { createLibraryScreen, createSettingsWindow } from './create-window'
// import { LibraryWindow } from './library'
// import { SettingsWindow } from './settings'

export class TrayWindow {
  private static _instance: Tray | null = null

  static create() {
    if (TrayWindow._instance) {
      return TrayWindow._instance
    }

    let icon = nativeImage.createFromPath(settings.ELECTRON_APP_ICON)

    const iconSize = GetTrayIconSize.execute()
    icon = icon.resize({
      width: iconSize.width,
      height: iconSize.height,
    })

    icon.setTemplateImage(true)

    TrayWindow._instance = new Tray(icon)
    TrayWindow._instance.setToolTip(settings.ELECTRON_APP_NAME)

    const menu = Menu.buildFromTemplate([
      {
        label: 'Library',
        click: () => {
          createLibraryScreen()
        },
      },
      {
        label: 'Settings',
        click: () => {
          createSettingsWindow()
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          QuitState.state = true
          app.quit()
        },
      },
    ])

    TrayWindow._instance.setContextMenu(menu)
    return TrayWindow._instance
  }
}
