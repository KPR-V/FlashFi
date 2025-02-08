import "dotenv/config";
import { Agent } from "@covalenthq/ai-agent-sdk";
import { transactionTool } from "./transaction-agent";
import { portfolioTool } from "./portfolio-agent";
import { gasPriceTool } from "./gasprice-agent";
import { securityTool } from "./security-agent";
import { swapTool } from "./swap-agent";
// Create a single agent with all tools
const blockchainAgent = new Agent({
  name: "blockchain assistant",
  model: {
    provider: "OPEN_AI",
    name: "gpt-4o-mini",
    apiKey: process.env.OPEN_AI_API_KEY!,
  },
  description:
    "A comprehensive blockchain assistant that can handle transactions, check balances, estimate gas prices, analyze security, and perform cross-chain swaps",
  instructions: [
    "For swap requests:",
    "- Execute swapTool ONLY, do not check balance or gas automatically",
    "- If swap fails due to insufficient funds, inform user clearly",
    "- Do not execute other tools unless specifically requested",
    "For other operations:",
    "- Use transactionTool for sending tokens",
    "- Use portfolioTool for balance checks only when explicitly requested",
    "- Use gasPriceTool for gas estimates only when explicitly requested",
    "- Use securityTool for approval checks only when explicitly requested",
    "Never combine multiple tool calls unless specifically asked by user",
  ],
  tools: {
    transactionTool,
    portfolioTool,
    gasPriceTool,
    securityTool,
    swapTool,
  },
});

export {
  blockchainAgent,
  transactionTool,
  portfolioTool,
  gasPriceTool,
  securityTool,
  swapTool,
};
