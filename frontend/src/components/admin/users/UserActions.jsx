"use client";

import { Ban, CheckCircle2, Pencil, Trash2 } from "@/components/common/icons";

export default function UserActions({ isActive, onEdit, onToggleStatus, onDelete }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onToggleStatus}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${
          isActive
            ? "border border-amber-200 text-amber-700 hover:bg-amber-50"
            : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        }`}
      >
        {isActive ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        {isActive ? "Deactivate" : "Activate"}
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
