import type { DatabaseSync } from 'node:sqlite'

export class MigrationV2 {
  static migrate(db: DatabaseSync) {
    db.exec('ALTER TABLE screenshots ADD COLUMN title TEXT')
    db.exec(
      "INSERT OR REPLACE INTO metadata (key, value) VALUES ('schema_version', '2')",
    )
  }
}
