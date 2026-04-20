"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle } from "@/components/common/icons";
import LearningLaunchButton from "@/components/student/learning/LearningLaunchButton";
import CourseProgressBar from "@/components/student/courses/CourseProgressBar";

export default function ContinueLearningCard({ course }) {
  if (!course) {
    return (
      <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Continue Learning</h3>
        <p className="mt-2 text-sm text-slate-500">Enroll in a course to unlock your personalized continuation queue.</p>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">Continue Learning</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">{course.title}</h3>
          <p className="mt-2 text-sm text-slate-500">{course.instructor?.name || "Instructor"} is your guide for this learning path.</p>
        </div>
        <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Next Lesson</p>
          <p className="mt-2 text-lg font-semibold text-emerald-700">{course.completedLessons || 0}/{course.totalLessons || 0}</p>
        </div>
      </div>

      <div className="mt-6">
        <CourseProgressBar value={course.progressPercentage} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <LearningLaunchButton
          courseId={course._id}
          mode="resume"
          fallbackLessonId={course.currentLessonId}
          icon={PlayCircle}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          loadingLabel="Opening..."
        >
          Resume Course
        </LearningLaunchButton>
        <Link
          href="/student/courses"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          View All Courses
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
