"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LessonForm from "@/components/instructor/lessons/LessonForm";
import ErrorMessage from "@/components/common/ErrorMessage";
import Loader from "@/components/common/Loader";
import StickyFormPageShell from "@/components/common/StickyFormPageShell";
import { getInstructorCourses } from "@/services/instructor/instructor.course.service";
import { createInstructorLesson } from "@/services/instructor/instructor.lesson.service";
import { notify } from "@/store/notification.store";

const FORM_ID = "instructor-create-lesson-form";

export default function InstructorCreateLessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId;
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const response = await getInstructorCourses();
        setCourses(response || []);
        setError("");
      } catch (requestError) {
        setError(requestError.message || "Failed to load your courses.");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
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

  const activeCourse = useMemo(
    () => courses.find((course) => course._id === courseId),
    [courseId, courses]
  );

  const closeWorkspace = () => {
    if (isDirty && !isSubmitting) {
      const shouldLeave = window.confirm("You have unsaved lesson changes. Leave this page?");

      if (!shouldLeave) {
        return;
      }
    }

    router.push("/instructor/lessons");
  };

  const handleSubmit = async (payload) => {
    try {
      setIsSubmitting(true);
      setSubmitError("");
      await createInstructorLesson(payload);
      notify({
        type: "success",
        title: "Lesson created",
        message: "The lesson was added to your course.",
      });
      router.push(`/instructor/lessons?course=${courseId}`);
    } catch (requestError) {
      const message = requestError.message || "Failed to create lesson.";
      setSubmitError(message);
      notify({
        type: "error",
        title: "Unable to create lesson",
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
      { label: "Create lesson" },
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

  if (!activeCourse) {
    return (
      <ErrorMessage
        title="Course not found"
        message="This course is unavailable or you no longer have access to manage it."
        actionLabel="Back to lessons"
        onAction={() => router.push("/instructor/lessons")}
      />
    );
  }

  return (
    <StickyFormPageShell
      title="Create Lesson"
      description={`Add a new lesson to ${activeCourse.title} with always-visible controls and a focused teaching workspace.`}
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
            {isSubmitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
            {isSubmitting ? "Creating..." : "Create Lesson"}
          </button>
        </div>
      }
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {submitError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
            <p className="font-semibold">We couldn&apos;t create the lesson.</p>
            <p className="mt-1">{submitError}</p>
          </div>
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-500">Course lesson builder</p>
            <p className="text-sm text-slate-500">
              You&apos;re creating a lesson inside <span className="font-semibold text-slate-700">{activeCourse.title}</span>. Add a strong summary, upload assets, and set the learning order from one focused view.
            </p>
          </div>

          <LessonForm
            formId={FORM_ID}
            lesson={null}
            courses={courses}
            onSubmit={handleSubmit}
            onCancel={closeWorkspace}
            isSubmitting={isSubmitting}
            showActions={false}
            defaultCourseId={courseId}
            onDirtyChange={setIsDirty}
          />
        </div>
      </div>
    </StickyFormPageShell>
  );
}
