import type { DatabaseSync } from 'node:sqlite'
import sqlBricks from 'sql-bricks'

type InsertParams = {
  table: string
  items: Record<string, unknown>
  condition: sqlBricks.WhereExpression
}

export class UpdateOp {
  static execute(db: DatabaseSync, { table, items, condition }: InsertParams) {
    const { text, values } = sqlBricks
      .update(table)
      .set(items)
      .where(condition)
      .toParams({ placeholder: '?' })

    const stmt = db.prepare(text)
    stmt.run(...values)
  }
}
