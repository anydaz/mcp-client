import { Message, Tool } from "@/modules/chat/interfaces/ChatInterface";
import { NextRequest } from "next/server";

const callAnthropicAPIStream = async (
  apiKey: string,
  messages: Message[],
  tools: Tool[]
) => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
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
      stream: true,
    }),
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

  // Stream Anthropic response directly to client
  const anthropicRes = await callAnthropicAPIStream(apiKey, messages, tools);
  if (!anthropicRes.body) {
    return new Response("No stream body", { status: 500 });
  }
  return new Response(anthropicRes.body, {
    status: anthropicRes.status,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
