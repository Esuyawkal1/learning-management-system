"use client";

export default function ErrorMessage({
  title = "Something went wrong",
  message = "Please try again in a moment.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-rose-700">{message}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
