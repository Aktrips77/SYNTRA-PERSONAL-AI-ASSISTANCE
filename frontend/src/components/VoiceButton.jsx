import { Mic, MicOff } from "lucide-react";

export default function VoiceButton({ isSupported, isListening, onClick, disabled }) {
  const title = !isSupported
    ? "Voice input not supported in this browser"
    : isListening
      ? "Stop listening"
      : "Start voice input";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !isSupported}
      title={title}
      aria-label={title}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors ${
        isListening
          ? "mic-listening border-syn-accent bg-syn-accent/20 text-syn-accent"
          : "border-syn-border bg-syn-surface-2 text-syn-muted hover:text-syn-text"
      } ${disabled || !isSupported ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
    >
      {isSupported ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
    </button>
  );
}
