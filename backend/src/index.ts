import "dotenv/config";
import { AddressLike, ethers } from "ethers";
import { Agent, createTool } from "@covalenthq/ai-agent-sdk";
import { user } from "@covalenthq/ai-agent-sdk/dist/core/base";
import { StateFn } from "@covalenthq/ai-agent-sdk/dist/core/state";
import { z } from "zod";
import type { Tool } from"@covalenthq/ai-agent-sdk";
import type {
  ChatCompletionToolMessageParam,
} from "openai/resources/chat/completions";
import type { ParsedFunctionToolCall } from "openai/resources/beta/chat/completions";
const transactionTool = createTool({
  id: "transaction-tool",
  description: "Send Sepolia ETH from one account to another",
  schema: z.object({
    to: z.string().describe("recipient address"),
    amount: z.number().describe("amount in ETH to send"),
  }),
  execute: async (parameters: unknown) => {
    try {
      const { to, amount } = parameters as { to: AddressLike; amount: number };
      console.log("Executing transaction tool");
      const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
      const [gasPrice, balance] = await Promise.all([
        provider.getFeeData().then((f) => f.gasPrice!),
        provider.getBalance(wallet.address),
      ]);
      const valueInWei = ethers.parseEther(amount.toString());
      if (valueInWei > balance) {
        return JSON.stringify({
          status: "error",
          message: `Insufficient balance. You have ${ethers.formatEther(
            balance
          )} ETH`,
        });
      }
    console.log("Transaction tool executed");
      const tx = {
        to,
        value: valueInWei,
        gasLimit: BigInt(21000),
        gasPrice,
      };
      console.log("Sending transaction:", tx);
      const transaction = await wallet.sendTransaction(tx);
      console.log("Transaction sent:", transaction.hash);
      const receipt = await transaction.wait();
      if (!receipt) throw new Error("Transaction failed");
      return JSON.stringify({
        status: "success",
        hash: transaction.hash,
        blockNumber: receipt.blockNumber,
        from: wallet.address,
        to,
        amount: amount.toString(),
        gasCost: ethers.formatEther(receipt.gasUsed * gasPrice),
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
      });
    }
  },
});

const agent = new Agent({
  name: "transaction agent",
  model: {
    provider: "OPEN_AI",
    name: "gpt-4o-mini",
    apiKey: process.env.OPEN_AI_API_KEY!,
  },
  description:
    "You are a blockchain transaction agent that helps users send Sepolia ETH",
  instructions: [
    "Use the transaction tool to send Sepolia ETH to another address",
  ],
  tools: { transactionTool },
});

async function main() {
  const state = StateFn.root(agent.description);
  state.messages.push(
    user(
      " send  0.01 sepolia ETH to 0x5352b10D192475cA7Fa799e502c29Ab3AA28657F"
    )
  );
  try {
    const result =  await agent.run(state);
    const lastMessage = result.messages[result.messages.length - 1] as any;
    console.log("Last message:", lastMessage.tool_calls[0].function.arguments);
    if (lastMessage.tool_calls) {
      // const toolResponse = await transactionTool.execute({
      //   to: "0x5352b10D192475cA7Fa799e502c29Ab3AA28657F",
      //   amount: 0.01
      // });
      const toolResponse = await runToolCalls(
        { transactionTool },
        lastMessage.tool_calls
      );
      console.log("Transaction result:", toolResponse);
    }
  } catch (error) {
    console.error("Transaction failed:", error);
  }
}
async function runToolCalls(
  tools: Record<string, Tool>,
  toolCalls: ParsedFunctionToolCall[]
): Promise<ChatCompletionToolMessageParam[]> {
  const results = await Promise.all(
    toolCalls.map(async (tc) => {
      if (tc.type !== "function") {
        throw new Error("Tool call needs to be a function");
      }

      const tool = tools[tc.function.name];
      if (!tool) {
        throw new Error(`Tool ${tc.function.name} not found`);
      }

      const response = await tool.execute(JSON.parse(tc.function.arguments));

      return {
        role: "tool",
        tool_call_id: tc.id,
        content: response,
      } satisfies ChatCompletionToolMessageParam;
    })
  );

  return results;
}
main().catch(console.error);