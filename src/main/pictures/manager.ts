import fs from 'node:fs'
import path from 'node:path'
import { NotificationDispatcher } from '../utils/dispatch-simple-notifications'
import { store } from '../store/settings'
import { app } from 'electron'

export class PictureManager {
  private static _picdir: string

  static save(image: Buffer): string | null {
    try {
      const filename = `${Date.now()}.png`
      const filepath = path.join(PictureManager.picdir, filename)

      fs.writeFileSync(filepath, image)
      return filepath
    } catch (error) {
      console.log(error)
      NotificationDispatcher.dispatch({
        title: 'Failed',
        body: 'Failed to save screenshot on temporary directory',
      })

      return null
    }
  }

  static getdir(): string {
    return PictureManager.picdir
  }

  static resetDirectory(): void {
    PictureManager._picdir = undefined as unknown as string
  }

  private static get picdir(): string {
    if (!PictureManager._picdir) {
      PictureManager._picdir = PictureManager.createDirectoryIfNotExists()
    }

    return PictureManager._picdir
  }

  private static createDirectoryIfNotExists(): string {
    let directory = store.get('default_save_directory', '')

    if (!directory) {
      directory = path.join(app.getPath('pictures'), 'treenshoter')
    }

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true })
    }

    return directory
  }
}
