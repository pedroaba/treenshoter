import { spawn } from 'node:child_process'
import { platform } from '@electron-toolkit/utils'

export class OpenNativePreview {
  static exec(filepath: string, fallbackOpenFn?: (filepath: string) => void) {
    try {
      if (platform.isMacOS) {
        // Quick Look
        spawn('qlmanage', ['-p', filepath], { stdio: 'ignore' })
        return
      }

      if (platform.isWindows) {
        // Open with default image viewer
        spawn('start', ['', filepath], { shell: true, stdio: 'ignore' })
        return
      }

      // Linux
      spawn('xdg-open', [filepath], { stdio: 'ignore' })
    } catch {
      fallbackOpenFn?.(filepath)
    }
  }
}
