import CourseProgressBar from "@/components/student/courses/CourseProgressBar";

export default function ProgressOverview({ courses = [] }) {
  return (
    <section className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Progress Overview</h3>
        <p className="mt-1 text-sm text-slate-500">Track percentage completed across every enrolled course.</p>
      </div>

      <div className="mt-6 space-y-5">
        {courses.map((course) => (
          <article key={course.id || course._id} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-slate-900">{course.title}</h4>
                <p className="mt-1 text-sm text-slate-500">
                  {course.completedLessons || 0}/{course.totalLessons || 0} lessons complete
                </p>
              </div>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                {course.progressPercentage || 0}%
              </span>
            </div>
            <div className="mt-4">
              <CourseProgressBar value={course.progressPercentage} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
