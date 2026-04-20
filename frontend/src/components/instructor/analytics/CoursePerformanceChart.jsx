export default function CoursePerformanceChart({ data = [] }) {
  const maxValue = Math.max(...data.map((item) => item.enrollments), 1);

  return (
    <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Course Performance</h2>
      <p className="mt-1 text-sm text-slate-500">Enrollments and completion rate across your courses.</p>
      <div className="mt-6 space-y-4">
        {data.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-slate-900">{item.course}</p>
              <p className="text-xs text-slate-500">{item.enrollments} enrollments • {item.completionRate}% completion</p>
            </div>
            <div className="h-3 rounded-full bg-amber-50">
              <div className="h-3 rounded-full bg-slate-900" style={{ width: `${Math.max((item.enrollments / maxValue) * 100, 8)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
