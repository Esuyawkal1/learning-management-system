import { formatDate } from "@/utils/helpers";

export default function RecentLessons({ lessons = [] }) {
  return (
    <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Recent Lessons</h2>
      <p className="mt-1 text-sm text-slate-500">Latest lesson updates and published content.</p>
      <div className="mt-6 space-y-4">
        {lessons.map((lesson) => (
          <div key={lesson._id} className="rounded-2xl border border-slate-100 px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">{lesson.title}</p>
                <p className="mt-1 text-sm text-slate-500">{lesson.course?.title || "Course"} • {lesson.published ? "Published" : "Draft"}</p>
              </div>
              <p className="text-xs text-slate-400">{formatDate(lesson.updatedAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
