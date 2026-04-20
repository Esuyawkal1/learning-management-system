"use client";

import Modal from "@/components/common/Modal";

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "danger",
  onConfirm,
  onClose,
  isLoading = false,
}) {
  const confirmClassName =
    confirmVariant === "danger"
      ? "bg-rose-600 hover:bg-rose-700"
      : "bg-slate-900 hover:bg-slate-700";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} maxWidth="max-w-lg">
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${confirmClassName}`}
        >
          {isLoading ? "Working..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
