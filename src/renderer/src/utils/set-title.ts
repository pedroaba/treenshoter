import { GlobalsIPC } from '../../../shared/communication/ipc/globals'

export class SetTitleUtils {
  static set(title: string) {
    window.document.title = title

    window.electron.ipcRenderer.send(GlobalsIPC.SET_TITLE, {
      title,
    })
  }
}
