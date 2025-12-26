import 'dotenv/config'

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'
import { z } from 'zod'

import { pipeline } from 'node:stream/promises'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

const envSchema = z.object({
  // Firebase
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string(),
  FIREBASE_PRIVATE_KEY: z.string(),
  FIREBASE_STORAGE_BUCKET: z.string(),

  // GitHub Actions
  GITHUB_REF_NAME: z.string(),
  AUTH_TOKEN: z.string(),
})

const env = envSchema.safeParse(process.env)
if (env.error) {
  console.error(env.error)
  process.exit(1)
}

const secrets = {
  GITHUB_REF_NAME: env.data.GITHUB_REF_NAME,
  AUTH_TOKEN: env.data.AUTH_TOKEN,
}

function _replaceVersion(link: string) {
  return link
    .replace('{{version}}', secrets.GITHUB_REF_NAME)
    .replace('{{version-without-v}}', secrets.GITHUB_REF_NAME.replace('v', ''))
}

function _getFilename(link: string): string {
  const filename = link.split('/').pop()
  if (!filename) {
    throw new Error(`Invalid link format: ${link}`)
  }

  return filename
}

function _createVersionFolder() {
  const version = secrets.GITHUB_REF_NAME
  const versionFolder = `releases/${version}`
  return versionFolder
}

export class Formatter {
  static bytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  static bytesToNumber(formatted: string): number {
    const regex = /^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/
    const match = formatted.trim().toUpperCase().match(regex)
    if (!match) {
      throw new Error(`Invalid formatted bytes string: ${formatted}`)
    }
    const value = parseFloat(match[1])
    const unit = match[2]
    const multipliers: Record<string, number> = {
      B: 1,
      KB: 1024,
      MB: 1024 ** 2,
      GB: 1024 ** 3,
    }
    const multiplier = multipliers[unit]
    if (!multiplier) {
      throw new Error(`Unknown unit: ${unit}`)
    }
    return Math.round(value * multiplier)
  }

  static duration(ms: number): string {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }
}

class Logger {
  static progress(current: number, total: number, message: string): void {
    console.log(`[${current}/${total}] ${message}`)
  }

  static step(message: string): void {
    console.log(`  → ${message}`)
  }

  static notice(message: string): void {
    console.log(`::notice:: ${message}`)
  }

  static error(message: string): void {
    console.error(`::error:: ${message}`)
  }
}

function _calculateTotalFiles(): number {
  return Object.values(links).reduce(
    (total, installers) => total + installers.length,
    0,
  )
}

let app: ReturnType<typeof initializeApp>
const apps = getApps()

if (apps.length > 0) {
  app = apps[0]
} else {
  app = initializeApp({
    credential: cert({
      projectId: env.data.FIREBASE_PROJECT_ID,
      clientEmail: env.data.FIREBASE_CLIENT_EMAIL,
      privateKey: Buffer.from(env.data.FIREBASE_PRIVATE_KEY, 'base64')
        .toString()
        .replace(/\\n/g, '\n'),
    }),
    storageBucket: env.data.FIREBASE_STORAGE_BUCKET,
  })
}

const links = {
  windows: [
    'https://github.com/pedroaba/treenshoter/releases/download/{{version}}/treenshoter-{{version-without-v}}-setup.exe',
  ],
  linux: [
    'https://github.com/pedroaba/treenshoter/releases/download/{{version}}/treenshoter-{{version-without-v}}.AppImage',
    'https://github.com/pedroaba/treenshoter/releases/download/{{version}}/treenshoter-{{version-without-v}}.freebsd',
    'https://github.com/pedroaba/treenshoter/releases/download/{{version}}/treenshoter-{{version-without-v}}.pacman',
    'https://github.com/pedroaba/treenshoter/releases/download/{{version}}/treenshoter-{{version-without-v}}.x86_64.rpm',
    'https://github.com/pedroaba/treenshoter/releases/download/{{version}}/treenshoter_{{version-without-v}}_amd64.deb',
  ],
  macos: [
    'https://github.com/pedroaba/treenshoter/releases/download/{{version}}/treenshoter-{{version-without-v}}.dmg',
    'https://github.com/pedroaba/treenshoter/releases/download/{{version}}/Treenshoter-{{version-without-v}}-arm64-mac.zip',
  ],
} as const

async function main() {
  const bucket = getStorage(app).bucket()
  const firestore = getFirestore(app)
  const releasesCollection = firestore.collection('releases')

  const releaseFolder = _createVersionFolder()
  const totalFiles = _calculateTotalFiles()
  const startTime = Date.now()
  const processedFiles: Array<{
    os: string
    filename: string
    size: string
    duration: string
  }> = []
  let currentFile = 0

  Logger.notice(
    `Starting upload process for version ${secrets.GITHUB_REF_NAME}`,
  )
  console.log(`Total files to process: ${totalFiles}\n`)

  for await (const [os, installers] of Object.entries(links)) {
    for await (const link of installers) {
      currentFile++
      const replacedLink = _replaceVersion(link)
      const filename = _getFilename(replacedLink)
      const fileStartTime = Date.now()

      Logger.progress(
        currentFile,
        totalFiles,
        `Processing ${os}/${filename}...`,
      )

      try {
        Logger.step(`Downloading from GitHub Releases...`)
        const response = await fetch(replacedLink, {
          redirect: 'follow',
          headers: {
            Authorization: `Bearer ${secrets.AUTH_TOKEN}`,
            Accept: 'application/octet-stream',
          },
        })

        if (!response.ok) {
          throw new Error(
            `Failed to fetch ${replacedLink}: ${response.statusText}`,
          )
        }

        const contentLength = response.headers.get('content-length')
        const fileSize = contentLength
          ? Formatter.bytes(Number.parseInt(contentLength, 10))
          : 'Unknown size'

        const destinationPath = `${releaseFolder}/${os}/${filename}`
        Logger.step(`Uploading to Firebase Storage: ${destinationPath}...`)

        await pipeline(
          response.body as ReadableStream,
          bucket.file(destinationPath).createWriteStream(),
        )

        const fileDuration = Date.now() - fileStartTime
        const durationStr = Formatter.duration(fileDuration)

        processedFiles.push({
          os,
          filename,
          size: fileSize,
          duration: durationStr,
        })

        Logger.progress(
          currentFile,
          totalFiles,
          `✅ Completed ${os}/${filename} (${fileSize}, ${durationStr})`,
        )
        console.log('')
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        Logger.error(`Failed to process ${os}/${filename}: ${errorMessage}`)
        throw error
      }
    }
  }

  const totalDuration = Date.now() - startTime
  const totalDurationStr = Formatter.duration(totalDuration)

  console.log('\n' + '='.repeat(60))
  Logger.notice(
    `✅ All files uploaded successfully (${processedFiles.length}/${totalFiles} files, ${totalDurationStr})`,
  )
  console.log('\nProcessed files:')
  processedFiles.forEach((file) => {
    console.log(
      `  • ${file.os}/${file.filename} - ${file.size} (${file.duration})`,
    )
  })
  console.log('='.repeat(60))

  Logger.step(`Adding files to Firestore...`)
  const releaseDoc = releasesCollection.doc(secrets.GITHUB_REF_NAME)

  for (const file of processedFiles) {
    Logger.step(`Adding file to Firestore: ${file.os}/${file.filename}...`)
    await releaseDoc
      .collection('files')
      .doc(file.filename)
      .set({
        os: file.os,
        filename: file.filename,
        size: Formatter.bytesToNumber(file.size),
        uploadedAt: Timestamp.now(),
      })
  }

  Logger.notice(`✅ All files added to Firestore`)
}

main()
  .then(() => {
    // Success message already logged in main()
  })
  .catch((err) => {
    Logger.error('Storage upload failed')
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error(errorMessage)
    if (err instanceof Error && err.stack) {
      console.error(err.stack)
    }
    process.exit(1)
  })
