export default function StudentProgressChart({ data = [] }) {
  return (
    <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Student Progress</h2>
      <p className="mt-1 text-sm text-slate-500">Completion rates for your most recent enrolled students.</p>
      <div className="mt-6 space-y-4">
        {data.slice(0, 8).map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.student}</p>
                <p className="text-xs text-slate-500">{item.course}</p>
              </div>
              <p className="text-xs font-semibold text-slate-700">{item.progress}%</p>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.max(item.progress, 4)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
