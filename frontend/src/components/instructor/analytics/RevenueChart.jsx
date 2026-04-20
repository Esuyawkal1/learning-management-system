import { formatCurrency } from "@/utils/helpers";

export default function RevenueChart({ data = [], totalRevenue = 0 }) {
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1);

  return (
    <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Revenue Trend</h2>
          <p className="mt-1 text-sm text-slate-500">Enrollment revenue trend over the last six months.</p>
        </div>
        <p className="text-2xl font-semibold text-slate-900">{formatCurrency(totalRevenue)}</p>
      </div>

      <div className="mt-8 grid grid-cols-6 items-end gap-3">
        {data.map((item) => (
          <div key={item.key} className="flex flex-col items-center gap-3">
            <div className="flex h-52 w-full items-end rounded-3xl bg-amber-50 p-2">
              <div className="w-full rounded-2xl bg-gradient-to-t from-slate-900 via-slate-700 to-amber-400" style={{ height: `${Math.max((item.revenue / maxRevenue) * 100, item.revenue ? 16 : 6)}%` }} />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{item.label}</p>
              <p className="mt-1 text-xs text-slate-400">{item.enrollments} enrollments</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
