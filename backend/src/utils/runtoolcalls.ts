import type { Tool } from "@covalenthq/ai-agent-sdk";
import type { ChatCompletionToolMessageParam } from "openai/resources/chat/completions";
import type { ParsedFunctionToolCall } from "openai/resources/beta/chat/completions";
export default async function runToolCalls(
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
