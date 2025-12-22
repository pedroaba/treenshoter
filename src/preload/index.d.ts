import { ElectronAPI } from '@electron-toolkit/preload'
import type { TreenshoterAPI } from './index'

declare global {
  interface Window {
    electron: ElectronAPI
    api: TreenshoterAPI
  }
}
