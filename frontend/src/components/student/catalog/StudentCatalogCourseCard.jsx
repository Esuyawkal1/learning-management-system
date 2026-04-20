"use client";

import { ArrowRight, PlayCircle } from "@/components/common/icons";
import CourseLikeControl from "@/components/courses/CourseLikeControl";
import CourseThumbnailPreview from "@/components/courses/CourseThumbnailPreview";
import LearningLaunchButton from "@/components/student/learning/LearningLaunchButton";
import useAuthStore from "@/store/auth.store";
import { getCoursePriceLabel } from "@/utils/courseEnrollment";

export default function StudentCatalogCourseCard({
  course,
  isEnrolled,
  onEnroll,
  onPreview,
}) {
  const user = useAuthStore((state) => state.user);
  const thumbnailSrc = course.thumbnailUrl || course.thumbnail || "";
  const priceLabel = getCoursePriceLabel(course.price);
  const primaryLabel = isEnrolled
    ? "Continue learning"
    : !user
      ? "Login to enroll"
      : course.price > 0
        ? `Enroll for ${priceLabel}`
        : "Enroll for free";
  const openPreview = (target) => {
    onPreview(course, target);
  };
  const thumbnailContent = (
    <div className="group/preview relative mb-5 overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-100">
      <div className="relative aspect-[16/10]">
        <CourseThumbnailPreview src={thumbnailSrc} alt={course.title} />
      </div>
      {!isEnrolled ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent p-4 opacity-0 transition duration-300 group-hover/preview:opacity-100">
          <div className="pointer-events-auto flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onEnroll(course)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <ArrowRight className="h-4 w-4" />
              {primaryLabel}
            </button>
            <button
              type="button"
              onClick={(event) => openPreview(event.currentTarget.closest("article") || event.currentTarget)}
              disabled={!course.previewLesson}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PlayCircle className="h-4 w-4" />
              Preview
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <article className="flex h-full flex-col rounded-[2rem] border border-sky-100 bg-white p-5 shadow-sm">
      {isEnrolled ? (
        <LearningLaunchButton
          courseId={course._id}
          mode="resume"
          className="block w-full cursor-pointer rounded-[1.5rem] text-left transition hover:opacity-95"
          loadingLabel="Opening..."
        >
          {thumbnailContent}
        </LearningLaunchButton>
      ) : (
        thumbnailContent
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
            {course.category || "General"}
          </span>
          <h3 className="mt-4 text-xl font-semibold text-slate-900">{course.title}</h3>
          <p className="mt-2 text-sm text-slate-500">Instructor: {course.instructor?.name || "Instructor"}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          {isEnrolled ? "Enrolled" : priceLabel}
        </div>
      </div>

      <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600">{course.description}</p>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
        <CourseLikeControl
          likesCount={course.likesCount}
          isLiked={course.isLiked}
          className="w-fit shrink-0"
        />

        <div className="flex flex-wrap items-center justify-end gap-3">
          {!isEnrolled ? (
            <button
              type="button"
              onClick={(event) => openPreview(event.currentTarget.closest("article") || event.currentTarget)}
              disabled={!course.previewLesson}
              className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PlayCircle className="h-4 w-4" />
              Preview
            </button>
          ) : null}

          {isEnrolled ? (
            <LearningLaunchButton
              courseId={course._id}
              mode="resume"
              icon={PlayCircle}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              loadingLabel="Opening..."
            >
              Continue
            </LearningLaunchButton>
          ) : (
            <button
              type="button"
              onClick={() => onEnroll(course)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {primaryLabel}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
