import { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import MessageInput from "../components/MessageInput.jsx";
import { useChat } from "../hooks/useChat.js";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function Home() {
  const { messages, isSending, sendMessage } = useChat();
  const speech = useSpeechRecognition();
  const [isBackendOnline, setIsBackendOnline] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/health`);
        if (!cancelled) setIsBackendOnline(res.ok);
      } catch {
        if (!cancelled) setIsBackendOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col gap-4 p-4">
      <Header isBackendOnline={isBackendOnline} />

      {isBackendOnline === false && (
        <div className="rounded-xl border border-syn-danger/30 bg-syn-danger/10 px-4 py-2.5 text-sm text-syn-danger">
          Can't reach the SYNTRA backend at {API_BASE_URL}. Make sure it's running
          (<code className="font-mono">uvicorn app.main:app --reload</code> from{" "}
          <code className="font-mono">backend/</code>).
        </div>
      )}

      <ChatWindow messages={messages} isSending={isSending} />
      <MessageInput onSend={sendMessage} disabled={isSending} speech={speech} />
    </div>
  );
}
