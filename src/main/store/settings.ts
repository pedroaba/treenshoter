import Store from 'electron-store'
import { settings } from '../constants/settings'
import path from 'node:path'
import { app } from 'electron'

export const defaultSaveDirectoryPath = path.join(
  app.getPath('pictures'),
  'screenshoter',
)

const ElectronStore = (Store as any).default as unknown as typeof Store

export const store = new ElectronStore<{
  default_save_directory: string
}>({
  name: `${settings.ELECTRON_APP_NAME}-settings`,
  defaults: {
    default_save_directory: defaultSaveDirectoryPath,
  },
})
