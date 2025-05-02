// src/initCharacter.ts
import { type Character, models, ModelProviderName, ModelClass, elizaLogger } from "@elizaos/core";
import { loadConfig, type Config } from "./initConfig";
import { loadCharacterFromArgs, getTokenForProvider } from "./config/index";

/**
 * Initializes and configures the bot character.
 */
export async function initCharacter(): Promise<{ character: Character; token: string; config: Config }> {
  const config = loadConfig();

  // Load character JSON from CLI
  const character = await loadCharacterFromArgs();
  character.settings ??= {};

  // Apply secrets and endpoints
  character.settings.secrets = {
    OPENAI_API_KEY: config.openAiApiKey,
    TWITTER_USERNAME: config.twitterUsername,
    TWITTER_PASSWORD: config.twitterPassword,
    TWITTER_EMAIL: config.twitterEmail,
    AGENT_EOA_PK: config.pvtKey, // agent wallet key loaded elsewhere if needed
    BASE_LEDGER_RPC: config.baseLedgerRpc,
    MEME_FACTORY_CONTRACT: config.memeFactoryContract,
    SAFE_ADDRESS_DICT: config.safeAddressDict,
    SAFE_ADDRESS: JSON.parse(config.safeAddressDict).base,
    SUBGRAPH_URL: config.subgraphUrl,
    MEME_SUBGRAPH_URL: config.memeSubgraphUrl,
    CHAIN_ID: config.chainId,
  };
  elizaLogger.info("Character settings[BASE_LEDGER_RPC]:", character.settings.secrets.BASE_LEDGER_RPC);
  elizaLogger.info("Character settings[SAFE_ADDRESS]:", character.settings.secrets.SAFE_ADDRESS);

  // Choose OpenAI provider and models
  character.modelProvider = ModelProviderName.OPENAI;
  character.settings.model =
    models[ModelProviderName.OPENAI].model[ModelClass.LARGE];
  character.settings.embeddingModel =
    models[ModelProviderName.OPENAI].model[ModelClass.EMBEDDING];

  // Acquire token
  const token = getTokenForProvider(character.modelProvider, character) ?? "";

  return { character, token, config };
}
