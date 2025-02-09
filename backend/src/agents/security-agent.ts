import { createTool, Agent } from "@covalenthq/ai-agent-sdk";
import { z } from "zod";
import "dotenv/config";
import { Chain, GoldRushClient } from "@covalenthq/client-sdk";
import serializeBigInt from "../utils/serializebigint";
const client = new GoldRushClient(process.env.GOLDRUSH_API_KEY!);

// Security Tool: Retrieve token and NFT approvals -- it means the wallet has approved a contract to spend its tokens or NFTs on its behalf without user interaction for each transaction it gives those contracts
const securityTool = createTool({
  id: "security-tool",
  description: "Retrieve token and NFT approvals for a wallet.",
  schema: z.object({
    chainName: z.string(),
    walletAddress: z.string(),
  }),
  execute: async (parameters: unknown) => {
    try {
      const { chainName, walletAddress } = parameters as {
        chainName: Chain;
        walletAddress: string;
      };
      const approvals = await client.SecurityService.getApprovals(
        chainName,
        walletAddress
      );

      if (approvals.error) {
        throw new Error("Error fetching approvals data");
      }

      return JSON.stringify({
        status: "success",
        approvals: serializeBigInt(approvals.data),
      });
    } catch (error) {
      return JSON.stringify({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
});

// 🔹 **Security Agent**
const securityAgent = new Agent({
  name: "security agent",
  model: {
    provider: "OPEN_AI",
    name: "gpt-4o-mini",
    apiKey: process.env.OPEN_AI_API_KEY!,
  },
  description:
    "Monitors and analyzes token and NFT approvals for potential security risks.",
  instructions: [
    "Use the security tool to check a wallet's token and NFT approvals.",
    "Ensure the user provides a valid blockchain network (chainName) and wallet address.",
    "Flag any unusual or potentially risky approvals, such as unlimited spending allowances.",
  ],
  tools: { securityTool },
});

export { securityAgent, securityTool };
