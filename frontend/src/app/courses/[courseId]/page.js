"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import Footer from "@/components/landing/Footer";
import { Lock, PlayCircle } from "@/components/common/icons";
import { getCourseById } from "@/services/course.service";
import { getStudentLearningPath } from "@/services/student/student.learning.service";
import useAuthStore from "@/store/auth.store";
import { getRedirectPathForRole } from "@/utils/auth";
import { buildLoginPath, getCourseCheckoutPath, getCoursePriceLabel, isStudentUser } from "@/utils/courseEnrollment";

const isDirectVideoUrl = (url = "") => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

function CoursePageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-48 animate-pulse rounded-[2rem] bg-slate-200" />
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_300px]">
        <div className="h-[720px] animate-pulse rounded-[2rem] bg-slate-200" />
        <div className="h-[720px] animate-pulse rounded-[2rem] bg-slate-200" />
        <div className="h-[720px] animate-pulse rounded-[2rem] bg-slate-200" />
      </div>
    </div>
  );
}

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const courseId = params?.courseId || "";
  const [course, setCourse] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) {
        setCourse(null);
        setError("We could not determine which course to open.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getCourseById(courseId);
        setCourse(response);
        setSelectedLessonId(response?.lessons?.[0]?._id || "");
        setError("");
      } catch (requestError) {
        setCourse(null);
        setError(requestError.message || "Failed to load this course.");
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId, retryKey]);

  const lessons = course?.lessons || [];
  const selectedLesson = lessons.find((lesson) => lesson._id === selectedLessonId) || lessons[0] || null;
  const access = course?.access || {};
  const hasFullAccess = Boolean(access.hasFullAccess);
  const lockedLessonCount = access.lockedLessonCount || 0;
  const isStudent = isStudentUser(user);
  const checkoutPath = getCourseCheckoutPath(courseId);
  const priceLabel = getCoursePriceLabel(course?.price);

  const handlePrimaryAction = () => {
    if (!user) {
      router.push(buildLoginPath(checkoutPath));
      return;
    }

    if (!isStudent) {
      router.push(getRedirectPathForRole(user));
      return;
    }

    router.push(checkoutPath);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50/70">
        <div className="flex-1">
          <CoursePageSkeleton />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50/70">
        <div className="mx-auto flex-1 max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <ErrorMessage title="Course unavailable" message={error} actionLabel="Retry" onAction={() => setRetryKey((current) => current + 1)} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50/70">
        <div className="mx-auto flex-1 max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <EmptyState title="Course not found" description="This course may have been removed or is no longer published." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/70">
      <div className="mx-auto flex-1 max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-500">{course.category || "Course"}</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-950">{course.title}</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">{course.description}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
                <span className="rounded-full bg-slate-100 px-4 py-2">Instructor: {course.instructor?.name || "Instructor"}</span>
                <span className="rounded-full bg-slate-100 px-4 py-2">{access.totalPublishedLessons || 0} lessons</span>
                {hasFullAccess ? (
                  <span className="rounded-full bg-emerald-50 px-4 py-2 text-emerald-700">Full access unlocked</span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-4 py-2 text-amber-700">Preview mode</span>
                )}
              </div>
            </div>

            <div className="w-full max-w-sm rounded-[2rem] bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">
                {hasFullAccess
                  ? "You have full access to every published lesson."
                  : `Preview lessons are unlocked. ${course?.price > 0 ? `${priceLabel} unlocks the full learning path.` : "Free enrollment unlocks the full learning path."}`}
              </p>
              {!hasFullAccess ? (
                <div className="mt-4 rounded-3xl border border-amber-100 bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Course Price</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{priceLabel}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {!user
                      ? "Login with a student account to continue to the Chapa demo checkout."
                      : isStudent
                        ? "Continue to the Chapa demo checkout to confirm your enrollment."
                        : "Only student accounts can enroll in this course."}
                  </p>
                </div>
              ) : null}
              <div className="mt-5 flex flex-col gap-3">
                {hasFullAccess ? (
                  <Link
                    href={getStudentLearningPath(course._id)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Start Learning
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handlePrimaryAction}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <PlayCircle className="h-4 w-4" />
                    {!user
                      ? "Login To Enroll"
                      : isStudent
                        ? course?.price > 0
                          ? `Continue To Pay ${priceLabel}`
                          : "Complete Free Enrollment"
                        : "Student Account Required"}
                  </button>
                )}
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Browse More Courses
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_300px]">
        <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">Curriculum</h2>
            <p className="mt-1 text-sm text-slate-500">Preview-ready lessons appear below.</p>
          </div>

          {!hasFullAccess && lockedLessonCount ? (
            <div className="mt-4 rounded-3xl border border-amber-100 bg-amber-50 px-4 py-4">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-4 w-4 text-amber-700" />
                <div>
                  <p className="font-semibold text-amber-900">Enroll to access full course</p>
                  <p className="mt-1 text-sm text-amber-800">
                    {lockedLessonCount} more lesson{lockedLessonCount > 1 ? "s are" : " is"} locked until you enroll.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-4 space-y-2">
            {lessons.map((lesson) => {
              const isSelected = lesson._id === selectedLesson?._id;

              return (
                <button
                  key={lesson._id}
                  type="button"
                  onClick={() => setSelectedLessonId(lesson._id)}
                  className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-100 bg-slate-50/70 text-slate-700 hover:border-amber-200 hover:bg-amber-50/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{lesson.title}</p>
                    {lesson.isPreview && !hasFullAccess ? (
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${isSelected ? "bg-white/10 text-white" : "bg-emerald-50 text-emerald-700"}`}>
                        Preview
                      </span>
                    ) : null}
                  </div>
                  <p className={`mt-2 text-xs ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                    Lesson {lesson.order || 0}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          {selectedLesson ? (
            <>
              <div className="border-b border-slate-100 pb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-500">
                  {hasFullAccess ? "Lesson Experience" : "Preview Lesson"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{selectedLesson.title}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  {hasFullAccess
                    ? "You can move through the full lesson content from here."
                    : "This preview shows the lesson media and a limited content sample."}
                </p>
              </div>

              <div className="mt-6 space-y-6">
                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950">
                  {selectedLesson.videoUrl ? (
                    isDirectVideoUrl(selectedLesson.videoUrl) ? (
                      <video className="aspect-video w-full" controls src={selectedLesson.videoUrl} />
                    ) : (
                      <iframe
                        className="aspect-video w-full"
                        src={selectedLesson.videoUrl}
                        title={selectedLesson.title}
                        allowFullScreen
                      />
                    )
                  ) : (
                    <div className="flex aspect-video items-center justify-center px-8 text-center text-white/80">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Lesson Media</p>
                        <p className="mt-4 text-xl font-semibold">Video preview is not available for this lesson yet.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-[2rem] border border-slate-100 bg-slate-50/80 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">Lesson Description</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {selectedLesson.content || "This lesson does not have additional notes available yet."}
                  </p>
                </div>

                {!hasFullAccess ? (
                  <div className="rounded-[2rem] border border-amber-100 bg-amber-50 p-5">
                    <div className="flex items-start gap-3">
                      <Lock className="mt-1 h-5 w-5 text-amber-700" />
                      <div>
                        <h3 className="font-semibold text-amber-900">Enroll to access full course</h3>
                        <p className="mt-2 text-sm leading-6 text-amber-800">
                          Preview lessons are open to guests and non-enrolled learners. Enroll to unlock the rest of the curriculum, downloads, and student workspace progress tracking.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <EmptyState title="No lessons available" description="This course does not have published lessons yet." />
          )}
        </section>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Instructor</h2>
            <div className="mt-4 rounded-3xl bg-slate-50 px-4 py-4">
              <p className="font-semibold text-slate-900">{course.instructor?.name || "Instructor"}</p>
              <p className="mt-2 text-sm text-slate-500">{course.instructor?.email || "Contact details unavailable."}</p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Access Summary</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Available Now</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">{access.accessibleLessonCount || lessons.length} lessons</p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Locked Until Enrollment</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">{lockedLessonCount}</p>
              </div>
              <div className="rounded-3xl bg-emerald-50 px-4 py-4 text-emerald-700">
                <p className="text-xs uppercase tracking-[0.2em]">Enrollment Status</p>
                <p className="mt-3 text-sm font-semibold">
                  {hasFullAccess ? "You are enrolled and can access the complete course." : "Preview access only until you enroll."}
                </p>
              </div>
            </div>
          </section>
        </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
