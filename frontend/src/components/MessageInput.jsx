import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import VoiceButton from "./VoiceButton.jsx";
import { SUPPORTED_LANGUAGES } from "../hooks/useSpeechRecognition.js";

export default function MessageInput({ onSend, disabled, speech }) {
  const [text, setText] = useState("");
  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    language,
    setLanguage,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = speech;

  // While listening, mirror the finalized transcript live into the text
  // field. Once listening stops, hand full control back to normal typing
  // (the user can freely edit what was transcribed before sending).
  const [textBeforeListening, setTextBeforeListening] = useState("");

  useEffect(() => {
    if (isListening) {
      const base = textBeforeListening ? `${textBeforeListening} ` : "";
      setText(`${base}${transcript}`.trim());
    }
  }, [transcript, isListening]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isListening) resetTranscript();
  }, [isListening]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      setTextBeforeListening(text);
      startListening();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || disabled) return;
    onSend(value);
    setText("");
  };

  return (
    <div className="glass rounded-2xl p-3">
      {speechError && <p className="mb-2 px-1 text-xs text-syn-danger">{speechError}</p>}

      {isListening && (
        <p className="mb-2 px-1 text-xs text-syn-accent">
          Listening{interimTranscript ? `: "${interimTranscript}"` : "…"}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <VoiceButton
          isSupported={isSupported}
          isListening={isListening}
          onClick={handleMicClick}
          disabled={disabled}
        />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          rows={1}
          placeholder="Type your message… (English, Hindi, or Hinglish)"
          disabled={disabled}
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-syn-border bg-syn-surface-2/60 px-4 py-2.5 text-sm text-syn-text placeholder:text-syn-muted focus:border-syn-accent focus:outline-none"
        />

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isListening}
          title="Voice recognition language"
          className="hidden h-11 shrink-0 rounded-xl border border-syn-border bg-syn-surface-2/60 px-2 text-xs text-syn-muted focus:outline-none sm:block"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={disabled || !text.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-syn-accent to-syn-accent-2 text-syn-bg transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
