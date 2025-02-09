import "dotenv/config";
import { user } from "@covalenthq/ai-agent-sdk/dist/core/base";
import { StateFn } from "@covalenthq/ai-agent-sdk/dist/core/state";
import type { ParsedFunctionToolCall } from "openai/resources/beta/chat/completions";
import runToolCalls from "./utils/runtoolcalls";
import { securityAgent, securityTool } from "./agents/security-agent";
import { gasPriceAgent, gasPriceTool } from "./agents/gasprice-agent";
import { transactionTool, transactionagent } from "./agents/transaction-agent";
import { swapAgent, swapTool } from "./agents/swap-agent";
import { portfolioAgent, portfolioTool } from "./agents/portfolio-agent";
import { stakeAgent, stakeTool } from "./agents/stake-agent";
import { bridgeAgent, bridgeTool } from "./agents/bridge-agent";
async function main() {
  const state = StateFn.root(bridgeAgent.description);
  state.messages.push(
    user("bridge 10 usdc from eth sepolia to avalanche fuji")
  );
  try {
    const result = await bridgeAgent.run(state);
    console.log(" result:", result);
    const lastMessage = result.messages[result.messages.length - 1] as {
      tool_calls?: ParsedFunctionToolCall[];
    };

    if (lastMessage?.tool_calls && lastMessage.tool_calls.length > 0) {
      console.log(
        "Tool call arguments:",
        lastMessage.tool_calls[0].function.arguments
      );
      const toolResponse = await runToolCalls(
        { bridgeTool },
        lastMessage.tool_calls
      );
      console.log("security result:", toolResponse);
    } else {
      console.log("No tool calls found in the response");
    }
  } catch (error) {
    console.error(
      "tool query failed:",
      error instanceof Error ? error.message : error
    );
  }
}

main().catch(console.error);
