"use client";

const clampProgress = (value) => {
  const numericValue = Number(value || 0);

  if (Number.isNaN(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numericValue)));
};

export default function ProgressBar({ value = 0 }) {
  const safeValue = clampProgress(value);

  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 transition-all duration-300"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
