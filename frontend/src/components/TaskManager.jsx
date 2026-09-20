import { useState } from "react";
import { CalendarDays, Check, ListTodo, LoaderCircle, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useTasks } from "../hooks/useTasks.js";

const INITIAL_FORM = { title: "", description: "", priority: "medium", dueDate: "" };

const priorityStyles = {
  low: "border-syn-accent/25 bg-syn-accent/10 text-syn-accent",
  medium: "border-syn-accent-2/25 bg-syn-accent-2/10 text-syn-accent-2",
  high: "border-syn-danger/25 bg-syn-danger/10 text-syn-danger",
};

function formatDueDate(value) {
  if (!value) return null;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value)
  );
}

export default function TaskManager() {
  const { tasks, isLoading, isCreating, busyTaskIds, error, loadTasks, createTask, changeTask, removeTask } =
    useTasks();
  const [form, setForm] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState(null);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) {
      setFormError("A task title is required.");
      return;
    }

    setFormError(null);
    const created = await createTask({
      title,
      description: form.description.trim() || undefined,
      priority: form.priority,
      due_date: form.dueDate ? `${form.dueDate}T00:00:00` : null,
    });
    if (created) setForm(INITIAL_FORM);
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-1" aria-labelledby="tasks-heading">
      <div className="glass rounded-2xl p-4 sm:p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-syn-accent">
              <ListTodo className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em]">Task management</span>
            </div>
            <h2 id="tasks-heading" className="text-xl font-semibold tracking-tight text-syn-text">
              Keep your day in motion
            </h2>
            <p className="mt-1 text-sm text-syn-muted">Capture a task, set its priority, and check it off when it’s done.</p>
          </div>
          <button
            type="button"
            onClick={loadTasks}
            disabled={isLoading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-syn-border bg-syn-surface-2/60 text-syn-muted transition hover:border-syn-accent/50 hover:text-syn-accent disabled:opacity-50"
            aria-label="Refresh tasks"
            title="Refresh tasks"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-syn-muted">Task title</span>
            <input
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
              maxLength={255}
              placeholder="What needs to get done?"
              disabled={isCreating}
              className="w-full rounded-xl border border-syn-border bg-syn-surface-2/60 px-3.5 py-2.5 text-sm text-syn-text placeholder:text-syn-muted focus:border-syn-accent focus:outline-none disabled:opacity-60"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-syn-muted">Description <span className="font-normal">(optional)</span></span>
            <textarea
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
              rows={2}
              placeholder="Add a little context…"
              disabled={isCreating}
              className="w-full resize-none rounded-xl border border-syn-border bg-syn-surface-2/60 px-3.5 py-2.5 text-sm text-syn-text placeholder:text-syn-muted focus:border-syn-accent focus:outline-none disabled:opacity-60"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-medium text-syn-muted">Priority</span>
            <select
              value={form.priority}
              onChange={(event) => updateForm("priority", event.target.value)}
              disabled={isCreating}
              className="w-full rounded-xl border border-syn-border bg-syn-surface-2/60 px-3.5 py-2.5 text-sm text-syn-text focus:border-syn-accent focus:outline-none disabled:opacity-60"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-medium text-syn-muted">Due date <span className="font-normal">(optional)</span></span>
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) => updateForm("dueDate", event.target.value)}
              disabled={isCreating}
              className="w-full rounded-xl border border-syn-border bg-syn-surface-2/60 px-3.5 py-2.5 text-sm text-syn-text [color-scheme:dark] focus:border-syn-accent focus:outline-none disabled:opacity-60"
            />
          </label>

          {formError && <p className="sm:col-span-2 text-xs text-syn-danger" role="alert">{formError}</p>}
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-syn-accent to-syn-accent-2 px-4 py-2.5 text-sm font-semibold text-syn-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {isCreating ? "Adding…" : "Add task"}
            </button>
          </div>
        </form>
      </div>

      <div className="glass min-h-[220px] rounded-2xl p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-syn-text">Your tasks</h3>
          {!isLoading && <span className="text-xs text-syn-muted">{tasks.length} {tasks.length === 1 ? "task" : "tasks"}</span>}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-syn-danger/30 bg-syn-danger/10 px-3 py-2.5 text-sm text-syn-danger" role="alert">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-syn-muted">
            <LoaderCircle className="h-4 w-4 animate-spin" /> Loading tasks…
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex min-h-36 flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-syn-accent/10 text-syn-accent">
              <ListTodo className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-syn-text">No tasks yet</p>
            <p className="mt-1 text-sm text-syn-muted">Add your first task above to start organizing your day.</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {tasks.map((task) => {
              const isBusy = busyTaskIds.has(task.id);
              const dueDate = formatDueDate(task.due_date);
              return (
                <li key={task.id} className={`group flex gap-3 rounded-xl border border-syn-border/80 bg-syn-surface-2/45 p-3.5 transition ${task.completed ? "opacity-65" : "hover:border-syn-accent/30"}`}>
                  <button
                    type="button"
                    onClick={() => changeTask(task.id, { completed: !task.completed })}
                    disabled={isBusy}
                    aria-label={task.completed ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition disabled:cursor-not-allowed ${task.completed ? "border-syn-accent bg-syn-accent text-syn-bg" : "border-syn-muted/60 text-transparent hover:border-syn-accent"}`}
                  >
                    {isBusy ? <LoaderCircle className="h-3 w-3 animate-spin" /> : <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`break-words text-sm font-medium ${task.completed ? "text-syn-muted line-through" : "text-syn-text"}`}>{task.title}</p>
                    {task.description && <p className="mt-1 break-words text-sm text-syn-muted">{task.description}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${priorityStyles[task.priority] || priorityStyles.medium}`}>{task.priority}</span>
                      {dueDate && <span className="inline-flex items-center gap-1 text-[11px] text-syn-muted"><CalendarDays className="h-3 w-3" /> Due {dueDate}</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTask(task.id)}
                    disabled={isBusy}
                    aria-label={`Delete ${task.title}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-syn-muted transition hover:bg-syn-danger/10 hover:text-syn-danger disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}