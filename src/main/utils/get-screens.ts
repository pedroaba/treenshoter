import { screen } from 'electron'

export class GetScreensUtil {
  static get() {
    const screens = screen.getAllDisplays()

    return screens
  }

  static getScreenByCursor() {
    const cursorPosition = screen.getCursorScreenPoint()
    const primaryDisplay = screen.getDisplayNearestPoint(cursorPosition)

    return primaryDisplay
  }
}
