import type { Tool } from "@covalenthq/ai-agent-sdk";
import type { ChatCompletionToolMessageParam } from "openai/resources/chat/completions";
import type { ParsedFunctionToolCall } from "openai/resources/beta/chat/completions";

export default async function runToolCalls(
  tools: Record<string, Tool>,
  toolCalls: Array<ParsedFunctionToolCall | any>
): Promise<ChatCompletionToolMessageParam[]> {
  const results = await Promise.all(
    toolCalls.map(async (tc) => {
      // Normalize the tool call structure
      const normalizedToolCall = {
        id: tc.id || "manual-call",
        type: tc.type || "function",
        function: {
          name: tc.function?.name || tc.name,
          arguments:
            typeof tc.function?.arguments === "string"
              ? tc.function.arguments
              : JSON.stringify(tc.function?.arguments || tc.arguments),
        },
      };

      const tool = tools[normalizedToolCall.function.name];
      if (!tool) {
        throw new Error(`Tool ${normalizedToolCall.function.name} not found`);
      }

      try {
        const response = await tool.execute(
          JSON.parse(normalizedToolCall.function.arguments)
        );

        return {
          role: "tool",
          tool_call_id: normalizedToolCall.id,
          content: response,
        } satisfies ChatCompletionToolMessageParam;
      } catch (error) {
        console.error("Tool execution error:", error);
        throw error;
      }
    })
  );

  return results;
}
