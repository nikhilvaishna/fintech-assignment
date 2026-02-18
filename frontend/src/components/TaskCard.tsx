"use client";

import type { Task } from "@/lib/api";

type Props = {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export function TaskCard({ task, onToggle, onEdit, onDelete }: Props) {
  const isCompleted = task.status === "COMPLETED";

  return (
    <li className="group bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-4 shadow-sm hover:shadow-md dark:hover:shadow-none transition flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onToggle}
            className="flex-shrink-0 w-5 h-5 rounded-md border-2 border-surface-300 dark:border-surface-600 flex items-center justify-center hover:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition"
            aria-label={isCompleted ? "Mark pending" : "Mark completed"}
          >
            {isCompleted && (
              <span className="w-2.5 h-2.5 rounded-sm bg-brand-500" />
            )}
          </button>
          <h2
            className={`font-medium text-surface-900 dark:text-white ${
              isCompleted ? "line-through text-surface-500 dark:text-surface-400" : ""
            }`}
          >
            {task.title}
          </h2>
          <span
            className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[task.status] ?? statusStyles.PENDING}`}
          >
            {statusLabels[task.status] ?? task.status}
          </span>
        </div>
        {task.description && (
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 line-clamp-2 ml-7">
            {task.description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 ml-7 sm:ml-0">
        <button
          type="button"
          onClick={onEdit}
          className="px-3 py-1.5 text-sm rounded-lg text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white transition"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="px-3 py-1.5 text-sm rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
