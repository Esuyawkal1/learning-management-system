"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LessonForm from "@/components/admin/lessons/LessonForm";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import Loader from "@/components/common/Loader";
import StickyFormPageShell from "@/components/common/StickyFormPageShell";
import { getAdminCourses } from "@/services/admin/course.service";
import { createAdminLesson } from "@/services/admin/lesson.service";
import { notify } from "@/store/notification.store";

const FORM_ID = "admin-create-lesson-form";

export default function AdminCreateLessonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const preferredCourseId = searchParams.get("course") || "";

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const response = await getAdminCourses();
        setCourses(response || []);
        setError("");
      } catch (requestError) {
        setError(requestError.message || "Failed to load courses.");
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

  const closeWorkspace = () => {
    if (isDirty && !isSubmitting) {
      const shouldLeave = window.confirm("You have unsaved lesson changes. Leave this page?");

      if (!shouldLeave) {
        return;
      }
    }

    router.push("/admin/lessons");
  };

  const handleSubmit = async (payload) => {
    try {
      setIsSubmitting(true);
      setSubmitError("");
      await createAdminLesson(payload);
      notify({
        type: "success",
        title: "Lesson created",
        message: "The lesson was added to the selected course.",
      });
      router.push("/admin/lessons");
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
      { label: "Admin", href: "/admin/dashboard" },
      { label: "Lessons", href: "/admin/lessons" },
      { label: "Create lesson" },
    ],
    []
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
        onAction={() => router.push("/admin/lessons")}
      />
    );
  }

  return (
    <StickyFormPageShell
      title="Create Lesson"
      description="Build a lesson with a focused editor, keep actions visible, and publish to the right course."
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
            disabled={isSubmitting || !courses.length}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
            {isSubmitting ? "Creating..." : "Create Lesson"}
          </button>
        </div>
      }
    >
      {!courses.length ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <EmptyState
            title="Create a course first"
            description="Lessons need a course assignment before they can be created."
            actionLabel="Go to courses"
            onAction={() => router.push("/admin/courses")}
          />
        </div>
      ) : (
        <div className="mx-auto max-w-5xl space-y-6">
          {submitError ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
              <p className="font-semibold">We couldn&apos;t create the lesson.</p>
              <p className="mt-1">{submitError}</p>
            </div>
          ) : null}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Lesson setup</p>
              <p className="text-sm text-slate-500">
                Add the lesson title, summary, media links, and visibility settings without losing sight of your actions.
              </p>
            </div>

            <LessonForm
              formId={FORM_ID}
              courses={courses}
              onSubmit={handleSubmit}
              onCancel={closeWorkspace}
              isSubmitting={isSubmitting}
              showActions={false}
              defaultCourseId={preferredCourseId}
              onDirtyChange={setIsDirty}
            />
          </div>
        </div>
      )}
    </StickyFormPageShell>
  );
}
