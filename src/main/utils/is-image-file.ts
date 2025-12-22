import { existsSync, readFileSync } from 'node:fs'

export class IsImageFile {
  private static readonly IMAGE_EXTENSIONS = [
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.bmp',
    '.webp',
    '.svg',
    '.ico',
    '.tiff',
    '.tif',
  ]

  private static readonly MAGIC_BYTES: Record<string, number[][]> = {
    png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    jpeg: [
      [0xff, 0xd8, 0xff, 0xe0],
      [0xff, 0xd8, 0xff, 0xe1],
      [0xff, 0xd8, 0xff, 0xe2],
    ],
    gif: [
      [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
      [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
    ],
    bmp: [[0x42, 0x4d]],
    webp: [[0x52, 0x49, 0x46, 0x46]],
    ico: [[0x00, 0x00, 0x01, 0x00]],
    tiff: [
      [0x49, 0x49, 0x2a, 0x00],
      [0x4d, 0x4d, 0x00, 0x2a],
    ],
  }

  static check(filepath: string): boolean {
    if (!existsSync(filepath)) {
      return false
    }

    // Quick check: verify extension
    const hasValidExtension = IsImageFile.hasImageExtension(filepath)
    if (!hasValidExtension) {
      return false
    }

    // Deep check: verify magic bytes
    return IsImageFile.hasImageMagicBytes(filepath)
  }

  private static hasImageExtension(filepath: string): boolean {
    const lowerFilepath = filepath.toLowerCase()
    return IsImageFile.IMAGE_EXTENSIONS.some((ext) =>
      lowerFilepath.endsWith(ext),
    )
  }

  private static hasImageMagicBytes(filepath: string): boolean {
    try {
      // Read first 12 bytes for magic bytes check
      const buffer = readFileSync(filepath)
      const bytes = Array.from(buffer.subarray(0, 12))

      // Check each image type's magic bytes
      for (const signatures of Object.values(IsImageFile.MAGIC_BYTES)) {
        for (const signature of signatures) {
          if (IsImageFile.matchesSignature(bytes, signature)) {
            return true
          }
        }
      }

      // Special case for SVG (text-based, check for XML declaration or SVG tag)
      if (filepath.toLowerCase().endsWith('.svg')) {
        const svgContent = readFileSync(filepath, {
          encoding: 'utf-8',
        })
          .slice(0, 200)
          .trim()
          .toLowerCase()
        if (
          svgContent.startsWith('<?xml') ||
          svgContent.startsWith('<svg') ||
          svgContent.includes('<svg')
        ) {
          return true
        }
      }

      return false
    } catch (error) {
      console.error('Error reading file for magic bytes check:', error)
      return false
    }
  }

  private static matchesSignature(
    bytes: number[],
    signature: number[],
  ): boolean {
    if (bytes.length < signature.length) {
      return false
    }

    for (let i = 0; i < signature.length; i++) {
      if (bytes[i] !== signature[i]) {
        return false
      }
    }

    return true
  }
}
