"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CourseForm from "@/components/admin/courses/CourseForm";
import ErrorMessage from "@/components/common/ErrorMessage";
import StickyFormPageShell from "@/components/common/StickyFormPageShell";
import { createCourse } from "@/services/admin/course.service";
import { notify } from "@/store/notification.store";

const FORM_ID = "admin-create-course-form";

export default function AdminCreateCoursePage() {
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

    router.push("/admin/courses");
  };

  const handleSubmit = async (payload) => {
    try {
      setIsSubmitting(true);
      setSubmitError("");
      await createCourse(payload);
      notify({
        type: "success",
        title: "Course created",
        message: "A new course has been added to the catalog.",
      });
      router.push("/admin/courses");
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
      { label: "Admin", href: "/admin/dashboard" },
      { label: "Courses", href: "/admin/courses" },
      { label: "Create course" },
    ],
    []
  );

  return (
    <StickyFormPageShell
      title="Create Course"
      description="Set up a new course in a focused workspace with the actions always within reach."
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
          <ErrorMessage
            title={"We couldn't create the course"}
            message={submitError}
          />
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Course setup</p>
            <p className="text-sm text-slate-500">
              Define the title, category, pricing, description, and student visibility without the page controls drifting out of view.
            </p>
          </div>

          <CourseForm
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
