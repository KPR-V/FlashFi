import { createTool, Agent } from "@covalenthq/ai-agent-sdk";
import { z } from "zod";
import "dotenv/config";
import formatTokenBalance from "./utils/format-token-balance";
import { Chain, GoldRushClient } from "@covalenthq/client-sdk";
const client = new GoldRushClient(process.env.GOLDRUSH_API_KEY!);

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

export { portfolioAgent, portfolioTool };
