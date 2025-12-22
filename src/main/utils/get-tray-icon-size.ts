import { platform } from '@electron-toolkit/utils'

export class GetTrayIconSize {
  static execute() {
    if (platform.isMacOS || platform.isWindows) {
      return {
        width: 16,
        height: 16,
      }
    }

    return {
      width: 24,
      height: 24,
    }
  }
}
