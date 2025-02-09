import { createTool } from "@covalenthq/ai-agent-sdk";
import { z } from "zod";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const combinedChatTool = createTool({
    id: "combined-chat-tool",
    description:
        "Handles general conversation, greetings, and technical questions. Engage in natural conversation, respond in a friendly and concise manner, and provide detailed technical explanations when needed.",
    schema: z.object({
        message: z.string().describe("User's input message"),
    }),
    execute: async (parameters: unknown): Promise<string> => {
        const { message } = parameters as { message: string };

        // Check if user is asking about capabilities
        if (message.toLowerCase().includes("what") && 
            (message.toLowerCase().includes("can you do") || 
             message.toLowerCase().includes("things") || 
             message.toLowerCase().includes("capabilities"))) {
            return `I can help you with the following blockchain operations:

1. 🔄 Swap tokens across different DEXs
2. 🌉 Bridge assets between different blockchains
3. 💰 Check multi-chain token balances
4. ⛽ Fetch gas prices across multiple chains
5. 💸 Make transactions to any account
6. 🔍 Check contract approvals and permissions
7. 🥩 Staking operations for various protocols

Please let me know which operation you'd like to explore further!`;
        }

        try {
            const response = await axios.post(
                "https://api.openai.com/v1/completions",
                {
                    model: "gpt-4o-mini",
                    prompt: message,
                    max_tokens: 150,
                    temperature: 0.7,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}`,
                    },
                }
            );

            const generatedText = response.data.choices?.[0]?.text ?? "No response generated";
            return generatedText;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return `Error generating response: ${error.response?.data || error.message}`;
            }
            return `Error generating response: ${(error as Error).message}`;
        }
    },
});

export { combinedChatTool };
