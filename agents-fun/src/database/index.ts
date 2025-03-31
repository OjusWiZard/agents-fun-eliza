import { SqliteDatabaseAdapter } from "./bunSqlite.ts";
import Database from "bun:sqlite";
import path from "path";

export function initializeDatabase(dataDir: string) {
  const filePath =
    process.env.SQLITE_FILE ?? path.resolve(dataDir, "db.sqlite");
  // ":memory:";
  const db = new SqliteDatabaseAdapter(new Database(filePath));
  return db;
}
