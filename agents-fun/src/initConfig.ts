// src/initConfig.ts
import dotenv from "dotenv";
import { SUBGRAPH_URLS, CONTRACTS } from "./config/index";

dotenv.config();  // load .env file if present

/**
 * Application-wide configuration loaded from environment.
 */
export interface Config {
  storePath: string;
  openAiApiKey: string;
  useOpenAIEmbedding: boolean;
  useOpenAIEmbeddingType: boolean;
  subgraphUrl: string;
  memeSubgraphUrl: string;
  chainId: string;
  baseLedgerRpc: string;
  memeFactoryContract: string;
  safeAddressDict: string;
  twitterUsername: string;
  twitterPassword: string;
  twitterEmail: string;
  serverPort: number;  // add port for DirectClient server
}

/**
 * Helper to fetch required env var or throw.
 */
function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

/**
 * Load and validate all configuration values.
 */
export function loadConfig(): Config {
  // primary data store path
  const storePath = process.env.STORE_PATH ?? requireEnv("CONNECTION_CONFIGS_CONFIG_STORE_PATH");
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? requireEnv("CONNECTION_CONFIGS_CONFIG_OPENAI_API_KEY");
  process.env.TWITTER_USERNAME = process.env.TWITTER_USERNAME ?? requireEnv("CONNECTION_CONFIGS_CONFIG_TWIKIT_USERNAME");
  process.env.TWITTER_PASSWORD = process.env.TWITTER_PASSWORD ?? requireEnv("CONNECTION_CONFIGS_CONFIG_TWIKIT_PASSWORD");
  process.env.TWITTER_EMAIL = process.env.TWITTER_EMAIL ?? requireEnv("CONNECTION_CONFIGS_CONFIG_TWIKIT_EMAIL");
  process.env.USE_OPENAI_EMBEDDING = process.env.USE_OPENAI_EMBEDDING ?? "true";
  process.env.USE_OPENAI_EMBEDDING_TYPE = process.env.USE_OPENAI_EMBEDDING_TYPE ?? "true";

  return {
    storePath,
    openAiApiKey: requireEnv("CONNECTION_CONFIGS_CONFIG_OPENAI_API_KEY"),
    useOpenAIEmbedding: (process.env.USE_OPENAI_EMBEDDING ?? "false").toUpperCase() === "TRUE",
    useOpenAIEmbeddingType: (process.env.USE_OPENAI_EMBEDDING_TYPE ?? "false").toUpperCase() === "TRUE",
    subgraphUrl: SUBGRAPH_URLS.USER_SUBGRAPH_URL,
    memeSubgraphUrl: SUBGRAPH_URLS.MEME_SUBGRAPH_URL,
    chainId: requireEnv("CHAIN_ID"),
    baseLedgerRpc: requireEnv("CONNECTION_CONFIGS_CONFIG_BASE_LEDGER_RPC"),
    memeFactoryContract: CONTRACTS.MEME_FACTORY_CONTRACT,
    safeAddressDict: requireEnv("CONNECTION_CONFIGS_CONFIG_SAFE_CONTRACT_ADDRESSES"),
    twitterUsername: requireEnv("CONNECTION_CONFIGS_CONFIG_TWIKIT_USERNAME"),
    twitterPassword: requireEnv("CONNECTION_CONFIGS_CONFIG_TWIKIT_PASSWORD"),
    twitterEmail: requireEnv("CONNECTION_CONFIGS_CONFIG_TWIKIT_EMAIL"),
    serverPort: parseInt(process.env.SERVER_PORT ?? process.env.CONNECTION_CONFIGS_CONFIG_SERVER_PORT ?? "8716", 10),
  };
}
