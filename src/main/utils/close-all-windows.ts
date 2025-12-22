import { BrowserWindow } from 'electron'
import { PreviewState } from '../states/preview'

export class CloseAllWindowsUtil {
  static execute() {
    BrowserWindow.getAllWindows().forEach((browserWindow) => {
      browserWindow.close()
    })

    PreviewState.clearImageId()
  }
}
