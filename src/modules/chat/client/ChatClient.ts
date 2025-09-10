import { apiFetch } from "@/lib/apiClient";
import { Tool } from "../interfaces/ChatInterface";

export const getTools = async () => {
  const res = await apiFetch<{ tools: Tool[] }>({
    endpoint: "api/mcp/tools",
  });
  return res.tools;
};
