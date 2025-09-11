import { useQuery } from "@tanstack/react-query";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Message } from "../interfaces/ChatInterface";
import { getTools } from "../client/ChatClient";
import { streamChat } from "../utils/ChatUtils";

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

  // Streaming chat implementation
  const sendChat = async (chatInput: string) => {
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: chatInput },
    ];
    setMessages(newMessages);
    setChatLoading(true);
    setChatError(null);

    try {
      await streamChat(newMessages, setMessages, tools);
      setChatLoading(false);
    } catch (error: any) {
      setChatError(error?.message || "Unknown error");
      setChatLoading(false);
    }
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
