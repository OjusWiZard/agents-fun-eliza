// src/runLoops.ts
import type { AgentRuntime, Memory } from "@elizaos/core";
import type { DirectClient } from "@elizaos/client-direct";
import { createMemory, triggerPluginActions } from "./utils";
import { ROOMS } from "./config/index";
import { registerHealthCheckRoute } from "./healthcheck/index";

/**
 * Registers the agent, starts the server, and runs autonomous loops.
 */
export async function runAgent(
  runtime: AgentRuntime,
  directClient: DirectClient,
  serverPort: number,
): Promise<void> {
  // Bind healthcheck route
  registerHealthCheckRoute(runtime, directClient);

  // Register agent and start server
  directClient.registerAgent(runtime);
  directClient.start(serverPort);

  // Initial action
  let firstMem: Memory = createMemory(runtime, ROOMS.TWITTER_INTERACTION);
  await runtime.databaseAdapter.createMemory(firstMem, ROOMS.START);
  await triggerPluginActions(runtime, firstMem);

  // Periodic autonomous loops
  const loopIntervalMs = 10 * 60 * 1000; // 10 minutes
  const heartbeatIntervalMs = 30 * 1000; // 30 seconds

  setInterval(async () => {
    const mem = createMemory(runtime, ROOMS.TWITTER_INTERACTION);
    await runtime.databaseAdapter.createMemory(mem, ROOMS.START);
    await triggerPluginActions(runtime, mem);
  }, loopIntervalMs);

  setInterval(() => {
    const mem: Memory = createMemory(runtime, ROOMS.TWITTER_INTERACTION);
    runtime.databaseAdapter.createMemory(mem, ROOMS.START);
  }, heartbeatIntervalMs);
}