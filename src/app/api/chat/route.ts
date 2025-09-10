import { apiFetch } from "@/lib/apiClient";
import { Message, Tool } from "@/modules/chat/interfaces/ChatInterface";
import { NextRequest } from "next/server";
import { env } from "process";

const callAnthropicAPI = async (
  apiKey: string,
  messages: Message[],
  tools: Tool[]
) => {
  const data = await apiFetch<{
    content: Array<{ name: string; type: string; text?: string; input?: any }>;
  }>({
    baseUrl: "https://api.anthropic.com",
    endpoint: "/v1/messages",
    options: {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages,
        tools: tools || undefined,
      }),
    },
  });

  return data;
};

const callMCPTool = async (toolName: string, input: any) => {
  const origin = env.MCP_SERVER_URL;
  const body = JSON.stringify({ ...input });

  const res = await apiFetch<{
    content: unknown;
  }>({
    baseUrl: origin,
    endpoint: `/mcp/${toolName}`,
    options: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    },
  });

  return res;
};

export async function POST(req: NextRequest) {
  const { messages, tools } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing ANTHROPIC_API_KEY" }),
      { status: 500 }
    );
  }

  const data = await callAnthropicAPI(apiKey, messages, tools);

  // Process content array for text and tool_use events
  let finalText: string[] = [];
  let toolCalls: { name: string; input: any }[] = [];

  if (Array.isArray(data.content)) {
    for (const content of data.content) {
      if (content.type === "text") {
        finalText.push(content.text || "");
      } else if (content.type === "tool_use" && content.name) {
        const toolName = content.name;

        const res = await callMCPTool(toolName, content.input);
        toolCalls.push({ name: content.name, input: content.input });
        messages.push({ role: "user", content: res.content });

        // Call Anthropic again with tool result
        const dt = await callAnthropicAPI(apiKey, messages, []);
        finalText.push(
          dt.content[0].type === "text" ? dt.content[0].text || "" : ""
        );
      }
    }
  }

  // Compose response for client
  const result = {
    ...data,
    text: finalText.join("\n"),
    tool_calls: toolCalls,
  };

  return new Response(JSON.stringify(result), { status: 200 });
}
