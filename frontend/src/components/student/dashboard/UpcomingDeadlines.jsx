import { formatDate } from "@/utils/helpers";

export default function UpcomingDeadlines({ assignments = [] }) {
  return (
    <section className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Upcoming Deadlines</h3>
        <p className="mt-1 text-sm text-slate-500">Stay ahead of submissions and instructor checkpoints.</p>
      </div>

      <div className="mt-6 space-y-4">
        {assignments.map((assignment) => (
          <article key={assignment._id} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold text-slate-900">{assignment.title}</h4>
                <p className="mt-1 text-sm text-slate-500">{assignment.course?.title || "Course assignment"}</p>
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {assignment.status}
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-500">Due {formatDate(assignment.dueDate)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
