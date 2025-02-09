import { z } from "zod";
import { Agent, createTool } from "@covalenthq/ai-agent-sdk";
import { ethers } from "ethers";
import axios from "axios";
import "dotenv/config";
import radiantLendingPoolAbi from "../abi/radiantLendingPoolAbi.json";
import erc20Abi from "../abi/erc20Abi.json";

const privateKey = process.env.PRIVATE_KEY!;
const integratorId = process.env.INTEGRATOR_ID!;
const FROM_CHAIN_RPC = process.env.FROM_CHAIN_RPC!;
const radiantLendingPoolAddress = process.env.RADIANT_LENDING_POOL_ADDRESS!;
const usdcArbitrumAddress = process.env.USDC_ARBITRUM_ADDRESS!;

const provider = new ethers.JsonRpcProvider(FROM_CHAIN_RPC);
const signer = new ethers.Wallet(privateKey, provider);

const erc20Interface = new ethers.Interface(erc20Abi);
const radiantLendingPoolInterface = new ethers.Interface(radiantLendingPoolAbi);
const fromChainId = "56"; // Binance
const toChainId = "42161"; // Arbitrum
const fromToken1 = "0x55d398326f99059fF775485246999027B3197955"; // USDT on BSC
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
    return { data: result.data, requestId: result.headers["x-request-id"] };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("API error:", error.response.data);
    }
    console.error("Error with parameters:", params);
    throw error;
  }
};

const cleanAmount = (amount: string): string => {
  return amount.replace(/[^0-9.]/g, "");
};

const stakeTool = createTool({
  id: "cross-chain-stake-tool",
  description:
    "Bridges assets from one chain to another and deposits into the Radiant lending pool with minimal user steps",
  schema: z.object({
    amount: z.string(),
  }),
  execute: async (parameters: unknown) => {
    try {
      const { amount } = parameters as {
        amount: string;
      };
      const cleanedAmount = cleanAmount(amount);

      const approvalerc20 = erc20Interface.encodeFunctionData("approve", [
        radiantLendingPoolAddress,
        ethers.MaxUint256,
      ]);

      const depositEncodedData = radiantLendingPoolInterface.encodeFunctionData(
        "deposit",
        [usdcArbitrumAddress, "0", signer.address, 0]
      );

      const params = {
        fromAddress: signer.address,
        fromChain: fromChainId, // Changed from fromChainId to fromChain
        toChain: toChainId, // Changed from toChainId to toChain
        fromToken: fromToken1,
        fromAmount: ethers.parseUnits(cleanedAmount, 18).toString(),
        toToken: usdcArbitrumAddress,
        toAddress: signer.address,
        slippage: 1,
        postHook: {
          chainType: "evm",
          calls: [
            {
              callType: 1,
              target: usdcArbitrumAddress,
              value: "0",
              callData: approvalerc20,
              payload: {
                tokenAddress: usdcArbitrumAddress,
                inputPos: "1",
              },
              estimatedGas: "50000",
              chainType: "evm",
            },
            {
              callType: 1,
              target: radiantLendingPoolAddress,
              value: "0",
              callData: depositEncodedData,
              payload: {
                tokenAddress: usdcArbitrumAddress,
                inputPos: "1",
              },
              estimatedGas: "50000",
              chainType: "evm",
            },
          ],
          provider: "Squid",
          description: "Radiant Lend",
          logoURI:
            "https://pbs.twimg.com/profile_images/1548647667135291394/W2WOtKUq_400x400.jpg",
        },
      };

      const routeResult = await getRoute(params);
      const route = routeResult.data.route;

      const tx = await signer.sendTransaction({
        to: route.transactionRequest.target,
        data: route.transactionRequest.data,
        value: route.transactionRequest.value,
        gasPrice: await provider.getFeeData().then((f) => f.gasPrice),
        gasLimit: route.transactionRequest.gasLimit,
      });

      const txReceipt = await tx.wait();
      const axelarScanLink = "https://axelarscan.io/gmp/" + txReceipt?.hash;

      return JSON.stringify({
        status: "success",
        message: "Staking executed successfully",
        txHash: tx.hash,
        axelarScanLink,
      });
    } catch (error) {
      return JSON.stringify({
        status: "error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
});

const stakeAgent = new Agent({
  name: "cross-chain stake agent",
  model: {
    provider: "OPEN_AI",
    name: "gpt-4o-mini",
    apiKey: process.env.OPEN_AI_API_KEY!,
  },
  description:
    "A specialized staking assistant for cross-chain deposits into Radiant using Squid Router",
  instructions: [
    "Accept immediate staking instructions and perform cross-chain bridging automatically.",
    "Use stakeTool.execute({ amount: X }) for any 'stake' requests.",
    "Do not combine with other tools if 'stake' is detected.",
  ],
  tools: { stakeTool },
});

export { stakeAgent, stakeTool };
