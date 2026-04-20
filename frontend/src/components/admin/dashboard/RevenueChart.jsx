import { formatCurrency } from "@/utils/helpers";

export default function RevenueChart({ data = [], totalRevenue = 0 }) {
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1);

  return (
    <section className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Revenue Trend</h2>
          <p className="mt-1 text-sm text-slate-500">Estimated revenue from course enrollments over the last 6 months.</p>
        </div>
        <p className="text-2xl font-semibold text-slate-900">{formatCurrency(totalRevenue)}</p>
      </div>

      <div className="mt-8 grid flex-1 grid-cols-6 items-end gap-3">
        {data.map((item) => {
          const height = `${Math.max((item.revenue / maxRevenue) * 100, item.revenue > 0 ? 18 : 6)}%`;

          return (
            <div key={item.key} className="flex flex-col items-center gap-3">
              <div className="flex h-56 w-full items-end rounded-3xl bg-slate-100 p-2">
                <div
                  className="w-full rounded-2xl bg-gradient-to-t from-sky-600 via-sky-500 to-cyan-400 transition-all"
                  style={{ height }}
                  title={`${item.label}: ${formatCurrency(item.revenue)}`}
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{item.label}</p>
                <p className="mt-1 text-xs text-slate-400">{item.enrollments} enrollments</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
