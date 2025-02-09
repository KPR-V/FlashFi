import { createTool, Agent } from "@covalenthq/ai-agent-sdk";
import { z } from "zod";
import "dotenv/config";
import { Chain, GoldRushClient } from "@covalenthq/client-sdk";
import serializeBigInt from "../utils/serializebigint";
const client = new GoldRushClient(process.env.GOLDRUSH_API_KEY!);
// Get chain values dynamically using getAllChains()
const getChainValues = async (): Promise<[string, ...string[]]> => {
  try {
    const response = await client.BaseService.getAllChains();
    if (response.error || !response.data?.items) {
      return ["eth-mainnet"] as [string, ...string[]];
    }
    
    const chains = response.data.items.map(chain => chain.name);
    return [chains[0], ...chains.slice(1)] as [string, ...string[]];
  } catch (error) {
    console.error('Failed to fetch chains:', error);
    return ["eth-mainnet"] as [string, ...string[]];
  }
};
const gasPriceTool = createTool({
  id: "gas-price-tool",
  description:
    "Fetch real-time gas price estimates for a specific blockchain network.",
  schema: z.object({
    chainId: z
      .string()
      .describe("The chain identifier (e.g., eth-mainnet, matic-mainnet)")
      .refine(
        async (val) => {
          const chains = await getChainValues();
          return chains.includes(val);
        },
        {
          message: "Invalid chain identifier",
        }
      ),
    eventType: z
      .enum(["erc20", "nativetokens", "uniswapv3"])
      .describe("Type of transaction (erc20, nativetokens, or uniswapv3)"),
    quoteCurrency: z
      .literal("USD")
      .describe("The currency to convert gas prices to (only USD supported)"),
  }),
  execute: async (parameters: unknown) => {
    try {
      const { chainId, eventType } = parameters as {
        chainId: Chain;
        eventType: "erc20" | "nativetokens" | "uniswapv3";
      };
      const chainName = chainId === "1" ? "eth-mainnet" : chainId;

      const gasPrices = await client.BaseService.getGasPrices(
        chainName as Chain,
        eventType,
        { quoteCurrency: "USD" }
      );

      if (gasPrices.error) {
        throw new Error(
          gasPrices.error_message || "Failed to fetch gas prices"
        );
      }

      return JSON.stringify({
        status: "success",
        data: serializeBigInt(gasPrices.data),
        eventType,
        quoteCurrency: "USD",
      });
    } catch (error) {
      return JSON.stringify({
        status: "error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        chainId: (parameters as { chainId: Chain }).chainId,
      });
    }
  },
});

const gasPriceAgent = new Agent({
  name: "gas price agent",
  model: {
    provider: "OPEN_AI",
    name: "gpt-4o-mini",
    apiKey: process.env.OPEN_AI_API_KEY!,
  },
  description:
    "Provides real-time gas price estimates for blockchain transactions.",
  instructions: [
    "Use the gas price tool to fetch current gas price estimates.",
    "Ask user for the type of transaction (erc20, nativetokens, or uniswapv3) if not specified.",
    "Default to 'nativetokens' if transaction type is unclear.",
    "Return gas prices in different formats (low, medium, high) if available.",
  ],
  tools: { gasPriceTool },
});

export { gasPriceAgent, gasPriceTool };
