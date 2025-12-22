import { ipcMain } from 'electron'
// import { LibraryWindow } from "../ui/library"

export class OpenLibraryEvent {
  static register() {
    ipcMain.on('electron:screenshoter:open-library', () => {
      // LibraryWindow.toggle()
    })
  }
}
