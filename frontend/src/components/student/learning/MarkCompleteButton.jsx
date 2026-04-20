"use client";

import { CheckCircle2 } from "@/components/common/icons";

export default function MarkCompleteButton({
  lesson,
  loading = false,
  onClick,
}) {
  const isCompleted = Boolean(lesson?.completed);

  return (
    <button
      type="button"
      disabled={!lesson || isCompleted || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
        isCompleted
          ? "cursor-default border border-emerald-200 bg-emerald-50 text-emerald-700"
          : "bg-slate-900 text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      }`}
    >
      <CheckCircle2 className="h-4 w-4" />
      {isCompleted ? "Completed" : loading ? "Saving..." : "Mark Complete"}
    </button>
  );
}
