import { platform } from '@electron-toolkit/utils'
import { app, shell, systemPreferences } from 'electron'
import { NotificationDispatcher } from '../utils/dispatch-simple-notifications'

export class ScreenPermission {
  static async grant() {
    if (platform.isMacOS) {
      let status = systemPreferences.getMediaAccessStatus('screen')
      const appName = app.getName()
      const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

      if (status === 'denied' || status === 'not-determined') {
        await new Promise((resolve) => setTimeout(resolve, 500))
        status = systemPreferences.getMediaAccessStatus('screen')
      }

      if (status === 'denied') {
        const appNameToEnable = isDev ? 'Electron' : appName
        const processName = process.execPath.split('/').pop() || 'Electron'

        NotificationDispatcher.dispatch({
          title: 'Screen recording permission may be required',
          body: `If capture fails, enable "Screen Recording" for "${appNameToEnable}" or "${processName}" in: System Preferences → Privacy and Security → Screen Recording. After enabling, you MUST restart the app completely (quit and reopen) for the permission to take effect.`,
        })

        return true
      }

      if (status !== 'granted') {
        try {
          await shell.openExternal(
            'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture',
          )
        } catch (err) {
          console.error('Failed to open ScreenCapture preferences:', err)
        }

        const appNameToEnable = isDev ? 'Electron' : appName

        NotificationDispatcher.dispatch({
          title: 'Permission denied',
          body: `To capture the screen, enable "Screen Recording" for "${appNameToEnable}" in: System Preferences → Privacy and Security → Screen Recording.${isDev ? ' (When running from terminal, look for "Electron" in the list)' : ''} After enabling, please restart the app.`,
        })

        return false
      }
    }

    return true
  }
}
