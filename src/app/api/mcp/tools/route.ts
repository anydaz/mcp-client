import { apiFetch } from "@/lib/apiClient";
import type { NextRequest } from "next/server";
import { env } from "process";

export async function GET(req: NextRequest) {
  try {
    const res = await apiFetch({
      baseUrl: env.MCP_SERVER_URL,
      endpoint: "/mcp/tools",
    });

    return new Response(JSON.stringify(res), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
