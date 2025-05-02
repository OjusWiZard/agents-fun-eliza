import { Database } from "bun:sqlite";
import { elizaLogger } from "@elizaos/core";
import * as sqliteVec from "sqlite-vec";

// Array of potential paths to the custom SQLite library
const sqlitePaths = [
  "/usr/local/opt/sqlite3/lib/libsqlite3.dylib",
  "/opt/homebrew/opt/sqlite3/lib/libsqlite3.dylib",
  "/usr/lib/libsqlite3.dylib", // Add more paths as needed
];

// Try to set the custom SQLite library from the list of paths
let customSQLiteSet = false;
for (const path of sqlitePaths) {
  try {
    Database.setCustomSQLite(path);
    elizaLogger.log(`Custom SQLite library set from: ${path}`);
    customSQLiteSet = true;
    break;
  } catch (error) {
    elizaLogger.warn(
      `Failed to set custom SQLite library from: ${path}`,
      error,
    );
  }
}

if (!customSQLiteSet) {
  elizaLogger.error(
    "Failed to set custom SQLite library from all provided paths.",
  );
}

// Loads the sqlite-vec extensions into the provided SQLite database
export function loadVecExtensions(db: Database): void {
  try {
    // Load sqlite-vec extensions
    sqliteVec.load(db);
    elizaLogger.log("sqlite-vec extensions loaded successfully.");
  } catch (error) {
    elizaLogger.error("Failed to load sqlite-vec extensions:", error);
    throw error;
  }
}

/**
 * @param db - An instance of better - sqlite3 Database
 */
export function load(db: Database): void {
  loadVecExtensions(db);
}
