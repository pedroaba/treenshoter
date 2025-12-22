import { platform } from '@electron-toolkit/utils'
import {
  clipboard,
  desktopCapturer,
  ipcMain,
  screen,
  shell,
  systemPreferences,
} from 'electron'
import { InsertOp } from '../database/fns/insert'
import { DatabaseManager } from '../database/manager'
import { PictureManager } from '../pictures/manager'
// import { DockWindow } from "../ui/dock"
// import { PreviewWindow } from "../ui/preview"
import { NotificationDispatcher } from '../utils/dispatch-simple-notifications'
import { DispatcherSuccessNotification } from './utils/dispatch-success-notification'

export class PrintFullscreenEvent {
  static register() {
    ipcMain.handle('electron:screenshoter:fullscreen', async () => {
      if (platform.isMacOS) {
        const status = systemPreferences.getMediaAccessStatus('screen')

        if (status !== 'granted') {
          try {
            await shell.openExternal(
              'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture',
            )
          } catch (err) {
            console.error('Failed to open ScreenCapture preferences:', err)
          }

          NotificationDispatcher.dispatch({
            title: 'Permission denied',
            body: 'To capture the screen, enable "Screen Recording" for this app in: System Preferences → Privacy and Security → Screen Recording.',
          })

          return
        }
      }

      // DockWindow.toggle()

      const cursorPosition = screen.getCursorScreenPoint()
      const display = screen.getDisplayNearestPoint(cursorPosition)

      const captureWidth = Math.round(display.size.width * display.scaleFactor)
      const captureHeight = Math.round(
        display.size.height * display.scaleFactor,
      )

      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: captureWidth,
          height: captureHeight,
        },
      })

      const source = sources.find(
        (source) => source.display_id === String(display.id),
      )

      if (!source) {
        NotificationDispatcher.dispatch({
          title: 'Failed to find screen source',
          body: 'Please try again later, check your display settings.',
        })

        return
      }

      let image = source.thumbnail

      const sizeActual = image.getSize()
      if (
        sizeActual.width !== captureWidth ||
        sizeActual.height !== captureHeight
      ) {
        image = image.resize({
          width: captureWidth,
          height: captureHeight,
        })
      }

      const pngBuffer = image.toPNG()

      const filepath = PictureManager.save(pngBuffer)
      let screenshotId: number | null = null
      if (filepath) {
        const database = DatabaseManager.getInstance()
        const { width, height } = image.getSize()
        screenshotId = InsertOp.execute(database, {
          items: {
            filepath,
            size: pngBuffer.length,
            width,
            height,
          },
          table: 'screenshots',
        })
      }

      clipboard.writeImage(image)
      DispatcherSuccessNotification.dispatch(image, filepath)

      if (screenshotId !== null) {
        // PreviewWindow.create(screenshotId)
      }

      return {}
    })
  }
}
