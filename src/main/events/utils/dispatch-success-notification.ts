import fs from 'node:fs'
import { platform } from '@electron-toolkit/utils'
import { dialog, type NativeImage, Notification, shell } from 'electron'
import { InsertOp } from '../../database/fns/insert'
import { UpdateOp } from '../../database/fns/update'
import { DatabaseManager } from '../../database/manager'
import { NotificationDispatcher } from '../../utils/dispatch-simple-notifications'
import { OpenNativePreview } from '../../utils/open-preview'

export class DispatcherSuccessNotification {
  static dispatch(image: NativeImage, filepath: string | null) {
    const notification = new Notification({
      title: `Screen captured ${
        !platform.isMacOS ? undefined : new Date().toLocaleString()
      }`,
      body: 'The screen has been captured and copied to the clipboard.',
      urgency: 'normal',
      subtitle: platform.isMacOS ? new Date().toLocaleString() : undefined,
      icon: image,
      actions: [
        {
          type: 'button',
          text: 'Save',
        },
      ],
    })

    notification
      .addListener('action', (event, eventIndex) => {
        event.preventDefault()

        if (eventIndex === 0) {
          const path = dialog.showSaveDialogSync({
            title: 'Save Screen Capture',
            defaultPath: `screen-${new Date()
              .toISOString()
              .replace(/:/g, '-')
              .replace(/\..+/, '')}.png`,
            buttonLabel: 'Save',
            filters: [{ name: 'PNG', extensions: ['png'] }],
          })

          if (!path) {
            return
          }

          const pngBuffer = image.toPNG()

          try {
            fs.writeFileSync(path, pngBuffer)

            try {
              if (filepath) {
                fs.rmSync(filepath)
              }
            } finally {
            }

            new Notification({
              title: 'Saved',
              body: 'Your screenshot has been saved successfully.',
            }).show()
          } catch (error) {
            new Notification({
              title: 'Error saving screenshot',
              body: String(error),
            }).show()
          }

          try {
            const database = DatabaseManager.getInstance()

            if (filepath) {
              UpdateOp.execute(database, {
                table: 'screenshots',
                items: {
                  filepath: path,
                },
                condition: {
                  filepath,
                },
              })

              return
            }

            const { width, height } = image.getSize()

            InsertOp.execute(database, {
              table: 'screenshots',
              items: {
                filepath: path,
                size: pngBuffer.length,
                width,
                height,
              },
            })
          } finally {
          }

          return
        }

        NotificationDispatcher.dispatch({
          title: 'Unknown Action',
          body: 'Please try again later, check your display settings.',
        })
      })
      .addListener('click', (event) => {
        event.preventDefault()

        if (!filepath) {
          NotificationDispatcher.dispatch({
            title: 'No file to preview',
            body: 'The screenshot file path is not available.',
          })
          return
        }

        // Open with OS default image viewer (native preview)
        OpenNativePreview.exec(filepath, () => {
          shell.openPath(filepath).catch((error) => {
            NotificationDispatcher.dispatch({
              title: 'Failed to open preview',
              body: String(error),
            })
          })
        })
      })
      .show()
  }
}
