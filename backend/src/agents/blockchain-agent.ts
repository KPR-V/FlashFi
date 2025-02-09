import "dotenv/config";
import { Agent } from "@covalenthq/ai-agent-sdk";
import { transactionTool } from "./transaction-agent";
import { portfolioTool } from "./portfolio-agent";
import { gasPriceTool } from "./gasprice-agent";
import { securityTool } from "./security-agent";
import { swapTool } from "./swap-agent";
import { stakeTool } from "./stake-agent";
import { bridgeTool } from "./bridge-agent";
import { combinedChatTool } from "./general-agent";
const blockchainAgent = new Agent({
  name: "blockchain assistant",
  model: {
    provider: "OPEN_AI",
    name: "gpt-4o-mini",
    apiKey: process.env.OPEN_AI_API_KEY!,
  },
  description:
    "A multifaceted blockchain assistant: handles staking, swaps, balances, approvals check, gas queries, and USDC bridging between networks",
  instructions: [
    "For messages containing 'stake', always call stakeTool.execute({ amount: X }).",
    "For swaps explicitly requested, call swapTool.execute().",
    "For gas queries, call gasPriceTool.execute().",
    "For balance checks, call portfolioTool.execute().",
    "For bridge operations, call bridgeTool.execute() with amount and optional recipient.",
    "Never combine stakeTool and swapTool in the same response.",
    "Return a single tool call with minimal additional text.",
    "For security checks, call securityTool.execute().",
    "for genral chat, call combinedChatTool.execute().",
    "for sending transaction, call transactionTool.execute().",
  ],
  tools: {
    stakeTool,
    swapTool,
    gasPriceTool,
    portfolioTool,
    securityTool,
    transactionTool,
    bridgeTool,
    combinedChatTool,
  },
});

export {
  blockchainAgent,
  transactionTool,
  portfolioTool,
  gasPriceTool,
  securityTool,
  swapTool,
  stakeTool,
  bridgeTool,
  combinedChatTool,
};
