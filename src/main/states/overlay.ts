import type { BrowserWindow } from 'electron'

export class OverlayState {
  private static overlays: BrowserWindow[] = []

  static add(overlay: BrowserWindow) {
    OverlayState.overlays.push(overlay)
    overlay.on('closed', () => {
      OverlayState.remove(overlay)
    })
  }

  static remove(overlay: BrowserWindow) {
    OverlayState.overlays = OverlayState.overlays.filter((o) => o !== overlay)
    overlay.destroy()
  }

  static get() {
    return OverlayState.overlays
  }

  static clear() {
    OverlayState.overlays.forEach((overlay) => {
      overlay.destroy()
    })

    OverlayState.overlays = []
  }
}
