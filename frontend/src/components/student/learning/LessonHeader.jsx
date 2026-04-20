"use client";

import CourseMaterials from "@/components/student/learning/CourseMaterials";
import ProgressBar from "@/components/student/learning/ProgressBar";

export default function LessonHeader({
  course,
  progress,
  activeLesson,
  documents = [],
}) {
  return (
    <section className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_220px_minmax(280px,360px)] xl:items-end">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-600">
            Course Learning
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">{course?.title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Instructor: {course?.instructor?.name || "Instructor"}
          </p>
          {activeLesson ? (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Now learning: Lesson {activeLesson.order || 0} • {activeLesson.title}
            </p>
          ) : null}
        </div>

        <div className="w-full xl:justify-self-center">
          <CourseMaterials documents={documents} compact showWhenEmpty />
        </div>

        <div className="w-full max-w-sm rounded-[1.75rem] bg-slate-50 p-5">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Progress</span>
            <span className="font-semibold text-slate-900">
              {progress?.progressPercentage || 0}%
            </span>
          </div>
          <div className="mt-4">
            <ProgressBar value={progress?.progressPercentage} />
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>
              {progress?.completedLessons || 0}/{progress?.totalLessons || 0} lessons completed
            </span>
            <span className="font-medium text-slate-700">
              {progress?.totalLessons
                ? `${(progress.totalLessons - (progress.completedLessons || 0)).toString()} left`
                : "Ready"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
