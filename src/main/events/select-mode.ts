import { ipcMain } from 'electron'
import { PrintscreenModeState } from '../states/mode'
// import { OverlaysManager } from "../ui/overlay"

export class SelectModeEvent {
  private static mapModeToOverlay(mode: string): 'fullscreen' | 'area' {
    // Map dock modes to overlay modes
    if (mode === 'partialscreen' || mode === 'record-partial') {
      return 'area'
    }
    if (mode === 'record') {
      return 'fullscreen'
    }
    // Default: fullscreen or area
    return mode === 'area' ? 'area' : 'fullscreen'
  }

  private static sendModeToOverlays(mode: string): void {
    const overlayMode = SelectModeEvent.mapModeToOverlay(mode)
    // const overlays = OverlaysManager.gets()
    // console.log("[main] overlays encontrados:", overlays.length)

    // overlays.forEach((overlay) => {
    // 	console.log("[main] enviando para overlay", overlay.webContents.id, "modo:", overlayMode)
    // 	overlay.webContents.send("electron:screenshoter:mode-select", overlayMode)
    // })
  }

  static register() {
    ipcMain.on('electron:screenshoter:mode-select', (_, mode) => {
      console.log('[main] mode-select recebido:', mode)

      PrintscreenModeState.set(mode)
      SelectModeEvent.sendModeToOverlays(mode)
    })

    ipcMain.handle('electron:screenshoter:get-current-mode', () => {
      return PrintscreenModeState.get()
    })
  }
}
