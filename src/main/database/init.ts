import sqlBricks from 'sql-bricks'
import { DatabaseManager } from './manager'
import { MigrationV1 } from './migrations/v1'
import { MigrationV2 } from './migrations/v2'
import { MigrationV3 } from './migrations/v3'

export class BootstrapDatabase {
  static bootstrap() {
    const db = DatabaseManager.getInstance()

    db.exec(`
      CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `)

    const querystring = sqlBricks
      .select('value')
      .from('metadata')
      .where('key', 'schema_version')
      .toString()

    const row = db.prepare(querystring).get() as { value: string } | undefined

    const currentVersion = row ? Number(row.value) : 0
    if (currentVersion === 0) {
      MigrationV1.migrate(db)
    }

    if (currentVersion < 2) {
      MigrationV2.migrate(db)
    }

    if (currentVersion < 3) {
      MigrationV3.migrate(db)
    }
  }
}
