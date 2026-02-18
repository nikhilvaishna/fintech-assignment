"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/components/AuthProvider";
import { tasksApi, type Task, type TasksResponse } from "@/lib/api";
import { TaskFormModal } from "@/components/TaskFormModal";
import { TaskCard } from "@/components/TaskCard";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [data, setData] = useState<TasksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [modalTask, setModalTask] = useState<Task | null | "new">(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tasksApi.list({
        page,
        limit: 10,
        status: status || undefined,
        search: search || undefined,
      });
      setData(res);
    } catch (err) {
      if (err instanceof Error && err.message === "Session expired") {
        logout();
        return;
      }
      toast.error(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [page, status, search, logout]);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    fetchTasks();
  }, [user, router, fetchTasks]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleToggle = async (task: Task) => {
    try {
      await tasksApi.toggle(task.id);
      toast.success(task.status === "COMPLETED" ? "Marked as pending" : "Marked as completed");
      fetchTasks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleDelete = async (task: Task) => {
    if (!confirm("Delete this task?")) return;
    try {
      await tasksApi.delete(task.id);
      toast.success("Task deleted");
      fetchTasks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleFormSuccess = () => {
    setModalTask(null);
    toast.success(modalTask === "new" ? "Task created" : "Task updated");
    fetchTasks();
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="animate-pulse text-surface-500">Loading...</div>
      </div>
    );
  }

  const pagination = data?.pagination;
  const tasks = data?.tasks ?? [];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <header className="sticky top-0 z-10 border-b border-surface-200 dark:border-surface-800 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display font-bold text-xl text-surface-900 dark:text-white">Taskflow</h1>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-sm text-surface-500 dark:text-surface-400 truncate max-w-[140px] sm:max-w-[200px]">
                {user.email}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition"
              >
                Log out
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModalTask("new")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400 text-white font-medium transition shadow-lg shadow-brand-500/25"
          >
            <span className="text-lg leading-none">+</span>
            Add task
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search tasks by title..."
              className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300 font-medium hover:bg-surface-300 dark:hover:bg-surface-600 transition"
            >
              Search
            </button>
          </form>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 sm:w-44"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-surface-200/50 dark:bg-surface-800/50 animate-pulse"
              />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border-2 border-dashed border-surface-200 dark:border-surface-700 bg-surface-100/50 dark:bg-surface-800/30">
            <p className="text-surface-500 dark:text-surface-400 font-medium">No tasks yet</p>
            <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">
              {search || status ? "Try changing filters." : "Create your first task above."}
            </p>
            {!search && !status && (
              <button
                type="button"
                onClick={() => setModalTask("new")}
                className="mt-4 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 text-white text-sm font-medium"
              >
                Add task
              </button>
            )}
          </div>
        ) : (
          <>
            <ul className="space-y-3 animate-fade-in">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={() => handleToggle(task)}
                  onEdit={() => setModalTask(task)}
                  onDelete={() => handleDelete(task)}
                />
              ))}
            </ul>
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-50 dark:hover:bg-surface-700 transition"
                >
                  Previous
                </button>
                <span className="text-sm text-surface-500 dark:text-surface-400 px-2">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-50 dark:hover:bg-surface-700 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {modalTask && (
        <TaskFormModal
          task={modalTask === "new" ? null : modalTask}
          onClose={() => setModalTask(null)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
