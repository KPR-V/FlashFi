import express, { Request, Response } from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { PrivyClient } from "@privy-io/server-auth";

import {
  blockchainAgent,
  transactionTool,
  portfolioTool,
  gasPriceTool,
  securityTool,
  swapTool,
  stakeTool,
  bridgeTool,
  combinedChatTool,
} from "./agents/blockchain-agent";
import { StateFn } from "@covalenthq/ai-agent-sdk/dist/core/state";
import { user, assistant } from "@covalenthq/ai-agent-sdk/dist/core/base";
import runToolCalls from "./utils/runtoolcalls";
import type { Tool } from "@covalenthq/ai-agent-sdk";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    methods: ["GET", "POST"],
  })
);

const privy = new PrivyClient(
  process.env.PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

const handleError = (res: Response, error: unknown, message: string): void => {
  console.error(message, error);
  res.status(500).json({
    error: message,
    details: error instanceof Error ? error.message : "Unknown error",
  });
};

app.get("/health", (_req: Request, res: Response): void => {
  res.status(200).json({ status: "ok" });
});

app.post(
  "/create-wallet",
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const wallet = await privy.walletApi.create({ chainType: "ethereum" });
      res.json(wallet);
    } catch (error) {
      return handleError(res, error, "Wallet creation failed");
    }
  }
);

app.get("/get-wallets", async (_req: Request, res: Response): Promise<void> => {
  try {
    const wallets: any[] = [];
    let nextCursor: string | undefined;
    do {
      const { data, nextCursor: newCursor } = await privy.walletApi.getWallets({
        chainType: "ethereum",
        cursor: nextCursor,
      });
      wallets.push(...data);
      nextCursor = newCursor;
    } while (nextCursor);
    res.json(wallets);
  } catch (error) {
    return handleError(res, error, "Failed to fetch wallets");
  }
});

app.post(
  "/sign-message",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { walletId, message } = req.body;
      if (!walletId || !message) {
        res.status(400).json({ error: "Missing walletId or message" });
        return;
      }
      const response = await privy.walletApi.ethereum.signMessage({
        walletId,
        message,
      });
      res.json(response);
    } catch (error) {
      return handleError(res, error, "Failed to sign message");
    }
  }
);

app.post(
  "/send-transaction",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { walletId, to, value, chainId } = req.body;
      if (!walletId || !to || !value || !chainId) {
        res.status(400).json({ error: "Missing transaction parameters" });
        return;
      }
      const valueInHex =
        "0x" + BigInt(Math.floor(parseFloat(value) * 1e18)).toString(16);
      const response = await privy.walletApi.ethereum.sendTransaction({
        walletId,
        caip2: `eip155:${chainId}`,
        transaction: { to, value: valueInHex, chainId: parseInt(chainId) },
      });
      res.json(response);
    } catch (error) {
      return handleError(res, error, "Transaction failed");
    }
  }
);

app.get(
  "/wallet-balance/:address",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.params;
      const { network = "sepolia" } = req.query;
      if (!address) {
        res.status(400).json({ error: "Wallet address required" });
        return;
      }
      const baseUrl =
        network === "mainnet"
          ? "https://api.etherscan.io/api"
          : "https://api-sepolia.etherscan.io/api";
      const { data } = await axios.get(baseUrl, {
        params: {
          module: "account",
          action: "balance",
          address,
          tag: "latest",
          apikey: process.env.ETHERSCAN_API_KEY,
        },
      });
      if (data.status !== "1")
        throw new Error(data.message || "Failed to fetch balance");
      res.json({ balance: parseInt(data.result) / 1e18 });
    } catch (error) {
      return handleError(res, error, "Failed to fetch wallet balance");
    }
  }
);

const server = createServer(app);
const wss = new WebSocketServer({ server });

const chatStates = new Map<string, any>();

wss.on("connection", (ws) => {
  console.log("Client connected");
  const clientId = uuidv4();
  let processingMessage = false;

  const processRequest = async (userMessage: string): Promise<void> => {
    console.log("\n=== Processing Request ===");
    console.log("Message:", userMessage);

    let state = StateFn.root(blockchainAgent.description);
    state.messages.push(user(userMessage));

    const result = await blockchainAgent.run(state);
    const lastMessage = result.messages[result.messages.length - 1];
    console.log("\n=== Agent Response ===");
    console.log(JSON.stringify(lastMessage, null, 2));

    // If the last message is a direct assistant response (no tool calls)
    if (lastMessage.role === "assistant" && lastMessage.content) {
      ws.send(
        JSON.stringify({
          type: "assistant",
          content: lastMessage.content,
        })
      );
      return;
    }

    let toolCalls = (lastMessage as any)?.tool_calls || [];
    const messageType = userMessage.toLowerCase();
    if (messageType.includes("stake") && toolCalls.length === 0) {
      console.log("Forcing stakeTool call, no tool calls found in response.");
      const matchedAmount = userMessage.match(/\d+/)?.[0] || "0";
      toolCalls = [
        {
          type: "function",
          id: `forced-stake-${Date.now()}`,
          function: {
            name: "stakeTool",
            arguments: JSON.stringify({ amount: matchedAmount }),
          },
        },
      ];
    }

    if (toolCalls.length === 0) {
      console.log("No tool calls available to process");
      ws.send(
        JSON.stringify({
          type: "error",
          content:
            "Unable to process request. Please try again with a clearer instruction.",
        })
      );
      return;
    }

    const tools: Record<string, Tool> = messageType.includes("stake")
      ? { stakeTool }
      : {
          ...(messageType.includes("gas") || messageType.includes("fee")
            ? { gasPriceTool }
            : messageType.includes("balance") ||
              messageType.includes("portfolio")
            ? { portfolioTool }
            : messageType.includes("swap") || messageType.includes("exchange")
            ? { swapTool }
            : messageType.includes("security") ||
              messageType.includes("approval")
            ? { securityTool }
            : messageType.includes("bridge") || messageType.includes("transfer")
            ? { bridgeTool }
            : messageType.includes("send")
            ? { transactionTool }
            : { combinedChatTool }),
        };

    console.log("Available tools:", Object.keys(tools));
    console.log("Processing tool calls:", JSON.stringify(toolCalls, null, 2));

    for (const toolCall of toolCalls) {
      try {
        const toolResponse = await runToolCalls(tools, [toolCall]);
        if (toolResponse?.[0]?.content) {
          ws.send(
            JSON.stringify({
              type: "tool-response",
              content: toolResponse[0].content,
            })
          );
          state.messages.push(toolResponse[0]);
        }
      } catch (error) {
        console.error("Tool execution error:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            content: `Tool execution failed: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          })
        );
        break;
      }
    }
    chatStates.set(clientId, state);
  };

  ws.on("message", async (message: string) => {
    if (processingMessage) {
      ws.send(
        JSON.stringify({
          type: "error",
          content:
            "Previous request is still processing. Please wait a moment and try again.",
        })
      );
      return;
    }
    processingMessage = true;
    try {
      await processRequest(message.toString());
    } catch (error) {
      console.error("\n=== Error ===", error);
      ws.send(
        JSON.stringify({
          type: "error",
          content: error instanceof Error ? error.message : "Unknown error",
        })
      );
    } finally {
      processingMessage = false;
      console.log("=== Request Complete ===\n");
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    chatStates.delete(clientId);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`REST API available at http://localhost:${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}`);
});
