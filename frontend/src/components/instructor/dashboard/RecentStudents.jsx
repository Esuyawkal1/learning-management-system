import { formatDate, getInitials } from "@/utils/helpers";

export default function RecentStudents({ students = [] }) {
  return (
    <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Recent Students</h2>
      <p className="mt-1 text-sm text-slate-500">Newest enrollments across your teaching catalog.</p>
      <div className="mt-6 space-y-4">
        {students.map((enrollment) => (
          <div key={enrollment._id} className="flex items-center gap-3 rounded-2xl border border-slate-100 px-4 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
              {getInitials(enrollment.student?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">{enrollment.student?.name || "Student"}</p>
              <p className="truncate text-sm text-slate-500">{enrollment.course?.title || "Course"}</p>
            </div>
            <p className="text-xs text-slate-400">{formatDate(enrollment.createdAt)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
