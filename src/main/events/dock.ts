import { ipcMain } from 'electron'
import { DockIPC } from '../../shared/communication/ipc/dock'
import { createLibraryScreen, createSettingsWindow } from '../ui/create-window'
import { OverlayState } from '../states/overlay'
import { CloseAllWindowsUtil } from '../utils/close-all-windows'

export class DockEvent {
  static register() {
    ipcMain.handle(DockIPC.OPEN_SETTINGS_SCREEN, () => {
      CloseAllWindowsUtil.execute()

      createSettingsWindow()
      OverlayState.clear()
    })

    ipcMain.handle(DockIPC.OPEN_LIBRARY_SCREEN, () => {
      CloseAllWindowsUtil.execute()

      createLibraryScreen()
      OverlayState.clear()
    })
  }
}
