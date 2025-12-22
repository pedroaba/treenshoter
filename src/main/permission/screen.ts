import { platform } from '@electron-toolkit/utils'
import { shell, systemPreferences } from 'electron'
import { NotificationDispatcher } from '../utils/dispatch-simple-notifications'

export class ScreenPermission {
  static async grant() {
    if (platform.isMacOS) {
      const status = systemPreferences.getMediaAccessStatus('screen')

      if (status !== 'granted') {
        console.log('grant macOS not granted')
        try {
          await shell.openExternal(
            'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture',
          )
        } catch (err) {
          console.error('Failed to open ScreenCapture preferences:', err)
        }

        console.log('grant macOS dispatch')
        NotificationDispatcher.dispatch({
          title: 'Permission denied',
          body: 'To capture the screen, enable "Screen Recording" for this app in: System Preferences → Privacy and Security → Screen Recording.',
        })

        return
      }
    }
  }
}
