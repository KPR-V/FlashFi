import { ethers, AddressLike } from "ethers";
import { Agent, createTool } from "@covalenthq/ai-agent-sdk";
import { z } from "zod";
import "dotenv/config";
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

const transactionagent = new Agent({
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

export { transactionagent, transactionTool };
