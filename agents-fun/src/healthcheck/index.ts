// healthcheck/index.ts

import { AgentRuntime, stringToUuid, type Memory } from "@elizaos/core";
import { DirectClient } from "@elizaos/client-direct";
import type { HealthCheckResponse } from "../types";
import { ROOMS } from "config";

export function registerHealthCheckRoute(
  runtime: AgentRuntime,
  directClient: DirectClient,
) {
  directClient.app.get("/healthcheck", async (req, res) => {
    // 1. Fetch the last memory to see when the agent last did something.
    let lastMemoryTimestamp = 0;
    const now = Date.now();

    try {
      const recentMemories: Memory[] =
        await runtime.databaseAdapter.getMemories({
          roomId: stringToUuid(ROOMS.TWITTER_INTERACTION),
          tableName: ROOMS.START,
          agentId: runtime.agentId,
          count: 1, // Only need the most recent memory
        });

      if (recentMemories && recentMemories.length > 0) {
        lastMemoryTimestamp = recentMemories[0].createdAt || 0;
      }
    } catch (err) {
      console.error("Error fetching memories for healthcheck:", err);
      // If we can’t fetch memories, we might assume the agent is unhealthy or stuck.
    }

    // 2. Compute how many seconds since the agent last created a memory.
    const secondsSinceLastTransition = (now - lastMemoryTimestamp) / 1000;

    // 3. Decide if the agent is "transitioning fast" or stuck.
    //    For example, if the agent has not created a memory in over 120 seconds, we assume it's stuck.
    const isTransitioningFast = secondsSinceLastTransition < 120;

    // 4. Build your healthcheck response. Many fields can be dummy for now.
    const healthCheckData: HealthCheckResponse = {
      seconds_since_last_transition: secondsSinceLastTransition.toFixed(2),
      is_tm_healthy: true, // Dummy
      period: 30, // Dummy
      reset_pause_duration: 120, // Dummy
      rounds: ["dummy_round_1", "dummy_round_2"], // Dummy example
      is_transitioning_fast: isTransitioningFast,
      agent_health: {
        is_making_on_chain_transactions: false, // Dummy
        is_staking_kpi_met: false, // Dummy
        has_required_funds: true, // Dummy
        staking_status: "healthy", // Dummy
      },
      rounds_info: {
        dummy_round_1: {
          name: "Dummy Round 1",
          description: "An example of a starting round",
          transitions: {
            event_a: "dummy_round_2",
          },
        },
        dummy_round_2: {
          name: "Dummy Round 2",
          description: "An example of a follow-up round",
          transitions: {
            event_b: "dummy_round_1",
          },
        },
      },
      env_var_status: {
        needs_update: false,
        env_vars: {},
      },
    };

    // 5. Send the healthcheck response.
    res.json(healthCheckData);
  });
}
