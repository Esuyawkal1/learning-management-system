export default function CourseProgressBar({ value = 0 }) {
  const safeValue = Math.min(Math.max(Number(value || 0), 0), 100);

  return (
    <div>
      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        <span>Progress</span>
        <span>{safeValue}%</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-sky-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all"
          style={{ width: `${Math.max(safeValue, safeValue ? 6 : 0)}%` }}
        />
      </div>
    </div>
  );
}
