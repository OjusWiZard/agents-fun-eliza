// src/buildRuntime.ts
import { AgentRuntime } from "@elizaos/core";
import type { Character } from "@elizaos/core";
import type { DirectClient } from "@elizaos/client-direct";
import { memeoorPlugin } from "plugin-memeooorr";

/**
 * Constructs the AgentRuntime instance configured with DB, cache, token, and plugins.
 */
export function buildRuntime(
  character: Character,
  db: any,
  cache: any,
  token: string,
): AgentRuntime {
  return new AgentRuntime({
    databaseAdapter: db,
    token,
    character,
    modelProvider: character.modelProvider,
    plugins: [memeoorPlugin],
    evaluators: [],
    cacheManager: cache,
    providers: [],
    actions: [],
    services: [],
    managers: [],
  });
}
