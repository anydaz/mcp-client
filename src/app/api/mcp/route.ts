// Simple MCP client API route for proxying requests to an MCP server
import { apiFetch } from "@/lib/apiClient";
import type { NextRequest } from "next/server";
import { env } from "process";

export async function POST(req: NextRequest) {
  try {
    const { endpoint, payload } = await req.json();
    const res = await apiFetch({
      baseUrl: env.MCP_SERVER_URL,
      endpoint,
      options: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
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
