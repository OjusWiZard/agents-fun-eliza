import { DirectClient } from "@elizaos/client-direct";

/**
 * Creates and returns a DirectClient instance for ElizaOS.
 */
export function initDirectClient(): DirectClient {
  return new DirectClient();
}
