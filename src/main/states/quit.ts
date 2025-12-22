export class QuitState {
  private static _state = false

  static get state() {
    return QuitState._state
  }

  static set state(value: boolean) {
    QuitState._state = value
  }
}
