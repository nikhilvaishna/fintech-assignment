"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { Task } from "@/lib/api";
import { tasksApi } from "@/lib/api";

type Props = {
  task: Task | null;
  onClose: () => void;
  onSuccess: () => void;
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
];

export function TaskFormModal({ task, onClose, onSuccess }: Props) {
  const isNew = !task;
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState(task?.status ?? "PENDING");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStatus(task.status);
    } else {
      setTitle("");
      setDescription("");
      setStatus("PENDING");
    }
  }, [task]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      toast.error("Title is required");
      return;
    }
    setLoading(true);
    try {
      if (isNew) {
        await tasksApi.create({ title: t, description: description.trim() || undefined, status });
      } else {
        await tasksApi.update(task.id, {
          title: t,
          description: description.trim() || undefined,
          status,
        });
      }
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white mb-4">
            {isNew ? "New task" : "Edit task"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="modal-title" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Title
              </label>
              <input
                id="modal-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Task title"
                maxLength={500}
              />
            </div>
            <div>
              <label htmlFor="modal-desc" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Description (optional)
              </label>
              <textarea
                id="modal-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                placeholder="Add details..."
                maxLength={2000}
              />
            </div>
            <div>
              <label htmlFor="modal-status" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Status
              </label>
              <select
                id="modal-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Task["status"])}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 font-medium hover:bg-surface-50 dark:hover:bg-surface-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving…" : isNew ? "Create" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
