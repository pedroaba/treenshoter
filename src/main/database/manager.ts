import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { app } from 'electron'

export class DatabaseManager {
  private static instance: DatabaseSync | null = null

  static getInstance() {
    if (DatabaseManager.instance) {
      return DatabaseManager.instance
    }

    const appDataPath = app.getPath('userData')
    const databasePath = path.join(appDataPath, 'database.db')

    const db = new DatabaseSync(databasePath)
    db.exec('PRAGMA journal_mode = WAL;')

    DatabaseManager.instance = db
    return db
  }
}
