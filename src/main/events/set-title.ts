import { BrowserWindow, ipcMain } from 'electron'
import { GlobalsIPC } from '../../shared/communication/ipc/globals'
import { settings } from '../constants/settings'

export class SetTitleEvents {
  static register() {
    ipcMain.on(GlobalsIPC.SET_TITLE, (event, { title }) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (window) {
        window.setTitle(`${title} | ${settings.ELECTRON_APP_NAME}`)
      }
    })
  }
}
