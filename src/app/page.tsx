
"use client";

import ChatBox from "@/modules/chat/components/ChatBox";
import TextAreaInput from "@/modules/chat/components/TextAreaInput";
import { ChatProvider } from "@/modules/chat/context/ChatContext";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full border-b bg-card px-6 py-4 flex items-center justify-center">
        <h1 className="text-2xl font-bold">Simple MCP Client & Chatbot</h1>
      </header>

      <ChatProvider>
        <ChatBox />
        <TextAreaInput />
      </ChatProvider>
    </div>
  );
}

export default Home;
