import { promises as fs } from 'node:fs'
import path from 'node:path'
import { app, clipboard, dialog, ipcMain, nativeImage, shell } from 'electron'
import { platform } from '@electron-toolkit/utils'
import sqlBricks from 'sql-bricks'
import { DatabaseManager } from '../database/manager'
import { NotificationDispatcher } from '../utils/dispatch-simple-notifications'
import { LibraryIPC } from '../../shared/communication/ipc/library'
import { PreviewState } from '../states/preview'
import { DetailState } from '../states/detail'
import { createWindow } from '../ui/create-window'

export class LibraryEvents {
  static register() {
    const db = DatabaseManager.getInstance()

    ipcMain.handle(LibraryIPC.GET_ALL, () => {
      const query = sqlBricks
        .select('*')
        .from('screenshots')
        .orderBy('timestamp DESC')
        .toString()

      return db.prepare(query).all()
    })

    ipcMain.handle(LibraryIPC.GET_NEW, (_, lastId: number) => {
      const query = sqlBricks
        .select('*')
        .from('screenshots')
        .where(sqlBricks.gt('id', lastId))
        .orderBy('timestamp DESC')
        .toString()

      return db.prepare(query).all()
    })

    ipcMain.handle(LibraryIPC.GET_BY_ID, (_, id: number) => {
      const query = sqlBricks
        .select('*')
        .from('screenshots')
        .where('id', id)
        .toString()

      return db.prepare(query).get()
    })

    ipcMain.handle(LibraryIPC.GET_PREVIEW_IMAGE_ID, () => {
      return PreviewState.getImageId()
    })

    ipcMain.handle(LibraryIPC.GET_DETAIL_IMAGE_ID, () => {
      return DetailState.getImageId()
    })

    ipcMain.on(LibraryIPC.OPEN_DETAIL, (_, id: number) => {
      DetailState.setImageId(id)

      if (platform.isMacOS) {
        app.dock?.show()
      }

      createWindow(
        {
          id: 'detail',
          width: 1000,
          height: 800,
          minWidth: 800,
          minHeight: 600,
          show: false,
          autoHideMenuBar: true,
          backgroundColor: '#09090b',
        },
        {
          webSecurity: false,
        },
      )
    })

    ipcMain.handle(LibraryIPC.DELETE, async (_, id: number) => {
      const queryGet = sqlBricks
        .select('filepath')
        .from('screenshots')
        .where('id', id)
        .toString()

      const row = db.prepare(queryGet).get() as { filepath: string } | undefined

      if (row) {
        try {
          await fs.unlink(row.filepath)
        } catch (err) {
          console.error('Failed to delete file:', err)
          NotificationDispatcher.dispatch({
            title: 'Warning',
            body: 'Failed to delete the file from disk, but removing from library.',
          })
        }
      }

      const queryDelete = sqlBricks
        .deleteFrom('screenshots')
        .where('id', id)
        .toString()

      db.prepare(queryDelete).run()

      NotificationDispatcher.dispatch({
        title: 'Success',
        body: 'Screenshot deleted successfully.',
      })

      return true
    })

    ipcMain.handle(
      LibraryIPC.UPDATE_TITLE,
      async (_, { id, title }: { id: number; title: string }) => {
        try {
          const queryGet = sqlBricks
            .select('filepath')
            .from('screenshots')
            .where('id', id)
            .toString()

          const row = db.prepare(queryGet).get() as
            | { filepath: string }
            | undefined

          if (!row) {
            NotificationDispatcher.dispatch({
              title: 'Error',
              body: 'Screenshot not found.',
            })
            return false
          }

          const oldFilepath = row.filepath
          const dir = path.dirname(oldFilepath)
          const ext = path.extname(oldFilepath)

          let newFilepath = oldFilepath
          if (title.trim()) {
            const sanitizedTitle = title
              .trim()
              .replace(/[<>:"/\\|?*]/g, '')
              .replace(/\s+/g, '_')
              .substring(0, 100)

            let baseFilename = sanitizedTitle
            let newFilename = `${baseFilename}${ext}`
            newFilepath = path.join(dir, newFilename)
            let counter = 1

            while (true) {
              try {
                await fs.access(newFilepath)
                if (newFilepath === oldFilepath) {
                  break
                }

                newFilename = `${baseFilename}_${counter}${ext}`
                newFilepath = path.join(dir, newFilename)
                counter++
              } catch {
                break
              }
            }

            if (newFilepath !== oldFilepath) {
              try {
                await fs.rename(oldFilepath, newFilepath)
              } catch (error) {
                console.error('Failed to rename file:', error)
                NotificationDispatcher.dispatch({
                  title: 'Warning',
                  body: 'Failed to rename file, but title was updated.',
                })

                const queryTitle = sqlBricks
                  .update('screenshots', { title })
                  .where('id', id)
                  .toString()
                db.prepare(queryTitle).run()
                return true
              }
            }
          }

          const updateData: { title: string; filepath?: string } = { title }
          if (newFilepath !== oldFilepath) {
            updateData.filepath = newFilepath
          }

          const query = sqlBricks
            .update('screenshots', updateData)
            .where('id', id)
            .toString()

          db.prepare(query).run()

          NotificationDispatcher.dispatch({
            title: 'Success',
            body: 'Screenshot title and filename updated.',
          })

          return true
        } catch (error) {
          console.error('Failed to update screenshot title:', error)
          NotificationDispatcher.dispatch({
            title: 'Error',
            body: 'Failed to update screenshot title.',
          })
          return false
        }
      },
    )

    ipcMain.handle(LibraryIPC.SAVE_AS, async (_, filepathOrDataUrl: string) => {
      try {
        const isDataUrl = filepathOrDataUrl.startsWith('data:')
        let defaultPath = 'screenshot.png'

        if (!isDataUrl) {
          defaultPath = path.basename(filepathOrDataUrl)
        }

        const { canceled, filePath: destPath } = await dialog.showSaveDialog({
          defaultPath,
          filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }],
        })

        if (canceled || !destPath) {
          return false
        }

        if (isDataUrl) {
          const base64Data = filepathOrDataUrl.replace(
            /^data:image\/\w+;base64,/,
            '',
          )
          const buffer = Buffer.from(base64Data, 'base64')
          await fs.writeFile(destPath, buffer)
        } else {
          await fs.copyFile(filepathOrDataUrl, destPath)
        }

        NotificationDispatcher.dispatch({
          title: 'Saved!',
          body: 'Screenshot saved successfully.',
        })

        return true
      } catch (error) {
        console.error(error)
        NotificationDispatcher.dispatch({
          title: 'Error',
          body: 'Failed to save screenshot.',
        })
        return false
      }
    })

    ipcMain.handle(
      LibraryIPC.SAVE,
      async (
        _,
        { dataUrl, filepath }: { dataUrl: string; filepath: string },
      ) => {
        try {
          const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '')
          const buffer = Buffer.from(base64Data, 'base64')
          await fs.writeFile(filepath, buffer)

          const stats = await fs.stat(filepath)
          const query = sqlBricks
            .update('screenshots', { size: stats.size })
            .where('filepath', filepath)
            .toString()

          db.prepare(query).run()

          NotificationDispatcher.dispatch({
            title: 'Saved!',
            body: 'Screenshot saved successfully.',
          })

          return true
        } catch (error) {
          console.error(error)
          NotificationDispatcher.dispatch({
            title: 'Error',
            body: 'Failed to save screenshot.',
          })
          return false
        }
      },
    )

    ipcMain.handle(LibraryIPC.COPY, (_, filepath: string) => {
      try {
        const image = nativeImage.createFromPath(filepath)
        clipboard.writeImage(image)

        NotificationDispatcher.dispatch({
          title: 'Copied!',
          body: 'Image copied to clipboard',
        })

        return true
      } catch (error) {
        console.error(error)
        NotificationDispatcher.dispatch({
          title: 'Error',
          body: 'Failed to copy screenshot.',
        })
        return false
      }
    })

    ipcMain.handle(LibraryIPC.COPY_DRAWING, (_, dataUrl: string) => {
      try {
        const image = nativeImage.createFromDataURL(dataUrl)
        clipboard.writeImage(image)

        NotificationDispatcher.dispatch({
          title: 'Copied!',
          body: 'Image copied to clipboard',
        })

        return true
      } catch (error) {
        console.error(error)
        NotificationDispatcher.dispatch({
          title: 'Error',
          body: 'Failed to copy screenshot.',
        })
        return false
      }
    })

    ipcMain.handle(LibraryIPC.SHOW_IN_FOLDER, (_, filepath: string) => {
      shell.showItemInFolder(filepath)
    })
  }
}
