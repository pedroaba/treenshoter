import { ipcMain } from 'electron'
// import { DockWindow } from "../ui/dock"

export class EscapeEvent {
  static register() {
    ipcMain.on('electron:screenshoter:escape', () => {
      // DockWindow.toggle()
    })
  }
}
