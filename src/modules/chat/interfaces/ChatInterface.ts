export type Message = { role: "user" | "assistant"; content: string };
export interface Tool {
  name: string;
  description: string;
  inputSchema: object;
}
