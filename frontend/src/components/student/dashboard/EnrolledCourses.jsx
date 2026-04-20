import { PlayCircle } from "@/components/common/icons";
import CourseProgressBar from "@/components/student/courses/CourseProgressBar";
import LearningLaunchButton from "@/components/student/learning/LearningLaunchButton";
import { formatDate } from "@/utils/helpers";

export default function EnrolledCourses({ courses = [] }) {
  return (
    <section className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Enrolled Courses</h3>
          <p className="mt-1 text-sm text-slate-500">Your active learning paths and recent momentum.</p>
        </div>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
          {courses.length} courses
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {courses.map((course) => {
          const isCourseComplete = Number(course.progressPercentage || 0) >= 100;

          return (
            <article key={course._id} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h4 className="text-base font-semibold text-slate-900">{course.title}</h4>
                  <p className="mt-1 text-sm text-slate-500">{course.instructor?.name || "Assigned instructor"}</p>
                </div>
                <div className="text-sm text-slate-500">Last accessed {formatDate(course.lastAccessedAt)}</div>
              </div>

              <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0 flex-1">
                  <CourseProgressBar value={course.progressPercentage} />
                </div>

                <LearningLaunchButton
                  courseId={course._id}
                  mode="resume"
                  fallbackLessonId={course.currentLessonId}
                  icon={PlayCircle}
                  className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                  loadingLabel="Opening..."
                >
                  {isCourseComplete ? "Review" : "Continue"}
                </LearningLaunchButton>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
