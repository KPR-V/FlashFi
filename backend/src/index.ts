import "dotenv/config";
import { user } from "@covalenthq/ai-agent-sdk/dist/core/base";
import { StateFn } from "@covalenthq/ai-agent-sdk/dist/core/state";
import type { ParsedFunctionToolCall } from "openai/resources/beta/chat/completions";
import runToolCalls from "./utils/runtoolcalls";
import { securityAgent, securityTool } from "./security-agent";
import { gasPriceAgent, gasPriceTool } from "./gasprice-agent";
import { transactionTool, transactionagent } from "./transaction-agent";
import { swapAgent, swapTool } from "./swap-agent";
import { portfolioAgent, portfolioTool } from "./portfolio-agent";
async function main() {
  const state = StateFn.root(swapAgent.description);
  state.messages.push(
    user(
      "i want to swap 0.001 USDC on Ethereum to ETH on Arbitrum"
    )
  );
  try {
    const result = await swapAgent.run(state);
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
        { swapTool },
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
