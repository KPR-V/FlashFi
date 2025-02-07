import "dotenv/config";
import { AddressLike, ethers } from "ethers";
import { Agent, createTool } from "@covalenthq/ai-agent-sdk";
import { user } from "@covalenthq/ai-agent-sdk/dist/core/base";
import { StateFn } from "@covalenthq/ai-agent-sdk/dist/core/state";
import { z } from "zod";
import type { Tool } from "@covalenthq/ai-agent-sdk";
import type { ChatCompletionToolMessageParam } from "openai/resources/chat/completions";
import type { ParsedFunctionToolCall } from "openai/resources/beta/chat/completions";
import { Chain, GoldRushClient } from "@covalenthq/client-sdk";
import { Quote } from "@covalenthq/client-sdk";
const client = new GoldRushClient(process.env.GOLDRUSH_API_KEY!);

function serializeBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

function formatTokenBalance(
  balance: bigint | null | string,
  decimals: number | null
): string {
  if (balance === null) return "0";
  if (decimals === null) decimals = 18; // default to 18 decimals if not specified
  const balanceBigInt = typeof balance === "string" ? BigInt(balance) : balance;
  return ethers.formatUnits(balanceBigInt, decimals);
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

const portfolioTool = createTool({
  id: "portfolio-tool",
  description: "Fetch the token balances for a wallet on a specified chain.",
  schema: z.object({
    chainName: z.string(),
    walletAddress: z.string(),
  }),
  execute: async (parameters: unknown) => {
    try {
      const { chainName, walletAddress } = parameters as {
        chainName: Chain;
        walletAddress: string;
      };
      const balanceResp =
        await client.BalanceService.getTokenBalancesForWalletAddress(
          chainName,
          walletAddress
        );
      if (balanceResp.error) throw new Error(balanceResp.error_message);
      if (!balanceResp.data?.items) {
        return JSON.stringify({
          status: "success",
          data: {
            address: walletAddress,
            chain_name: chainName,
            balances: [],
          },
        });
      }

      // Format the balances in the response
      const formattedItems = balanceResp.data.items.map((item) => ({
        token_name: item.contract_name,
        symbol: item.contract_ticker_symbol,
        balance: formatTokenBalance(item.balance, item.contract_decimals),
        balance_24h: formatTokenBalance(
          item.balance_24h,
          item.contract_decimals
        ),
        decimals: item.contract_decimals || 18, // default to 18 if null
        contract_address: item.contract_address,
        native_token: item.native_token,
        is_spam: item.is_spam,
        logo_url: item.logo_url,
      }));

      return JSON.stringify({
        status: "success",
        data: {
          address: balanceResp.data.address,
          chain_name: balanceResp.data.chain_name,
          balances: formattedItems,
        },
      });
    } catch (error) {
      return JSON.stringify({
        status: "error",
        message: (error as Error).message,
      });
    }
  },
});

// 🔹 **Portfolio Agent**
const portfolioAgent = new Agent({
  name: "portfolio agent",
  model: {
    provider: "OPEN_AI",
    name: "gpt-4o-mini",
    apiKey: process.env.OPEN_AI_API_KEY!,
  },
  description: "Fetches wallet balances and token holdings across blockchains.",
  instructions: [
    "Use the portfolio tool to retrieve the token balances of a given wallet.",
    "Ensure the user provides a valid blockchain network (chainId) and wallet address.",
    "Return the balance in an easy-to-understand format, including token symbols and amounts.",
  ],
  tools: { portfolioTool },
});

// Gas Price Tool: Fetch real-time gas prices
const gasPriceTool = createTool({
  id: "gas-price-tool",
  description:
    "Fetch real-time gas price estimates for a specific blockchain network.",
  schema: z.object({
    chainId: z
      .enum(["eth-mainnet", "1"])
      .describe("The chain name (eth-mainnet or 1)"),
    eventType: z
      .enum(["erc20", "nativetokens", "uniswapv3"])
      .describe("Type of transaction (erc20, nativetokens, or uniswapv3)"),
    quoteCurrency: z
      .literal("USD")
      .describe("The currency to convert gas prices to (only USD supported)"),
  }),
  execute: async (parameters: unknown) => {
    try {
      const { chainId, eventType } = parameters as {
        chainId: Chain;
        eventType: "erc20" | "nativetokens" | "uniswapv3";
      };
      const chainName = chainId === "1" ? "eth-mainnet" : chainId;

      const gasPrices = await client.BaseService.getGasPrices(
        chainName as Chain,
        eventType,
        { quoteCurrency: "USD" }
      );

      if (gasPrices.error) {
        throw new Error(
          gasPrices.error_message || "Failed to fetch gas prices"
        );
      }

      return JSON.stringify({
        status: "success",
        data: serializeBigInt(gasPrices.data),
        eventType,
        quoteCurrency: "USD",
      });
    } catch (error) {
      return JSON.stringify({
        status: "error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        chainId: (parameters as { chainId: Chain }).chainId,
      });
    }
  },
});

// 🔹 **Gas Price Agent**
const gasPriceAgent = new Agent({
  name: "gas price agent",
  model: {
    provider: "OPEN_AI",
    name: "gpt-4o-mini",
    apiKey: process.env.OPEN_AI_API_KEY!,
  },
  description:
    "Provides real-time gas price estimates for blockchain transactions.",
  instructions: [
    "Use the gas price tool to fetch current gas price estimates.",
    "Ask user for the type of transaction (erc20, nativetokens, or uniswapv3) if not specified.",
    "Default to 'nativetokens' if transaction type is unclear.",
    "Return gas prices in different formats (low, medium, high) if available.",
  ],
  tools: { gasPriceTool },
});

// Security Tool: Retrieve token and NFT approvals -- it means the wallet has approved a contract to spend its tokens or NFTs on its behalf without user interaction for each transaction it gives those contracts
const securityTool = createTool({
  id: "security-tool",
  description: "Retrieve token and NFT approvals for a wallet.",
  schema: z.object({
    chainId: z.string(),
    walletAddress: z.string(),
  }),
  execute: async (parameters: unknown) => {
    try {
      const { chainId, walletAddress } = parameters as {
        chainId: Chain;
        walletAddress: string;
      };
      const approvals = await client.SecurityService.getApprovals(
        chainId,
        walletAddress
      );

      if (approvals.error) {
        throw new Error("Error fetching approvals data");
      }

      return JSON.stringify({
        status: "success",
        approvals: serializeBigInt(approvals.data),
      });
    } catch (error) {
      return JSON.stringify({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
});

// 🔹 **Security Agent**
const securityAgent = new Agent({
  name: "security agent",
  model: {
    provider: "OPEN_AI",
    name: "gpt-4o-mini",
    apiKey: process.env.OPEN_AI_API_KEY!,
  },
  description:
    "Monitors and analyzes token and NFT approvals for potential security risks.",
  instructions: [
    "Use the security tool to check a wallet's token and NFT approvals.",
    "Ensure the user provides a valid blockchain network (chainId) and wallet address.",
    "Flag any unusual or potentially risky approvals, such as unlimited spending allowances.",
  ],
  tools: { securityTool },
});

async function main() {
  const state = StateFn.root(securityAgent.description);
  state.messages.push(
    user(
      "tell me about 0x1c32A90A83511534F2582E631314569ff6C76875 address on eth-sepolia"
    )
  );
  try {
    const result = await securityAgent.run(state);
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
        { securityTool }, 
        lastMessage.tool_calls
      );
      console.log("security result:", toolResponse);
    } else {
      console.log("No tool calls found in the response");
    }
  } catch (error) {
    console.error(
      "security tool or tool query failed:",
      error instanceof Error ? error.message : error
    );
  }
}

main().catch(console.error);
