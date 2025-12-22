export class DetailState {
  static _imageId: number | null = null

  static getImageId(): number | null {
    return DetailState._imageId
  }

  static setImageId(imageId: number) {
    DetailState._imageId = imageId
  }

  static clearImageId() {
    DetailState._imageId = null
  }
}
