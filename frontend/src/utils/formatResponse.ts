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

interface BalanceResponse {
  address: string;
  chain_name: string;
  balances: Array<{
    token_name: string;
    symbol: string;
    balance: string;
    balance_24h: string;
    decimals: number;
    contract_address: string;
    native_token: boolean;
    is_spam: boolean;
    logo_url: string;
  }>;
}



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
💰 Total Required: ${
      txCost ? ethers.formatEther(txCost) + " ETH" : "Unknown amount"
    }
💳 Current Balance: ${ethers.formatEther(balance)} ETH
🔍 Missing: ${
      txCost
        ? ethers.formatEther(BigInt(txCost) - BigInt(balance)) + " ETH"
        : "Unknown amount"
    }

This amount includes:
• Gas fees for approval transactions
• Cross-chain bridge fees
• Execution gas fees

Please ensure your wallet has enough ETH to cover all costs.`,
  };
};

export const formatResponse = (content: any): string => {
  try {
    // First check if it's an insufficient funds error string
    if (typeof content === "string" && content.includes("insufficient funds")) {
      return parseInsufficientFundsError(content).formatted;
    }

    const data = typeof content === "string" ? JSON.parse(content) : content;

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
    if (data.items && data.chain_name) {
      const gas = data as GasPriceResponse;
      return `Gas Prices on ${gas.chain_name}:
⏰ Updated: ${new Date(gas.updated_at).toLocaleString()}
${
  gas.gas_quote_rate
    ? `💵 Native Token Price: $${gas.gas_quote_rate.toFixed(2)}`
    : ""
}
${
  gas.base_fee
    ? `⛽ Base Fee: ${(parseInt(gas.base_fee) / 1e9).toFixed(2)} Gwei`
    : ""
}

Recent Gas Usage:
${gas.items
  .map(
    (item) => `
${item.interval}:
  Price: ${(parseInt(item.gas_price) / 1e9).toFixed(2)} Gwei
  Avg Gas Used: ${item.gas_spent}
  ${
    item.pretty_total_gas_quote
      ? `Est. Cost: ${item.pretty_total_gas_quote}`
      : ""
  }`
  )
  .join("\n")}`;
    }

    // Balance response formatting
    if (data.chain_name && Array.isArray(data.balances)) {
      const balance = data as BalanceResponse;
      return `Wallet Balance on ${balance.chain_name}:
👛 Address: ${balance.address}

${balance.balances
  .map((token) => {
    const change = parseFloat(token.balance) - parseFloat(token.balance_24h);
    const changeSymbol = change > 0 ? "📈" : change < 0 ? "📉" : "➡️";
    const changePercent = (
      (change / parseFloat(token.balance_24h)) *
      100
    ).toFixed(2);

    return `${token.native_token ? "🏦" : "💰"} ${token.token_name} (${
      token.symbol
    })
   Balance: ${parseFloat(token.balance).toFixed(6)} ${token.symbol}
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
