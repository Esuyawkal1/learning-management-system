import { getRelativeTime } from "@/utils/helpers";

export default function RecentActivity({ items = [] }) {
  return (
    <section className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
        <p className="mt-1 text-sm text-slate-500">A timeline of your latest completions, submissions, and instructor touchpoints.</p>
      </div>

      <div className="mt-6 space-y-5">
        {items.map((item) => (
          <div key={item.id} className="relative pl-6">
            <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-sky-500" />
            <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-slate-900">{item.title}</p>
                <span className="text-xs font-medium text-slate-400">{getRelativeTime(item.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{item.meta}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
