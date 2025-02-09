import { ethers } from "ethers";
interface TransactionResponse {
  status: string;
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  amount: string;
  gasCost: string;
}

interface GasPriceResponse {
  updated_at: string;
  chain_name: string;
  gas_quote_rate: number | null;
  quote_currency: string;
  base_fee: string | null;
  items: Array<{
    interval: string;
    gas_price: string;
    gas_spent: string;
    gas_quote: number | null;
    pretty_total_gas_quote: string | null;
  }>;
}

interface BridgeResponse {
  status: string;
  message: string;
  sourceHash: string;
  destinationHash: string;
}

// interface BalanceResponse {
//   address: string;
//   chain_name: string;
//   balances: Array<{
//     token_name: string;
//     symbol: string;
//     balance: string;
//     balance_24h: string;
//     decimals: number;
//     contract_address: string;
//     native_token: boolean;
//     is_spam: boolean;
//     logo_url: string;
//   }>;
// }

const parseInsufficientFundsError = (errorString: string) => {
  // Parse the transaction cost and balance from the error message
  const txCostMatch = errorString.match(/tx cost (\d+)/);
  const balanceMatch = errorString.match(/balance (\d+)/);
  const txCost = txCostMatch ? txCostMatch[1] : null;
  const balance = balanceMatch ? balanceMatch[1] : "0";

  return {
    txCost,
    balance,
    formatted: `❌ Swap Failed: Insufficient Funds

Required Funds Breakdown:
💰 Total Required: ${txCost ? ethers.formatEther(txCost) : "Unknown amount"}
💳 Current Balance: ${ethers.formatEther(balance)}
🔍 Missing: ${
      txCost
        ? ethers.formatEther(BigInt(txCost) - BigInt(balance))
        : "Unknown amount"
    }

This amount includes:
• Gas fees for approval transactions
• Cross-chain bridge fees
• Execution gas fees

Please ensure your wallet has enough to cover all costs.`,
  };
};

const formatGasPriceResponse = (data: GasPriceResponse): string => {
  return `Gas Price Analysis on ${data.chain_name}:

📊 Current Status:
• Last Updated: ${new Date(data.updated_at).toLocaleString()}
• Native Token Price: ${
    data.gas_quote_rate ? `$${data.gas_quote_rate.toFixed(2)}` : "N/A"
  }
${
  data.base_fee
    ? `• Base Fee: ${(parseInt(data.base_fee) / 1e9).toFixed(2)} Gwei`
    : ""
}

⛽ Recent Gas Trends:
${data.items
  .map(
    (item) => `
${item.interval}
• Price: ${(parseInt(item.gas_price) / 1e9).toFixed(2)} Gwei
• Average Gas Used: ${item.gas_spent}
• Estimated Cost: ${item.pretty_total_gas_quote || "N/A"}`
  )
  .join("\n")}

💡 Recommendation:
• Current optimal gas price: ${(
    parseInt(data.items[0].gas_price) / 1e9
  ).toFixed(2)} Gwei
• Estimated transaction cost: ${data.items[0].pretty_total_gas_quote || "N/A"}`;
};

export const formatResponse = (content: any): string => {
  try {
    // Check for error response first
    if (content?.status === "error") {
      return `❌ Error: ${content.message}`;
    }

    const data = typeof content === "string" ? JSON.parse(content) : content;

    // Handle bridge operation response
    if (data.sourceHash && data.destinationHash) {
      const bridge = data as BridgeResponse;
      return `🌉 Bridge Operation Status:
✅ ${bridge.message}

Source Transaction:
📝 Hash: ${bridge.sourceHash}

Destination Transaction:
📝 Hash: ${bridge.destinationHash}`;
    }

    // Handle insufficient funds error object
    if (
      data.code === "INSUFFICIENT_FUNDS" ||
      (data.error?.message && data.error.message.includes("insufficient funds"))
    ) {
      return parseInsufficientFundsError(
        data.info?.error?.message ||
          data.error?.message ||
          data.message ||
          "Insufficient funds"
      ).formatted;
    }

    // Transaction response formatting
    if (data.hash && data.from && data.to) {
      const tx = data as TransactionResponse;
      return `Transaction Details:
🟢 Status: ${tx.status}
📝 Hash: ${tx.hash}
🔢 Block: ${tx.blockNumber}
👤 From: ${tx.from}
👥 To: ${tx.to}
💰 Amount: ${tx.amount} ETH
⛽ Gas Cost: ${tx.gasCost} ETH`;
    }

    // Gas price formatting
    if (data.data?.items && data.data?.chain_name) {
      return formatGasPriceResponse(data.data);
    }

    // Handle balance response (including Sepolia)
    if (
      data?.status === "success" &&
      data?.data?.chain_name &&
      Array.isArray(data?.data?.balances)
    ) {
      const balanceData = data.data;
      interface TokenBalanceFormatted {
        native_token: boolean;
        token_name: string;
        symbol: string;
        balance: string;
        balance_24h: string;
        is_spam: boolean;
      }

      return `Wallet Balance on ${balanceData.chain_name}:
      👛 Address: ${balanceData.address}

      ${balanceData.balances
        .map((token: TokenBalanceFormatted) => {
          const balance: number = parseFloat(token.balance);
          const balance24h: number = parseFloat(token.balance_24h);
          const change: number = balance - balance24h;
          const changeSymbol: string =
            change > 0 ? "📈" : change < 0 ? "📉" : "➡️";
          const changePercent: string = ((change / balance24h) * 100).toFixed(
            2
          );

          return `${token.native_token ? "🏦" : "💰"} ${token.token_name} (${
            token.symbol
          })
         Balance: ${balance.toFixed(6)} ${token.symbol}
         24h Change: ${changeSymbol} ${change.toFixed(6)} ${
            token.symbol
          } (${changePercent}%)
         ${token.is_spam ? "⚠️ Warning: Potential spam token" : ""}`;
        })
        .join("\n\n")}`;
    }

    // Default JSON formatting
    return JSON.stringify(data, null, 2);
  } catch (error) {
    // If parsing fails, try to format the raw string if it's an error message
    if (typeof content === "string" && content.includes("insufficient funds")) {
      return parseInsufficientFundsError(content).formatted;
    }
    return String(content);
  }
};
