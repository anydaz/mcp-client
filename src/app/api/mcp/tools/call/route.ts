import { apiFetch } from "@/lib/apiClient";
import { Message, Tool } from "@/modules/chat/interfaces/ChatInterface";
import { NextRequest } from "next/server";
import { env } from "process";

export async function POST(req: NextRequest) {
  const { toolName, input } = await req.json();

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

  return new Response(JSON.stringify(res), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
