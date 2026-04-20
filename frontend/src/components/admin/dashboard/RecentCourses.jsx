import { formatCurrency, formatDate } from "@/utils/helpers";

export default function RecentCourses({ courses = [] }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Recent Courses</h2>
        <p className="mt-1 text-sm text-slate-500">Latest courses created across the platform.</p>
      </div>

      <div className="mt-6 space-y-4">
        {courses.map((course) => (
          <div
            key={course._id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{course.title}</p>
              <p className="mt-1 text-sm text-slate-500">
                {course.instructor?.name || "No instructor"} • {course.category || "General"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{formatCurrency(course.price || 0)}</p>
              <p className="mt-1 text-xs text-slate-400">{formatDate(course.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
