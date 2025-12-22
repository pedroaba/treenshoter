export class FileUtils {
  static getFilename(filepath: string): string {
    return filepath.split(/[/\\]/).pop() || 'screenshot.png'
  }

  static formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  static formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleString()
  }
}
