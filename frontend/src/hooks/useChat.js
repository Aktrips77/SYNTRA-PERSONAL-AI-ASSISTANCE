import { useCallback, useState } from "react";
import { sendChatMessage, ApiError } from "../services/api.js";

// How many prior turns to send as context. Keeps payloads small while
// still giving the model useful short-term memory of the conversation.
const MAX_CONTEXT_TURNS = 12;

let nextId = 1;
const makeId = () => nextId++;

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      setError(null);
      const userMessage = { id: makeId(), role: "user", content: trimmed };
      setMessages((prev) => [...prev, userMessage]);
      setIsSending(true);

      try {
        const history = [...messages, userMessage]
          .slice(-MAX_CONTEXT_TURNS - 1, -1)
          .map(({ role, content }) => ({ role, content }));

        const reply = await sendChatMessage(trimmed, history);
        setMessages((prev) => [...prev, { id: makeId(), role: "assistant", content: reply }]);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
        setError(message);
        setMessages((prev) => [
          ...prev,
          { id: makeId(), role: "assistant", content: message, isError: true },
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [messages, isSending]
  );

  return { messages, isSending, error, sendMessage };
}
