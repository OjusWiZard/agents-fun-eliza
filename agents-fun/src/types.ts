import { ROOMS } from "./config/index";

export interface HealthCheckResponse {
  seconds_since_last_transition: string;
  is_tm_healthy: boolean;
  period: number;
  reset_pause_duration: number;
  rounds: string[];
  is_transitioning_fast: boolean;
  agent_health: {
    is_making_on_chain_transactions: boolean;
    is_staking_kpi_met: boolean;
    has_required_funds: boolean;
    staking_status: string;
  };
  rounds_info: {
    [key: string]: {
      name: string;
      description: string;
      transitions: {
        [event: string]: string;
      };
    };
  };
  env_var_status: {
    needs_update: boolean;
    env_vars: {
      [key: string]: string;
    };
  };
}

export type RoomKey = keyof typeof ROOMS; // "TOKEN_INTERACTION" | "TWITTER_INTERACTION"
