import {
  app,
  Menu,
  nativeImage,
  Tray,
  type MenuItemConstructorOptions,
} from 'electron'
import { settings } from '../constants/settings'
import { GetTrayIconSize } from '../utils/get-tray-icon-size'
import { createLibraryScreen, createSettingsWindow } from './create-window'
import { platform } from '@electron-toolkit/utils'

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

    const globalMenu: MenuItemConstructorOptions[] = [
      {
        label: '📚 Library',
        click: () => {
          createLibraryScreen()
        },
      },
      {
        label: '⚙️ Settings',
        click: () => {
          createSettingsWindow()
        },
      },
    ]

    const menu = Menu.buildFromTemplate([
      { label: 'Treenshoter 📸', type: 'header' },
      ...globalMenu,
      { type: 'separator' },
      { role: 'about', label: 'About Treenshoter' },
      { type: 'separator' },
      {
        label: 'Quit Treenshoter?',
        role: 'quit',
      },
    ])

    TrayWindow._instance.setContextMenu(menu)
    if (platform.isMacOS) {
      app.dock?.setMenu(Menu.buildFromTemplate(globalMenu))
    }

    return TrayWindow._instance
  }
}
