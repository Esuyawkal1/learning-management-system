"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import InstructorCourseForm from "@/components/instructor/courses/InstructorCourseForm";
import StickyFormPageShell from "@/components/common/StickyFormPageShell";
import { createInstructorCourse } from "@/services/instructor/instructor.course.service";
import { notify } from "@/store/notification.store";

const FORM_ID = "instructor-create-course-form";

export default function InstructorCreateCoursePage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

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
      const shouldLeave = window.confirm("You have unsaved course changes. Leave this page?");

      if (!shouldLeave) {
        return;
      }
    }

    router.push("/instructor/courses");
  };

  const handleSubmit = async (payload) => {
    try {
      setIsSubmitting(true);
      setSubmitError("");
      await createInstructorCourse(payload);
      notify({
        type: "success",
        title: "Course created",
        message: "A new course has been added to your catalog.",
      });
      router.push("/instructor/courses");
    } catch (requestError) {
      const message = requestError.message || "Failed to create course.";
      setSubmitError(message);
      notify({
        type: "error",
        title: "Unable to create course",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = useMemo(
    () => [
      { label: "Instructor", href: "/instructor/dashboard" },
      { label: "Courses", href: "/instructor/courses" },
      { label: "Create course" },
    ],
    []
  );

  return (
    <StickyFormPageShell
      title="Create Course"
      description="Build a new course in a distraction-free workspace with a scrollable body and sticky actions."
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
            disabled={isSubmitting || !isFormValid}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
            {isSubmitting ? "Creating..." : "Create Course"}
          </button>
        </div>
      }
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {submitError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
            <p className="font-semibold">We couldn&apos;t create the course.</p>
            <p className="mt-1">{submitError}</p>
          </div>
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-500">Course setup</p>
            <p className="text-sm text-slate-500">
              Shape the title, category, pricing, and learning materials while admins handle student-facing publication.
            </p>
          </div>

          <InstructorCourseForm
            formId={FORM_ID}
            onSubmit={handleSubmit}
            onCancel={closeWorkspace}
            isSubmitting={isSubmitting}
            showActions={false}
            onDirtyChange={setIsDirty}
            onValidityChange={setIsFormValid}
          />
        </div>
      </div>
    </StickyFormPageShell>
  );
}
