export class PreviewState {
  static _imageId: number | null = null

  static getImageId(): number | null {
    return PreviewState._imageId
  }

  static setImageId(imageId: number) {
    PreviewState._imageId = imageId
  }

  static clearImageId() {
    PreviewState._imageId = null
  }
}
