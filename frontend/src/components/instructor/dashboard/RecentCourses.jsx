import { formatCurrency, formatDate } from "@/utils/helpers";

export default function RecentCourses({ courses = [] }) {
  return (
    <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Recent Courses</h2>
      <p className="mt-1 text-sm text-slate-500">A quick view of your newest or most recently updated courses.</p>
      <div className="mt-6 space-y-4">
        {courses.map((course) => (
          <div key={course._id} className="rounded-2xl border border-slate-100 px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{course.title}</p>
                <p className="mt-1 text-sm text-slate-500">{course.category || "General"} • {course.published ? "Published" : "Draft"}</p>
              </div>
              <p className="text-sm font-semibold text-slate-900">{formatCurrency(course.price || 0)}</p>
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">Updated {formatDate(course.updatedAt)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
