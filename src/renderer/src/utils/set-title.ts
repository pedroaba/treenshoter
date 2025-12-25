export class SetTitleUtils {
  static set(title: string) {
    window.document.title = title
    window.api.global.setTitle(title)
  }
}
