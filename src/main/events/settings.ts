import { dialog, ipcMain } from 'electron'
import { SettingsIPC } from '../../shared/communication/ipc/settings'
import { PictureManager } from '../pictures/manager'
import { store } from '../store/settings'

export class SettingsEvents {
  static register() {
    ipcMain.handle(SettingsIPC.GET_CONFIGS, () => {
      return {
        default_save_directory: PictureManager.getdir(),
      }
    })

    ipcMain.handle(SettingsIPC.SELECT_FOLDER, async () => {
      const result = await dialog.showOpenDialog({
        title: 'Select Folder',
        defaultPath: PictureManager.getdir(),
        properties: ['openDirectory'],
        buttonLabel: 'Select',
        message: 'Select the folder where you want to save your screenshots',
      })

      if (result.canceled || !result.filePaths.length) {
        return null
      }

      return {
        directory: result.filePaths[0],
      }
    })

    ipcMain.on(SettingsIPC.SET, (_, settings) => {
      for (const [key, value] of Object.entries(settings)) {
        store.set(key, value)
      }
    })
  }
}
