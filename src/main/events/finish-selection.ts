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

export class FinishSelectionEvent {
  static register() {
    ipcMain.handle(
      'electron:screenshoter:finish-selection',
      async (_, { selection }) => {
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

        const scaleFactor = display.scaleFactor
        const captureWidth = Math.round(display.size.width * scaleFactor)
        const captureHeight = Math.round(display.size.height * scaleFactor)

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

        const cropRect = {
          x: Math.round(selection.x * scaleFactor),
          y: Math.round(selection.y * scaleFactor),
          width: Math.round(selection.width * scaleFactor),
          height: Math.round(selection.height * scaleFactor),
        }

        if (
          cropRect.width <= 0 ||
          cropRect.height <= 0 ||
          cropRect.x < 0 ||
          cropRect.y < 0 ||
          cropRect.x + cropRect.width > image.getSize().width ||
          cropRect.y + cropRect.height > image.getSize().height
        ) {
          NotificationDispatcher.dispatch({
            title: 'Invalid selection region',
            body: 'Please try selecting a smaller area inside the screen.',
          })

          return
        }

        const croppedImage = image.crop(cropRect)
        const pngBuffer = croppedImage.toPNG()

        const filepath = PictureManager.save(pngBuffer)
        let screenshotId: number | null = null
        if (filepath) {
          const database = DatabaseManager.getInstance()
          screenshotId = InsertOp.execute(database, {
            items: {
              filepath,
              size: pngBuffer.length,
              width: cropRect.width,
              height: cropRect.height,
            },
            table: 'screenshots',
          })
        }

        clipboard.writeImage(croppedImage)
        DispatcherSuccessNotification.dispatch(croppedImage, filepath)

        if (screenshotId !== null) {
          // PreviewWindow.create(screenshotId)
        }

        return {}
      },
    )
  }
}
