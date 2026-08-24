import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import ChatMessage from "./ChatMessage.jsx";
import TypingIndicator from "./TypingIndicator.jsx";

export default function ChatWindow({ messages, isSending }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-syn-accent to-syn-accent-2">
          <Sparkles className="h-7 w-7 text-syn-bg" />
        </div>
        <h2 className="text-lg font-medium text-syn-text">How can I help today?</h2>
        <p className="max-w-sm text-sm text-syn-muted">
          Type a message or tap the mic — English, Hindi, or Hinglish all work.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-5 overflow-y-auto px-1 py-4">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} role={msg.role} content={msg.content} isError={msg.isError} />
      ))}
      {isSending && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
