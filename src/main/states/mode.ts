import { PrintScreenMode } from '../../shared/enum/print-screen-mode'

export class PrintscreenModeState {
  private static _mode = PrintScreenMode.FULLSCREEN

  static get(): PrintScreenMode {
    return PrintscreenModeState._mode
  }

  static set(mode: PrintScreenMode) {
    PrintscreenModeState._mode = mode
  }
}
