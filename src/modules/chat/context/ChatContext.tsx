import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Message } from "../interfaces/ChatInterface";
import { getTools } from "../client/ChatClient";
import { apiFetch } from "@/lib/apiClient";

interface Tool {
  name: string;
  description: string;
  inputSchema: object;
}

interface ChatContextType {
  tools: Tool[];
  toolsLoading?: boolean;
  sendChat: (chatInput: string) => void;
  messages: Message[];
  chatError: string | null;
  chatLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [chatError, setChatError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const { data: tools, isLoading: toolsLoading } = useQuery({
    queryKey: ["tools"],
    queryFn: getTools,
    refetchOnWindowFocus: false,
  });

  const postChat = async (newMessages: Message[]) => {
    const res = await apiFetch<{ text: string; tool_calls?: any[] }>({
      endpoint: "/api/chat",
      options: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          tools: tools || undefined,
        }),
      },
    });
    return res;
  };

  const chatMutation = useMutation({
    mutationFn: postChat,
    onMutate: () => {
      setChatLoading(true);
      setChatError(null);
    },
    onError: (error: any) => {
      setChatError(error?.message || "Unknown error");
      setChatLoading(false);
    },
    onSuccess: (data) => {
      const msgsToAdd: Message[] = [];
      if (Array.isArray(data.tool_calls)) {
        for (const tool of data.tool_calls) {
          msgsToAdd.push({
            role: "assistant",
            content: `[Calling tool ${tool.name} with args ${JSON.stringify(
              tool.input
            )}]`,
          });
        }
      }
      let assistantMsg = data?.text;
      msgsToAdd.push({ role: "assistant", content: assistantMsg });
      setMessages((msgs) => [...msgs, ...msgsToAdd]);
      setChatLoading(false);
    },
  });

  const sendChat = (chatInput: string) => {
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: chatInput },
    ];
    setMessages(newMessages);
    chatMutation.mutate(newMessages);
  };

  return (
    <ChatContext.Provider
      value={{
        tools: tools || [],
        toolsLoading,
        sendChat,
        messages,
        chatError,
        chatLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
