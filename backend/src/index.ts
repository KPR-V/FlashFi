// import { Agent } from "@covalenthq/ai-agent-sdk";
// import { user } from "@covalenthq/ai-agent-sdk/dist/core/base";
// import { StateFn } from "@covalenthq/ai-agent-sdk/dist/core/state";

// const agent = new Agent({
//   name: "normal agent",
//   model: {
//     provider: "OLLAMA",
//     name: "deepseek-r1:latest",
//     baseURL: "http://localhost:11434",
//   },
//   description: "this is a friendy agent ",
//   instructions: ["chat with the user in a friendly manner"]
// });

// const state = StateFn.root(agent.description);
// state.messages.push(user("tell me what is a ionic bond"));
// async function main() {
//   const result = await agent.run(state);
//   console.log(result);
//   const content = result.messages[result.messages.length - 1]?.content;
//   console.log(content);
// }

// try {
//   main();
// } catch (error: any) {
//   console.log(error);
// }

import "dotenv/config";
import { AddressLike, ethers } from "ethers";
import { Agent, createTool } from "@covalenthq/ai-agent-sdk";
import { user } from "@covalenthq/ai-agent-sdk/dist/core/base";
import { StateFn } from "@covalenthq/ai-agent-sdk/dist/core/state";
import z from "zod";

// // Sample retriever function
// const retriever = async (
//   messages: ChatCompletionMessageParam[],
//   agent: Agent,
//   state: any
// ): Promise<{ content: string }[]> => {
//   // In a real implementation, you could hit an embeddings API and a vector database.
//   // Here, we provide a dummy implementation that returns a static retrieval message.
//   return Promise.resolve([
//     {
//       content:
//         "Additional context: Ionic bonds involve the transfer of electrons between atoms.",
//     },
//   ]);
// };
const tool = createTool({
  id: "tool",
  description:
    "this tool can be used to send sepolia from one account to another",
  schema: z.object({
    to: z.string().describe("the address to send to"),
    amount: z.number().describe("the amount to send"),
  }),
  execute: async ({ to, amount }: { to: AddressLike; amount: number }) => {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
    async function sendTransaction(to: AddressLike, amountInEth: string) {
      try {
        const gasPrice = await provider.getFeeData().then((f) => f.gasPrice);
  
        const tx = {
          to,
          value: ethers.parseEther(amountInEth),
          gasLimit: 21000,
          gasPrice: gasPrice,
        };
  
        const transaction = await wallet.sendTransaction(tx);
        console.log("Transaction Hash:", transaction.hash);
  
        await transaction.wait();
        console.log("Transaction Confirmed!");
        return transaction.hash;
      } catch (error) {
        console.error("Transaction Failed:", error);
        throw new Error("Transaction failed");
      }
    }
    return await sendTransaction(to, amount.toString());
  }
});


const agent = new Agent({
  name: "normal agent",
  model: {
    provider: "OLLAMA",
    name: "deepseek-r1:latest",
    baseURL: "http://localhost:11434",
  },
  description:
    "this ia an ai agent that can perform transaction on blockchain using the tools provided",
  instructions: ["use the tool to send sepolia from one account to another"],
  tools: { tool },
});

const state = StateFn.root(agent.description);
state.messages.push(
  user(
    "send 0.1 sepolia to 0x5FbDB2315678afecb367f032d93F642f64180aa3"
  )
);

async function main() {
  console.time("run");
  const result = await agent.run(state);
  console.timeEnd("run");
  const content =
    ///@ts-ignore
    result.messages[result.messages.length - 1]?.content.content.answer.toString();
  console.log(content);
}

try {
  main();
} catch (error: any) {
  console.log(error);
}
