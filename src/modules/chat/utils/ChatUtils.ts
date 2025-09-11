import { apiFetch } from "@/lib/apiClient";
import { Message, Tool } from "../interfaces/ChatInterface";

// Helper to stream a chat response and update state
export const streamChat = async (
  messagesToSend: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  tools?: Tool[]
) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messagesToSend.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      tools: tools || undefined,
    }),
  });
  if (!response.body) throw new Error("No response body");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  setMessages((msgs: Message[]) => [
    ...msgs,
    { role: "assistant", content: "" },
  ]);

  let accumulatedResponse = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter((line) => line.trim() !== "");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.replace("data: ", "").trim();
        try {
          const parsed = JSON.parse(data);
          // Tool call detection (Anthropic Claude tool use block)
          if (
            parsed.content_block &&
            parsed.content_block.type === "tool_use"
          ) {
            const toolInput = parsed.content_block.input;
            const toolName = parsed.content_block.name;
            // Call MCP tool
            const toolResponse = await callMCPTool(toolName, toolInput);
            // Add tool response as a message and continue streaming
            const toolMessage: Message = {
              role: "user",
              content: JSON.stringify(toolResponse),
            };
            // Add the partial assistant message so far, then tool message
            setMessages((msgs) => {
              const updatedMsgs = [...msgs];
              updatedMsgs[updatedMsgs.length - 1] = {
                role: "assistant",
                content: accumulatedResponse,
              };
              return updatedMsgs;
            });
            // Recursively stream the next Anthropic response
            await streamChat(
              [
                ...messagesToSend,
                { role: "assistant", content: accumulatedResponse },
                toolMessage,
              ],
              setMessages
            );
            return; // Stop current stream after tool call
          }
          if (parsed.type === "content_block_delta") {
            const text = parsed.delta.text || "";
            accumulatedResponse += text;
          }
        } catch (e) {
          // Not JSON, treat as text
          accumulatedResponse += data;
        }
      }
    }
    setMessages((msgs) => {
      const updatedMsgs = [...msgs];
      updatedMsgs[updatedMsgs.length - 1] = {
        role: "assistant",
        content: accumulatedResponse,
      };
      return updatedMsgs;
    });
  }
};

const callMCPTool = async (toolName: string, input: object) => {
  return apiFetch({
    endpoint: "/api/mcp/tools/call",
    options: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolName, input }),
    },
  });
};
