import path from 'node:path'
import type { DatabaseSync } from 'node:sqlite'
import { app } from 'electron'

export class MigrationV3 {
  static migrate(db: DatabaseSync) {
    // Default save directory (pictures/screenshoter)
    const defaultSaveDir = path.join(app.getPath('pictures'), 'screenshoter')

    // Default font size (16px = 1.6rem)
    const defaultFontSize = '16'

    // Insert default settings if they don't exist
    const insertSaveDir = db.prepare(
      'INSERT OR IGNORE INTO metadata (key, value) VALUES (?, ?)',
    )
    insertSaveDir.run('settings:save_directory', defaultSaveDir)

    const insertFontSize = db.prepare(
      'INSERT OR IGNORE INTO metadata (key, value) VALUES (?, ?)',
    )
    insertFontSize.run('settings:font_size', defaultFontSize)

    db.exec(
      "INSERT OR REPLACE INTO metadata (key, value) VALUES ('schema_version', '3')",
    )
  }
}
