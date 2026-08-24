import { Sparkles } from "lucide-react";

export default function Header({ isBackendOnline }) {
  return (
    <header className="glass sticky top-0 z-10 flex items-center justify-between rounded-2xl px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-syn-accent to-syn-accent-2">
          <Sparkles className="h-5 w-5 text-syn-bg" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-syn-text">SYNTRA</h1>
          <p className="text-xs text-syn-muted">Personal AI Assistant</p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-syn-border bg-syn-surface-2/60 px-3 py-1.5 text-xs font-medium">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isBackendOnline === false ? "bg-syn-danger" : "bg-syn-accent"
          } ${isBackendOnline !== false ? "animate-pulse" : ""}`}
        />
        <span className="text-syn-muted">
          {isBackendOnline === false ? "Backend offline" : "Online"}
        </span>
      </div>
    </header>
  );
}
