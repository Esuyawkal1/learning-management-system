"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, PlayCircle } from "@/components/common/icons";
import CourseLikeControl from "@/components/courses/CourseLikeControl";
import CourseThumbnailPreview from "@/components/courses/CourseThumbnailPreview";
import useAuthStore from "@/store/auth.store";
import { buildLoginPath, getCourseCheckoutPath, getCoursePriceLabel, isStudentUser } from "@/utils/courseEnrollment";

export default function CourseCard({ course, onPreview, isEnrolled = false }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const thumbnailSrc = course.thumbnailUrl || course.thumbnail || "";
  const priceLabel = getCoursePriceLabel(course.price);
  const canEnrollAsStudent = isStudentUser(user);
  const checkoutPath = getCourseCheckoutPath(course._id);
  const openPreview = (target) => {
    onPreview(course, target);
  };

  const handlePrimaryAction = (target) => {
    if (isEnrolled) {
      router.push(checkoutPath);
      return;
    }

    if (!user) {
      router.push(buildLoginPath(checkoutPath));
      return;
    }

    if (!canEnrollAsStudent) {
      openPreview(target);
      return;
    }

    router.push(checkoutPath);
  };

  const primaryLabel = isEnrolled
    ? "Continue learning"
    : !user
      ? "Login to enroll"
      : canEnrollAsStudent
        ? course.price > 0
          ? `Enroll for ${priceLabel}`
          : "Enroll for free"
        : "Preview details";

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <button
          type="button"
          onClick={(event) => openPreview(event.currentTarget.closest("article") || event.currentTarget)}
          className="block h-full w-full text-left"
        >
          <CourseThumbnailPreview
            src={thumbnailSrc}
            alt={course.title}
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </button>

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            {course.category || "General"}
          </span>
          {course.previewLesson ? (
            <span className="rounded-full bg-slate-900/85 px-3 py-1 text-xs font-semibold text-white">
              Preview Available
            </span>
          ) : null}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-transparent p-4 opacity-0 transition duration-300 group-hover:opacity-100">
          <div className="pointer-events-auto flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={(event) => handlePrimaryAction(event.currentTarget.closest("article") || event.currentTarget)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <ArrowRight className="h-4 w-4" />
              {primaryLabel}
            </button>
            <button
              type="button"
              onClick={(event) => openPreview(event.currentTarget.closest("article") || event.currentTarget)}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <PlayCircle className="h-4 w-4" />
              Preview
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-slate-900">{course.title}</h3>
          </div>
          <CourseLikeControl
            likesCount={course.likesCount}
            isLiked={course.isLiked}
            className="shrink-0"
          />
        </div>

        <div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{course.description}</p>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <div>
            <p className="font-semibold text-slate-700">{course.instructor?.name || "Expert Instructor"}</p>
            <p className="mt-1">Instructor</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-900">{isEnrolled ? "Enrolled" : priceLabel}</p>
            <p className="mt-1">{isEnrolled ? "Access" : "Price"}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
          <p>{course.studentsEnrolled || 0} students</p>
          <button
            type="button"
            onClick={(event) => handlePrimaryAction(event.currentTarget.closest("article") || event.currentTarget)}
            className="font-semibold text-slate-900 transition hover:text-amber-600"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
