import { z } from "zod";
import { Agent, createTool } from "@covalenthq/ai-agent-sdk";
import { ethers } from "ethers";
import axios from "axios";
import "dotenv/config";


// const SUPPORTED_SWAPS = {
//   USDC_ETH_MAINNET_ARBITRUM: {
//     fromChainId: "1",
//     toChainId: "42161",
//     fromToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
//     toToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
//     fromDecimals: 6,
//   },
//   ARB_Binance_ARBITRUM: {
//     fromChainId: "43114",
//     toChainId: "42161",
//     fromToken: "0x264c1383ea520f73dd837f915ef3a732e204a493",
//     toToken: "0x912ce59144191c1204e64559fe8253a0e49e6548",
//     fromDecimals: 18,
//   },
// };

const privateKey = process.env.PRIVATE_KEY;
const integratorId = process.env.INTEGRATOR_ID;
const FROM_CHAIN_RPC = process.env.FROM_CHAIN_RPC;
// Define chain and token addresses
const fromChainId = "1"; // ETH
const toChainId = "42161"; // Arbitrum
const fromToken1 = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // USDC
const toToken1 = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"; // ETH
// const amount = "10000000";
const provider = new ethers.JsonRpcProvider(FROM_CHAIN_RPC);
const signer = new ethers.Wallet(privateKey!, provider);

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

const swapTool = createTool({
  id: "cross-chain-swap-tool",
  description: "Execute cross-chain token swaps using Squid Router",
  schema: z.object({
    fromToken: z.string(),
    toToken: z.string(),
    amount: z.string(),
    fromChain: z.string(),
    toChain: z.string(),
  }),
  execute: async (parameters: unknown) => {
    try {
      const { amount } = parameters as { amount: string };
      const params = {
        fromAddress: signer.address,
        fromChain: fromChainId,
        fromToken: fromToken1,
        fromAmount: ethers.parseUnits(amount.toString(), 6).toString(),
        toChain: toChainId,
        toToken: toToken1,
        toAddress: signer.address,
      };

      console.log("Getting route for swap...");
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

      return JSON.stringify({
        status: "success",
        message: "Swap executed successfully",
        txHash: tx.hash,
        axelarScanLink
      });
    } catch (error) {
      return JSON.stringify({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  },
});

// Update agent instructions to be more generic
const swapAgent = new Agent({
  name: "cross-chain swap agent",
  model: {
    provider: "OPEN_AI",
    name: "gpt-4o-mini",
    apiKey: process.env.OPEN_AI_API_KEY!,
  },
  description: "cross-chain swap assistant using Squid Router",
  instructions: [
    "Execute swap requests immediately without additional checks",
    "Parse natural language swap requests into parameters",
    "If a swap combination is not supported, inform the user clearly",
    "Don't check balances or gas prices unless specifically asked",
  ],
  tools: { swapTool },
});

export { swapAgent, swapTool };
