import { initializeDatabase } from "./database/index";
import { initializeDbCache } from "./cache/index";
import type { Character } from "@elizaos/core";
import type { Config } from "./initConfig";

export async function initDatabase(
  character: Character,
  config: Config
): Promise<{ db: any; cache: any }> {
  const db = initializeDatabase(config.storePath);
  await db.init();
  const cache = initializeDbCache(character, db);
  return { db, cache };
}