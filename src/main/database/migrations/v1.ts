import type { DatabaseSync } from 'node:sqlite'

export class MigrationV1 {
  static migrate(db: DatabaseSync) {
    db.exec(
      `
			CREATE TABLE IF NOT EXISTS screenshots (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				filepath TEXT NOT NULL,
				size INTEGER NOT NULL,
				width INTEGER NOT NULL,
				height INTEGER NOT NULL,
				mimetype TEXT NOT NULL DEFAULT 'image/png',
				timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
			);
		`.trim(),
    )

    db.exec(
      `INSERT OR REPLACE INTO metadata (key, value) VALUES ('schema_version', '1')`,
    )
  }
}
