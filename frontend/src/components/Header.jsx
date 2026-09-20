import { ListTodo, MessageCircle, Sparkles } from "lucide-react";

export default function Header({ isBackendOnline, activeSection, onSectionChange }) {
  return (
    <header className="glass sticky top-0 z-10 rounded-2xl px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex items-center justify-between gap-3">
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
          <span className={`h-1.5 w-1.5 rounded-full ${isBackendOnline === false ? "bg-syn-danger" : "bg-syn-accent"} ${isBackendOnline !== false ? "animate-pulse" : ""}`} />
          <span className="text-syn-muted">{isBackendOnline === false ? "Backend offline" : "Online"}</span>
        </div>
      </div>

      <nav className="mt-3 flex gap-1 rounded-xl border border-syn-border bg-syn-surface-2/45 p-1" aria-label="Main navigation">
        <button type="button" onClick={() => onSectionChange("chat")} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${activeSection === "chat" ? "bg-syn-accent/15 text-syn-accent" : "text-syn-muted hover:text-syn-text"}`}>
          <MessageCircle className="h-4 w-4" /> Chat
        </button>
        <button type="button" onClick={() => onSectionChange("tasks")} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${activeSection === "tasks" ? "bg-syn-accent/15 text-syn-accent" : "text-syn-muted hover:text-syn-text"}`}>
          <ListTodo className="h-4 w-4" /> Tasks
        </button>
      </nav>
    </header>
  );
}