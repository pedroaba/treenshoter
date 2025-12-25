import { platform } from '@electron-toolkit/utils'
import { app, globalShortcut, Notification } from 'electron'
import { shortcuts } from '../constants/shortcuts'
import { GetScreensUtil } from '../utils/get-screens'
import { OverlayState } from '../states/overlay'
import { createWindow } from '../ui/create-window'
import { GlobalsIPC } from '../../shared/communication/ipc/globals'
import { PrintscreenModeState } from '../states/mode'

export class PrintShortcut {
  static register() {
    let shortcut = shortcuts.print.mac
    if (platform.isWindows || platform.isLinux) {
      shortcut = shortcuts.print.windows
    }

    globalShortcut.unregisterAll()
    const registered = globalShortcut.register(shortcut, () => {
      const screens = GetScreensUtil.get()

      screens.forEach((display) => {
        const overlay = createWindow({
          id: 'overlay',
          x: display.bounds.x,
          y: display.bounds.y,
          width: display.bounds.width,
          height: display.bounds.height,
          frame: false,
          transparent: true,
          resizable: false,
          movable: false,
          alwaysOnTop: true,
          skipTaskbar: true,
          hasShadow: false,
          backgroundColor: '#00000000',
        })

        overlay.setSkipTaskbar(true)
        overlay.setAlwaysOnTop(true, 'floating')

        OverlayState.add(overlay)

        setTimeout(() => {
          overlay.webContents.send(GlobalsIPC.READY_TO_TAKE_PRINT, {
            mode: PrintscreenModeState.get(),
          })
        }, 500)
      })

      const primaryDisplay = GetScreensUtil.getScreenByCursor()
      const { width, height } = primaryDisplay.workAreaSize

      const winHeight = 60
      const winWidth = Math.min(600, width - 40)

      const x = Math.round(primaryDisplay.workArea.x + (width - winWidth) / 2)
      const y = Math.round(primaryDisplay.workArea.y + height - winHeight - 10)

      const dockWindow = createWindow({
        id: 'dock',
        width: winWidth,
        height: winHeight,
        x,
        y,
        frame: false,
        transparent: true,
        resizable: false,
        movable: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        hasShadow: false,
        backgroundColor: '#00000000',
        show: false,
      })

      dockWindow.setAlwaysOnTop(true, 'screen-saver')

      if (platform.isMacOS) {
        dockWindow.setVisibleOnAllWorkspaces(true, {
          visibleOnFullScreen: true,
        })
      }

      dockWindow.setAlwaysOnTop(true, 'screen-saver')
    })

    if (!registered) {
      new Notification({
        title: 'Failed to register print shortcut',
        body: 'Please try again later',
      }).show()

      app.quit()
    }
  }
}
