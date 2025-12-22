import { ipcMain } from 'electron'
import { GlobalsIPC } from '../../shared/communication/ipc/globals'
import { OverlayState } from '../states/overlay'

export class GlobalEvent {
  static register() {
    ipcMain.on(GlobalsIPC.READY_TO_TAKE_PRINT, (_, data) => {
      OverlayState.get().forEach((overlay) => {
        overlay.webContents.send(GlobalsIPC.MODE_CHANGED, data)
      })
    })

    ipcMain.on(GlobalsIPC.MODE_CHANGED, (_, data) => {
      OverlayState.get().forEach((overlay) => {
        overlay.webContents.send(GlobalsIPC.MODE_CHANGED, data)
      })
    })
  }
}
