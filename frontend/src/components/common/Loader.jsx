"use client";

export default function Loader({ label = "Loading...", fullScreen = false }) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? "min-h-screen" : "min-h-[240px]"
      }`}
    >
      <div className="flex flex-col items-center gap-3 text-slate-600">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        <p className="text-sm font-medium">{label}</p>
      </div>
    </div>
  );
}
