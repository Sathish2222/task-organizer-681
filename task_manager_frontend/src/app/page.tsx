"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api, ApiError, type Task } from "@/lib/api";
import { Badge, Button, Card, Input, Textarea, cx } from "@/components/ui";

function formatDue(dateIso?: string | null) {
  if (!dateIso) return "";
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString();
}

function normalizeTags(s: string): string[] {
  return s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function Home() {
  const { token, user, loading: authLoading, login, signup, logout } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authError, setAuthError] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [filterCompleted, setFilterCompleted] = useState<"all" | "open" | "done">("all");
  const [filterTag, setFilterTag] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [newTags, setNewTags] = useState("");

  const completedParam = useMemo(() => {
    if (filterCompleted === "all") return null;
    return filterCompleted === "done";
  }, [filterCompleted]);

  async function refreshTasks() {
    if (!token) return;
    setTasksLoading(true);
    setTasksError(null);
    try {
      const items = await api.listTasks(token, {
        q: q || undefined,
        tag: filterTag || undefined,
        completed: completedParam,
      });
      setTasks(items);
    } catch (e) {
      if (e instanceof ApiError) setTasksError(e.message);
      else setTasksError("Failed to load tasks");
    } finally {
      setTasksLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    void refreshTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function onSubmitAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    try {
      if (mode === "login") await login(email, password);
      else await signup(email, password);
      setEmail("");
      setPassword("");
    } catch (err) {
      if (err instanceof ApiError) setAuthError(err.message);
      else setAuthError("Authentication failed");
    }
  }

  async function onCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setTasksError(null);
    try {
      await api.createTask(token, {
        title: newTitle,
        description: newDescription || undefined,
        due_date: newDueDate || undefined,
        priority: newPriority,
        tags: normalizeTags(newTags),
      });
      setNewTitle("");
      setNewDescription("");
      setNewDueDate("");
      setNewPriority("medium");
      setNewTags("");
      await refreshTasks();
    } catch (e) {
      if (e instanceof ApiError) setTasksError(e.message);
      else setTasksError("Failed to create task");
    }
  }

  async function toggleCompleted(t: Task) {
    if (!token) return;
    try {
      const updated = await api.updateTask(token, t.id, { completed: !t.completed });
      setTasks((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
    } catch (e) {
      if (e instanceof ApiError) setTasksError(e.message);
      else setTasksError("Failed to update task");
    }
  }

  async function removeTask(id: Task["id"]) {
    if (!token) return;
    try {
      await api.deleteTask(token, id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      if (e instanceof ApiError) setTasksError(e.message);
      else setTasksError("Failed to delete task");
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500/10 to-slate-50 border border-slate-200" />
            <div>
              <p className="text-sm font-semibold leading-5">Task Organizer</p>
              <p className="text-xs text-slate-500">Tasks, tags, priorities, due dates</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {token && user ? (
              <>
                <div className="text-right">
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-slate-500">Signed in</p>
                </div>
                <Button variant="secondary" onClick={logout}>
                  Sign out
                </Button>
              </>
            ) : (
              <a
                className="text-sm text-slate-600 hover:text-slate-900"
                href="https://nextjs.org"
                target="_blank"
                rel="noreferrer"
              >
                Help
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-6 md:grid-cols-5">
        {!token ? (
          <div className="md:col-span-3 md:col-start-2">
            <Card className="p-5">
              <h1 className="text-xl font-semibold">Welcome</h1>
              <p className="mt-1 text-sm text-slate-600">
                Sign in to manage your personal task list. This app stores your token in localStorage (static-export
                friendly).
              </p>

              <div className="mt-4 flex gap-2">
                <Button variant={mode === "login" ? "primary" : "secondary"} onClick={() => setMode("login")}>
                  Login
                </Button>
                <Button variant={mode === "signup" ? "primary" : "secondary"} onClick={() => setMode("signup")}>
                  Sign up
                </Button>
              </div>

              <form onSubmit={onSubmitAuth} className="mt-4 space-y-3">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                />

                {authError ? (
                  <p role="alert" className="text-sm text-red-600">
                    {authError}
                  </p>
                ) : null}

                <Button type="submit" className="w-full" disabled={authLoading}>
                  {authLoading ? "Please wait…" : mode === "login" ? "Login" : "Create account"}
                </Button>

                <p className="text-xs text-slate-500">
                  Backend base URL must be set via <code className="font-mono">NEXT_PUBLIC_API_BASE_URL</code>.
                </p>
              </form>
            </Card>
          </div>
        ) : (
          <>
            <section className="md:col-span-2">
              <Card className="p-4">
                <h2 className="text-base font-semibold">Create task</h2>
                <form onSubmit={onCreateTask} className="mt-3 space-y-3">
                  <Input
                    label="Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    placeholder="e.g., Write project brief"
                  />
                  <Textarea
                    label="Description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Optional notes…"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-800" htmlFor="due">
                        Due date
                      </label>
                      <input
                        id="due"
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-800" htmlFor="prio">
                        Priority
                      </label>
                      <select
                        id="prio"
                        value={newPriority}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "low" || v === "medium" || v === "high") setNewPriority(v);
                        }}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <Input
                    label="Tags"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="comma,separated,tags"
                    hint="Use commas to separate tags."
                  />

                  <Button type="submit" className="w-full">
                    Add task
                  </Button>
                </form>
              </Card>

              <Card className="mt-4 p-4">
                <h2 className="text-base font-semibold">Filters</h2>
                <div className="mt-3 space-y-3">
                  <Input label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks…" />
                  <Input
                    label="Tag"
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    placeholder="e.g., work"
                  />
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-800" htmlFor="completed">
                      Status
                    </label>
                    <select
                      id="completed"
                      value={filterCompleted}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "all" || v === "open" || v === "done") setFilterCompleted(v);
                      }}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All</option>
                      <option value="open">Open</option>
                      <option value="done">Completed</option>
                    </select>
                  </div>

                  <Button variant="secondary" onClick={refreshTasks} disabled={tasksLoading}>
                    {tasksLoading ? "Refreshing…" : "Apply"}
                  </Button>

                  {tasksError ? (
                    <p role="alert" className="text-sm text-red-600">
                      {tasksError}
                    </p>
                  ) : null}
                </div>
              </Card>
            </section>

            <section className="md:col-span-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Your tasks</h2>
                  <p className="text-sm text-slate-600">{tasksLoading ? "Loading…" : `${tasks.length} items`}</p>
                </div>
                <Button variant="ghost" onClick={refreshTasks}>
                  Refresh
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                {tasks.length === 0 && !tasksLoading ? (
                  <Card className="p-6">
                    <p className="text-sm text-slate-600">No tasks yet. Create one on the left.</p>
                  </Card>
                ) : null}

                {tasks.map((t) => (
                  <Card key={String(t.id)} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            className={cx(
                              "mt-0.5 h-5 w-5 shrink-0 rounded border",
                              t.completed ? "bg-cyan-500 border-cyan-500" : "bg-white border-slate-300"
                            )}
                            aria-label={t.completed ? "Mark as incomplete" : "Mark as complete"}
                            onClick={() => void toggleCompleted(t)}
                          />
                          <h3 className={cx("font-medium", t.completed ? "line-through text-slate-500" : "")}>
                            {t.title}
                          </h3>
                        </div>
                        {t.description ? <p className="mt-2 text-sm text-slate-600">{t.description}</p> : null}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {t.priority !== undefined && t.priority !== null ? (
                            <Badge tone="blue">Priority: {String(t.priority)}</Badge>
                          ) : null}
                          {t.due_date ? <Badge tone="teal">Due: {formatDue(t.due_date)}</Badge> : null}
                          {(t.tags ?? []).map((tag) => (
                            <Badge key={tag}>{tag}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <Button variant="danger" size="sm" onClick={() => void removeTask(t.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="mt-4 p-4">
                <p className="text-xs text-slate-500">
                  Tip: if your backend uses different routes than expected, update <code className="font-mono">src/lib/api.ts</code>{" "}
                  endpoint fallbacks accordingly.
                </p>
              </Card>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
