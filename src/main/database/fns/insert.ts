import type { DatabaseSync } from 'node:sqlite'
import sqlBricks from 'sql-bricks'

type InsertParams = {
  table: string
  items: Record<string, unknown>
}

export class InsertOp {
  static execute(db: DatabaseSync, { table, items }: InsertParams): number {
    const { text, values } = sqlBricks
      .insertInto(table, items)
      .toParams({ placeholder: '?' })

    const stmt = db.prepare(text)
    stmt.run(...values)

    const result = db.prepare('SELECT last_insert_rowid() as id').get() as {
      id: number
    }
    return result.id
  }
}
