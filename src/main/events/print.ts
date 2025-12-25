import { BrowserWindow, clipboard, desktopCapturer, ipcMain } from 'electron'
import { PrintIPC } from '../../shared/communication/ipc/print'
import { PrintscreenModeState } from '../states/mode'
import { PrintScreenMode } from '../../shared/enum/print-screen-mode'
import { ScreenPermission } from '../permission/screen'
import { GetScreensUtil } from '../utils/get-screens'
import { NotificationDispatcher } from '../utils/dispatch-simple-notifications'
import { DatabaseManager } from '../database/manager'
import { PictureManager } from '../pictures/manager'
import { InsertOp } from '../database/fns/insert'
import { DispatcherSuccessNotification } from './utils/dispatch-success-notification'
import { GlobalsIPC } from '../../shared/communication/ipc/globals'
import { OverlayState } from '../states/overlay'
import { CloseAllWindowsUtil } from '../utils/close-all-windows'
import { createPreviewWindow } from '../ui/create-window'

import { PreviewState } from '../states/preview'

export class PrintEvent {
  static register() {
    ipcMain.handle(PrintIPC.SET_PARTIAL_SCREEN_PRINT, () => {
      PrintscreenModeState.set(PrintScreenMode.PARTIAL_SCREEN)

      OverlayState.get().forEach((overlay) => {
        overlay.webContents.send(GlobalsIPC.MODE_CHANGED, {
          mode: PrintScreenMode.PARTIAL_SCREEN,
        })
      })
    })

    ipcMain.handle(PrintIPC.SET_FULLSCREEN_PRINT, () => {
      PrintscreenModeState.set(PrintScreenMode.FULLSCREEN)

      OverlayState.get().forEach((overlay) => {
        overlay.webContents.send(GlobalsIPC.MODE_CHANGED, {
          mode: PrintScreenMode.FULLSCREEN,
        })
      })
    })

    ipcMain.handle(PrintIPC.GET_CURRENT_MODE, () => {
      return PrintscreenModeState.get() as PrintScreenMode
    })

    ipcMain.handle(PrintIPC.TAKE_FULL_SCREENSHOT, async () => {
      CloseAllWindowsUtil.execute()

      const hasPermission = await ScreenPermission.grant()
      if (!hasPermission) {
        return
      }

      const display = GetScreensUtil.getScreenByCursor()

      const captureWidth = Math.round(display.size.width * display.scaleFactor)
      const captureHeight = Math.round(
        display.size.height * display.scaleFactor,
      )

      let sources
      try {
        sources = await desktopCapturer.getSources({
          types: ['screen'],
          thumbnailSize: {
            width: captureWidth,
            height: captureHeight,
          },
        })
      } catch (error) {
        console.error('Failed to get screen sources:', error)
        NotificationDispatcher.dispatch({
          title: 'Screen capture failed',
          body: 'Unable to capture screen. Please check that "Screen Recording" permission is enabled for this app in System Preferences → Privacy and Security → Screen Recording, then restart the app.',
        })
        return
      }

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
        PreviewState.setImageId(screenshotId)

        createPreviewWindow()
      }

      return {}
    })

    ipcMain.handle(
      PrintIPC.TAKE_PARTIAL_SCREENSHOT,
      async (event, { selection }) => {
        // Salva informações da janela ANTES de fechar todas as janelas
        const senderWindow = BrowserWindow.fromWebContents(event.sender)
        let windowBounds: Electron.Rectangle | null = null
        let contentBounds: Electron.Rectangle | null = null

        if (senderWindow && !senderWindow.isDestroyed()) {
          windowBounds = senderWindow.getBounds()
          contentBounds = senderWindow.getContentBounds()
        }

        // Agora pode fechar todas as janelas
        CloseAllWindowsUtil.execute()

        const hasPermission = await ScreenPermission.grant()
        if (!hasPermission) {
          return
        }

        let display = GetScreensUtil.getScreenByCursor()

        // Usa as informações salvas da janela (antes de ser fechada)
        if (windowBounds) {
          const windowCenter = {
            x: windowBounds.x + windowBounds.width / 2,
            y: windowBounds.y + windowBounds.height / 2,
          }
          const screens = GetScreensUtil.get()
          const matchingScreen = screens.find((screen) => {
            const bounds = screen.bounds
            return (
              windowCenter.x >= bounds.x &&
              windowCenter.x < bounds.x + bounds.width &&
              windowCenter.y >= bounds.y &&
              windowCenter.y < bounds.y + bounds.height
            )
          })

          if (matchingScreen) {
            display = matchingScreen
          }
        }

        let windowOffset = { x: 0, y: 0 }
        if (contentBounds) {
          windowOffset = {
            x: contentBounds.x - display.bounds.x,
            y: contentBounds.y - display.bounds.y,
          }
        }

        const scaleFactor = display.scaleFactor
        const captureWidth = Math.round(display.size.width * scaleFactor)
        const captureHeight = Math.round(display.size.height * scaleFactor)

        let sources
        try {
          sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: {
              width: captureWidth,
              height: captureHeight,
            },
          })
        } catch (error) {
          console.error('Failed to get screen sources:', error)
          NotificationDispatcher.dispatch({
            title: 'Screen capture failed',
            body: 'Unable to capture screen. Please check that "Screen Recording" permission is enabled for this app in System Preferences → Privacy and Security → Screen Recording, then restart the app.',
          })
          return
        }

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
          x: Math.round((selection.x + windowOffset.x) * scaleFactor),
          y: Math.round((selection.y + windowOffset.y) * scaleFactor),
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
          PreviewState.setImageId(screenshotId)

          createPreviewWindow()
        }

        return {}
      },
    )
  }
}
