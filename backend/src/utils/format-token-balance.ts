import { ethers } from "ethers";
export default function formatTokenBalance(
  balance: bigint | null | string,
  decimals: number | null
): string {
  if (balance === null) return "0";
  if (decimals === null) decimals = 18; // default to 18 decimals if not specified
  const balanceBigInt = typeof balance === "string" ? BigInt(balance) : balance;
  return ethers.formatUnits(balanceBigInt, decimals);
}
