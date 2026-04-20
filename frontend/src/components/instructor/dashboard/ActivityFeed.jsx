import { getRelativeTime } from "@/utils/helpers";

const activityStyles = {
  course: "bg-amber-100 text-amber-700",
  student: "bg-sky-100 text-sky-700",
  lesson: "bg-emerald-100 text-emerald-700",
  message: "bg-violet-100 text-violet-700",
};

export default function ActivityFeed({ items = [] }) {
  return (
    <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Activity Feed</h2>
      <p className="mt-1 text-sm text-slate-500">Enrollment, lesson, message, and course activity from your instructor workspace.</p>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 rounded-2xl border border-slate-100 px-4 py-4">
            <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-semibold uppercase ${activityStyles[item.type] || "bg-slate-100 text-slate-700"}`}>
              {item.type?.slice(0, 1) || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
                </div>
                <p className="whitespace-nowrap text-xs text-slate-400">{getRelativeTime(item.createdAt)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
