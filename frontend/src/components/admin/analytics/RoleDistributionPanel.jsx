import { formatNumber } from "@/utils/helpers";

const segmentColors = {
  student: "#0ea5e9",
  instructor: "#10b981",
  admin: "#8b5cf6",
};

export default function RoleDistributionPanel({ data = [], summary }) {
  const segments = data.reduce(
    (accumulator, item) => {
      const start = accumulator.stop;
      const end = accumulator.stop + (item.share || 0);

      accumulator.stop = end;
      accumulator.values.push(
        `${segmentColors[item.key] || "#cbd5e1"} ${start}% ${end}%`
      );

      return accumulator;
    },
    { stop: 0, values: [] }
  ).values;

  const chartStyle = {
    background: `conic-gradient(${segments.join(", ") || "#e2e8f0 0% 100%"})`,
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Audience mix</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">User distribution and platform health</h2>
        </div>
        <p className="text-sm leading-6 text-slate-500">
          This split helps the admin team balance learner growth, instructor supply, and overall account quality.
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-8 xl:flex-row xl:items-start">
        <div className="relative flex h-52 w-52 items-center justify-center rounded-full bg-slate-100 p-4">
          <div className="h-full w-full rounded-full" style={chartStyle} />
          <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Active rate</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{summary?.activeUserRate || 0}%</p>
          </div>
        </div>

        <div className="w-full space-y-4">
          {data.map((item) => (
            <div key={item.key} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatNumber(item.value)} accounts</p>
                </div>
                <p className={`text-lg font-semibold ${item.accent}`}>{item.share}%</p>
              </div>

              <div className="mt-3 h-2 rounded-full bg-white">
                <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${Math.max(item.share || 0, item.value ? 6 : 0)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Published courses</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{formatNumber(summary?.publishedCourses || 0)}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Catalog size</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{formatNumber(summary?.totalCourses || 0)}</p>
        </div>
      </div>
    </section>
  );
}
