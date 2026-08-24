import { AlertTriangle, Sparkles, User } from "lucide-react";

export default function ChatMessage({ role, content, isError }) {
  const isUser = role === "user";

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-syn-surface-2" : "bg-gradient-to-br from-syn-accent to-syn-accent-2"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-syn-text" />
        ) : isError ? (
          <AlertTriangle className="h-4 w-4 text-syn-bg" />
        ) : (
          <Sparkles className="h-4 w-4 text-syn-bg" />
        )}
      </div>

      <div
        className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-tr-sm bg-syn-surface-2 text-syn-text"
            : isError
              ? "rounded-tl-sm border border-syn-danger/30 bg-syn-danger/10 text-syn-text"
              : "rounded-tl-sm glass text-syn-text"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
