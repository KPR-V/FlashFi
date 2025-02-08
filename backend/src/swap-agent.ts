import { z } from "zod";
import { Agent, createTool } from "@covalenthq/ai-agent-sdk";
import { ethers } from "ethers";
import axios from "axios";
// import tokens from "../test/tokens.json";
import "dotenv/config";

const privateKey = process.env.PRIVATE_KEY;
const integratorId = process.env.INTEGRATOR_ID;
const FROM_CHAIN_RPC = process.env.FROM_CHAIN_RPC;
// Define chain and token addresses
const fromChainId = "1"; // ETH
const toChainId = "42161"; // Arbitrum
const fromToken = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // USDC
const toToken = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"; // ETH
// const amount = "10000000";
const provider = new ethers.JsonRpcProvider(FROM_CHAIN_RPC);
const signer = new ethers.Wallet(privateKey!, provider);

const swapTool = createTool({
  id: "cross-chain-swap-tool",
  description: "Execute cross-chain token swaps using Squid Router",
  schema: z.object({
    fromToken: z.string(),
    toToken: z.string(),
    amount: z.number(),
    fromChainId: z.string(),
    toChainId: z.string(),
  }),
  execute: async (parameters: unknown) => {
    const {amount } = parameters as { amount: number };
    const getRoute = async (params: any) => {
      try {
        const result = await axios.post(
          "https://apiplus.squidrouter.com/v2/route",
          params,
          {
            headers: {
              "x-integrator-id": integratorId,
              "Content-Type": "application/json",
            },
          }
        );
        const requestId = result.headers["x-request-id"];
        return { data: result.data, requestId: requestId };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          console.error("API error:", error.response.data);
        }
        console.error("Error with parameters:", params);
        throw error;
      }
    };

    (async () => {
      const params = {
        fromAddress: signer.address,
        fromChain: fromChainId,
        fromToken: fromToken,
        fromAmount: ethers.parseUnits(amount.toString(), 6).toString(),
        toChain: toChainId,
        toToken: toToken,
        toAddress: signer.address,
      };

      console.log("Parameters:", params);

      const routeResult = await getRoute(params);
      const route = routeResult.data.route;
      const requestId = routeResult.requestId;
      console.log("Calculated route:", route);
      console.log("requestId:", requestId);

      const transactionRequest = route.transactionRequest;
      // Execute the swap transaction
      const tx = await signer.sendTransaction({
        to: transactionRequest.target,
        data: transactionRequest.data,
        value: transactionRequest.value,
        gasPrice: await provider.getFeeData().then((f) => f.gasPrice),
        gasLimit: transactionRequest.gasLimit,
      });
      console.log("Transaction Hash:", tx.hash);
      const txReceipt = await tx.wait();
      const axelarScanLink = "https://axelarscan.io/gmp/" + txReceipt?.hash;
      console.log(`Finished! Check Axelarscan for details: ${axelarScanLink}`);
    })();
    return JSON.stringify({
      status: "success",
      message: "Swap executed successfully",
    });
  },
});

// Update the agent to handle tool execution directly
const swapAgent = new Agent({
  name: "cross-chain swap agent",
  model: {
    provider: "OPEN_AI",
    name: "gpt-4o-mini",
    apiKey: process.env.OPEN_AI_API_KEY!,
  },
  description: "cross-chain swap assistant using Squid Router",
  instructions: [
    "1. Parse natural language swap requests",
    "2. When user asks to swap tokens, execute the swap tool with the parsed parameters",
    "3. When user asks to execute a swap transaction, call the swap tool immediately",
    "4. Format: swap [token1] on [chain1] to [token2] on [chain2]",
    "5. Example: 'swap usdc on mainnet to eth on arbitrum'",
    "6. Always execute the swap tool when a valid swap request is received",
    "7. Provide transaction status and confirmation after execution",
  ],
  tools: { swapTool },
});

export { swapAgent, swapTool };
