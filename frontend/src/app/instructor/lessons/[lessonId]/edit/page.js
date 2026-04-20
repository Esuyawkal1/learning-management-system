"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ErrorMessage from "@/components/common/ErrorMessage";
import Loader from "@/components/common/Loader";
import StickyFormPageShell from "@/components/common/StickyFormPageShell";
import LessonForm from "@/components/instructor/lessons/LessonForm";
import { getInstructorCourses } from "@/services/instructor/instructor.course.service";
import {
  getInstructorLessons,
  updateInstructorLesson,
} from "@/services/instructor/instructor.lesson.service";
import { notify } from "@/store/notification.store";

const FORM_ID = "instructor-edit-lesson-form";

export default function InstructorEditLessonPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonId = params?.lessonId;
  const requestedCourseId = searchParams.get("course") || "";
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        setLoading(true);
        const [coursesResponse, lessonsResponse] = await Promise.all([
          getInstructorCourses(),
          getInstructorLessons(),
        ]);
        setCourses(coursesResponse || []);
        setLessons(lessonsResponse || []);
        setError("");
      } catch (requestError) {
        setError(requestError.message || "Failed to load the lesson workspace.");
      } finally {
        setLoading(false);
      }
    };

    loadWorkspace();
  }, []);

  useEffect(() => {
    if (!isDirty || isSubmitting) {
      return undefined;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, isSubmitting]);

  const activeLesson = useMemo(
    () => lessons.find((lesson) => lesson._id === lessonId),
    [lessonId, lessons]
  );
  const activeCourseId =
    requestedCourseId || activeLesson?.course?._id || activeLesson?.course || "";
  const activeCourse = useMemo(
    () =>
      courses.find((course) => course._id === activeCourseId) ||
      courses.find((course) => course._id === (activeLesson?.course?._id || activeLesson?.course)),
    [activeCourseId, activeLesson?.course, courses]
  );
  const returnHref = activeCourse?._id
    ? `/instructor/lessons?course=${encodeURIComponent(activeCourse._id)}`
    : "/instructor/lessons";

  const closeWorkspace = () => {
    if (isDirty && !isSubmitting) {
      const shouldLeave = window.confirm("You have unsaved lesson changes. Leave this page?");

      if (!shouldLeave) {
        return;
      }
    }

    router.push(returnHref);
  };

  const handleSubmit = async (payload) => {
    try {
      setIsSubmitting(true);
      setSubmitError("");
      await updateInstructorLesson(lessonId, payload);
      notify({
        type: "success",
        title: "Lesson updated",
        message: "Your lesson changes were saved.",
      });
      router.push(returnHref);
    } catch (requestError) {
      const message = requestError.message || "Failed to update the lesson.";
      setSubmitError(message);
      notify({
        type: "error",
        title: "Unable to update lesson",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = useMemo(
    () => [
      { label: "Instructor", href: "/instructor/dashboard" },
      { label: "Lessons", href: "/instructor/lessons" },
      { label: activeCourse?.title || "Selected course" },
      { label: "Edit lesson" },
    ],
    [activeCourse?.title]
  );

  if (loading) {
    return <Loader label="Loading lesson workspace..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Lesson workspace unavailable"
        message={error}
        actionLabel="Back to lessons"
        onAction={() => router.push("/instructor/lessons")}
      />
    );
  }

  if (!activeLesson) {
    return (
      <ErrorMessage
        title="Lesson not found"
        message="This lesson is unavailable or you no longer have access to manage it."
        actionLabel="Back to lessons"
        onAction={() => router.push("/instructor/lessons")}
      />
    );
  }

  return (
    <StickyFormPageShell
      title="Edit Lesson"
      description={`Update ${activeLesson.title} in the same focused workspace used for lesson creation.`}
      breadcrumbs={breadcrumbs}
      onClose={closeWorkspace}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={closeWorkspace}
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={FORM_ID}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : null}
            {isSubmitting ? "Updating..." : "Update Lesson"}
          </button>
        </div>
      }
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {submitError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
            <p className="font-semibold">We couldn&apos;t update the lesson.</p>
            <p className="mt-1">{submitError}</p>
          </div>
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-500">
              Course lesson editor
            </p>
            <p className="text-sm text-slate-500">
              Update the lesson summary, uploaded assets, and delivery order without losing sight
              of the page actions.
            </p>
          </div>

          <LessonForm
            formId={FORM_ID}
            lesson={activeLesson}
            courses={courses}
            onSubmit={handleSubmit}
            onCancel={closeWorkspace}
            isSubmitting={isSubmitting}
            showActions={false}
            onDirtyChange={setIsDirty}
            showVideoUrlField={false}
          />
        </div>
      </div>
    </StickyFormPageShell>
  );
}
