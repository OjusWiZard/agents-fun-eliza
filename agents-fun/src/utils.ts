import type { Action, AgentRuntime, Memory, Plugin } from "@elizaos/core";
import { elizaLogger, stringToUuid } from "@elizaos/core";
import net from "net";
import * as fs from "fs";
import * as path from "path";

import { ROOMS, AGENT_PATHS } from "./config/index.ts";
import type { RoomKey } from "./types.ts";

const logPath = path.join(AGENT_PATHS.AGENT_WORKING_PATH, "logs.txt");

// Patch elizaLogger: every log method appends to logs.txt
Object.entries({ log: "INFO", info: "INFO", warn: "WARN", error: "ERROR", success: "SUCCESS", verbose: "VERBOSE" })
  .forEach(([method, level]) => {
    const original = (elizaLogger as any)[method] as Function;
    (elizaLogger as any)[method] = (...args: any[]) => {
      original.apply(elizaLogger, args);
      const timestamp = formatDate(new Date());
      const formatted = `[${timestamp}] [${level}] ${args.join(" ")}\n`;
      fs.appendFile(logPath, formatted, (err) => {
        if (err) original("Failed writing to logs file:", err);
      });
    };
  });

const formatDate = (date: Date) => {
  const pad = (n: number) => (n < 10 ? "0" + n : n);
  const padMilliseconds = (n: number) =>
    n < 10 ? "00" + n : n < 100 ? "0" + n : n;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())},${padMilliseconds(date.getMilliseconds())}`;
};

export const logMessageToFile = (
  logLevel: string,
  agent: string,
  message: string,
) => {
  const timestamp = formatDate(new Date());
  const formattedMessage = `[${timestamp}] [${logLevel}] [${agent}] ${message}\n`;
  fs.appendFile(logPath, formattedMessage, (err) => {
    if (err) {
      elizaLogger.error(`Error writing to log file: ${err}`);
    }
  });
};

/**
 * Checks whether a port is available.
 */
function checkPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      }
    });

    server.once("listening", () => {
      server.close();
      resolve(true);
    });

    server.listen(port);
  });
}

/**
 * Picks a free port, starting at the given number.
 */
export async function getAvailablePort(startPort: number): Promise<number> {
  let port = startPort;
  while (!(await checkPortAvailable(port))) {
    elizaLogger.warn(`Port ${port} is in use, trying ${port + 1}`);
    port++;
  }
  return port;
}

/**
 * Creates a Memory object with a standard payload.
 */
export function createMemory(
  runtime: AgentRuntime,
  room: RoomKey,
  text = "Periodic check from Memeoor.",
): Memory {
  return {
    id: stringToUuid(Date.now().toString()),
    content: { text, action: "START" },
    roomId: stringToUuid(room),
    userId: stringToUuid("memeoor-user-1"),
    agentId: runtime.agentId,
  };
}

/**
 * Extracts and triggers the two plugin actions.
 * Returns true if the first action returned a truthy response.
 */
export async function triggerPluginActions(
  runtime: AgentRuntime,
  mem: Memory,
): Promise<boolean> {
  const plugin = runtime.plugins[0] as Plugin;
  const actions = plugin.actions as Action[];
  const tweetAction = actions[0] as Action;
  const memeInteractAction = actions[1] as Action;

  elizaLogger.log(`[Trigger] Executing tweet action...`);
  logMessageToFile("INFO", "ELIZA_MEMEOOORR", "Executing tweet action...");
  const result = await tweetAction.handler(
    runtime,
    mem,
    undefined,
    undefined,
    undefined,
  );
  if (result) {
    const checkSafeAddress = runtime.getSetting("SAFE_ADDRESS");
    if (!checkSafeAddress) {
      elizaLogger.warn("SAFE_ADDRESS setting is not set");
      elizaLogger.warn("Token Interaction behaviour won't be executed");
      return false;
    }
    elizaLogger.log(
      `[Trigger] Tweet was successful. Executing meme interaction...`,
    );

    const logMessage = `[Trigger] Meme interaction was successful. Result: ${result}`;

    logMessageToFile("INFO", "ELIZA_MEMEOOORR", logMessage);
    mem.roomId = stringToUuid(ROOMS.TOKEN_INTERACTION);
    await memeInteractAction.handler(
      runtime,
      mem,
      undefined,
      undefined,
      undefined,
    );
  } else {
    elizaLogger.warn("Tweet Interaction behaviour was unsuccessful");
    logMessageToFile(
      "WARN",
      "ELIZA_MEMEOOORR",
      "Tweet Interaction behaviour was unsuccessful",
    );
  }
  return Boolean(result);
}
