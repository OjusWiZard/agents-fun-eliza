// Orchestrator that ties together configuration, character, client, database, runtime, and loops
import { initCharacter } from "./initCharacter";
import { initDirectClient } from "./initDirectClient";
import { initDatabase } from "./initDatabase";
import { buildRuntime } from "./buildRuntime";
import { runAgent } from "./runLoops";

async function main() {
  try {
    const { character, token, config } = await initCharacter();
    const directClient = initDirectClient();
    const { db, cache } = await initDatabase(character, config);
    const runtime = buildRuntime(character, db, cache, token);
    await runtime.initialize();
    await runAgent(runtime, directClient, config.serverPort);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

main();
