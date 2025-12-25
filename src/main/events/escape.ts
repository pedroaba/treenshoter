import { ipcMain } from 'electron'
import { GlobalsIPC } from '../../shared/communication/ipc/globals'
import { CloseAllWindowsUtil } from '../utils/close-all-windows'
// import { DockWindow } from "../ui/dock"

export class EscapeEvent {
  static register() {
    ipcMain.on(GlobalsIPC.ESCAPE, () => {
      CloseAllWindowsUtil.execute()
    })
  }
}
