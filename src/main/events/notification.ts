import { ipcMain } from 'electron'
import { GlobalsIPC } from '../../shared/communication/ipc/globals'
import { NotificationDispatcher } from '../utils/dispatch-simple-notifications'

export class NotificationEvent {
  static register() {
    ipcMain.handle(GlobalsIPC.NOTIFY, (_, params) => {
      NotificationDispatcher.dispatch(params)
    })
  }
}
