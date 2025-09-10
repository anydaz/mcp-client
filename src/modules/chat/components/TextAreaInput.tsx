"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatContext } from "../context/ChatContext";

const TextAreaInput = () => {
  const { toolsLoading, sendChat, chatLoading } = useChatContext();
  const [chatInput, setChatInput] = useState("");

  const handleSubmit = (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    sendChat(chatInput);
    setChatInput("");
  };

  return (
    <form
      className="w-full mx-auto px-2 py-4 flex gap-2 bg-background border-t"
      onSubmit={handleSubmit}
      style={{ position: "sticky", bottom: 0, zIndex: 10 }}
    >
      <Textarea
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        placeholder="Type your message..."
        disabled={chatLoading}
        className="resize-none min-h-12 max-h-32 flex-1"
        rows={2}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            handleSubmit(e);
          }
        }}
      />
      <Button
        type="submit"
        disabled={chatLoading || !chatInput.trim()}
        className="shrink-0 h-12"
      >
        {chatLoading || toolsLoading ? "..." : "Send"}
      </Button>
    </form>
  );
};

export default TextAreaInput;
