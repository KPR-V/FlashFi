import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import {
  blockchainAgent,
  transactionTool,
  portfolioTool,
  gasPriceTool,
  securityTool,
  swapTool,
} from "./blockchain-agent";
import { StateFn } from "@covalenthq/ai-agent-sdk/dist/core/state";
import { user, assistant } from "@covalenthq/ai-agent-sdk/dist/core/base";
import runToolCalls from "./utils/runtoolcalls";

const app = express();
app.use(cors());
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Store chat states for each connection
const chatStates = new Map();

wss.on("connection", (ws) => {
  console.log("Client connected");
  const clientId = Math.random().toString(36).substring(7);
  let processingMessage = false;

  ws.on("message", async (message) => {
    if (processingMessage) {
      ws.send(
        JSON.stringify({
          type: "error",
          content: "Please wait for the previous command to complete",
        })
      );
      return;
    }

    processingMessage = true;
    try {
      const userMessage = message.toString();
      console.log(`Processing message: ${userMessage}`);

      // Create new state for each message
      let state = StateFn.root(blockchainAgent.description);
      state.messages.push(user(userMessage));

      // Run the agent
      const result = await blockchainAgent.run(state);
      console.log("Agent run completed");

      // Process assistant message
      const lastMessage = result.messages[result.messages.length - 1] as any;

      // Handle each tool call sequentially and stop on error
      if (lastMessage?.tool_calls?.length > 0) {
        for (const toolCall of lastMessage.tool_calls) {
          try {
            const toolResponse = await runToolCalls(
              {
                transactionTool,
                portfolioTool,
                gasPriceTool,
                securityTool,
                swapTool,
              },
              [toolCall]
            );

            if (toolResponse[0]?.content) {
              const content = Array.isArray(toolResponse[0].content)
                ? toolResponse[0].content[0].text
                : toolResponse[0].content;
              const responseContent = JSON.parse(content);

              // If there's an error, stop processing further tool calls
              if (responseContent.status === "error") {
                ws.send(
                  JSON.stringify({
                    type: "error",
                    content: responseContent.message,
                  })
                );
                break;
              }

              ws.send(
                JSON.stringify({
                  type: "tool-response",
                  content: responseContent.data || responseContent,
                })
              );

              // Add successful response to state
              state.messages.push(toolResponse[0]);
            }
          } catch (toolError) {
            console.error(`Tool execution error:`, toolError);
            ws.send(
              JSON.stringify({
                type: "error",
                content:
                  toolError instanceof Error
                    ? toolError.message
                    : "Unknown error",
              })
            );
            break; // Stop processing more tool calls on error
          }
        }
      } else if (lastMessage?.content) {
        ws.send(
          JSON.stringify({
            type: "assistant",
            content: lastMessage.content,
          })
        );
      }

      // Update state
      chatStates.set(clientId, state);
    } catch (error) {
      console.error("Error processing message:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          content: error instanceof Error ? error.message : "Unknown error",
        })
      );
    } finally {
      processingMessage = false;
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
});
