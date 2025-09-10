"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useChatContext } from "../context/ChatContext";

const ChatBox = () => {
  const { messages, chatError } = useChatContext();

  return (
    <main className="flex-1 flex flex-col items-center justify-end w-full">
      <Card className="w-full max-w-2xl flex-1 flex flex-col border-none shadow-none bg-transparent">
        <CardContent className="flex-1 flex flex-col gap-4 px-0 pb-2 pt-4 overflow-hidden">
          <div
            className="flex-1 flex flex-col gap-2 overflow-y-auto px-2"
            style={{ minHeight: 0 }}
          >
            {messages.length === 0 && (
              <div className="text-muted-foreground">No messages yet.</div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.role === "user" ? "text-right" : "text-left"}
              >
                <span
                  className={
                    msg.role === "user"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-secondary-foreground"
                  }
                  style={{
                    borderRadius: 8,
                    padding: 6,
                    display: "inline-block",
                    maxWidth: "80%",
                  }}
                >
                  <b>{msg.role === "user" ? "You" : "Bot"}:</b> {msg.content}
                </span>
              </div>
            ))}
          </div>
          {chatError && (
            <div className="text-destructive px-2">Error: {chatError}</div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default ChatBox;
