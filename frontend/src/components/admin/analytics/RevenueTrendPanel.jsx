import { formatCurrency, formatNumber } from "@/utils/helpers";

export default function RevenueTrendPanel({ data = [], summary }) {
  const maxRevenue = Math.max(...data.map((item) => item.revenue || 0), 1);

  const spotlight = [
    {
      label: "Current month revenue",
      value: formatCurrency(summary?.currentMonthRevenue || 0),
      helper: `${summary?.currentMonthRevenueChange > 0 ? "+" : ""}${summary?.currentMonthRevenueChange || 0}%`,
    },
    {
      label: "Current month enrollments",
      value: formatNumber(summary?.currentMonthEnrollments || 0),
      helper: `${summary?.currentMonthEnrollmentChange > 0 ? "+" : ""}${summary?.currentMonthEnrollmentChange || 0}%`,
    },
    {
      label: "New users this month",
      value: formatNumber(summary?.newUsersThisMonth || 0),
      helper: `${summary?.newUsersChange > 0 ? "+" : ""}${summary?.newUsersChange || 0}%`,
    },
  ];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 px-6 py-6 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-200">
              Revenue and acquisition
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Six-month platform trend</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Revenue, enrollments, and new-user growth are pulled from live admin data so the team can spot momentum without leaving the dashboard.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Tracked total</p>
            <p className="mt-2 text-3xl font-semibold">{formatCurrency(summary?.totalRevenue || 0)}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="grid gap-3 md:grid-cols-3">
          {spotlight.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{item.value}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.helper}</p>
            </div>
          ))}
        </div>

        <div className="relative mt-8 rounded-[1.75rem] border border-slate-100 bg-slate-50/80 p-5">
          <div className="pointer-events-none absolute inset-x-5 top-5 bottom-20 grid grid-rows-4">
            {[0, 1, 2, 3].map((line) => (
              <div key={line} className="border-b border-dashed border-slate-200" />
            ))}
          </div>

          <div className="relative grid h-80 grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
            {data.map((item) => {
              const barHeight = `${Math.max(((item.revenue || 0) / maxRevenue) * 100, item.revenue ? 14 : 6)}%`;

              return (
                <div key={item.key} className="flex min-w-0 flex-col justify-end">
                  <div className="flex-1">
                    <div className="flex h-full items-end rounded-[1.5rem] border border-slate-100 bg-white p-3 shadow-sm">
                      <div
                        className="flex w-full items-end rounded-[1rem] bg-gradient-to-t from-sky-600 via-cyan-500 to-emerald-300 px-2 pb-2 pt-3 transition-all"
                        style={{ height: barHeight }}
                        title={`${item.label}: ${formatCurrency(item.revenue || 0)}`}
                      >
                        <div className="w-full rounded-xl bg-slate-950/10 px-2 py-1 text-[11px] font-semibold text-white/95">
                          {formatCurrency(item.revenue || 0)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                    <p className="mt-2 text-sm font-medium text-slate-700">
                      {formatNumber(item.enrollments || 0)} enrollments
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{formatNumber(item.newUsers || 0)} new users</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
