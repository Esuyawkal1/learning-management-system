"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ErrorMessage from "@/components/common/ErrorMessage";
import Loader from "@/components/common/Loader";
import StickyFormPageShell from "@/components/common/StickyFormPageShell";
import InstructorCourseForm from "@/components/instructor/courses/InstructorCourseForm";
import {
  getInstructorCourses,
  updateInstructorCourse,
} from "@/services/instructor/instructor.course.service";
import { notify } from "@/store/notification.store";

const FORM_ID = "instructor-edit-course-form";

export default function InstructorEditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId;
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

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
      await updateInstructorCourse(courseId, payload);
      notify({
        type: "success",
        title: "Course updated",
        message: "Your course changes were saved.",
      });
      router.push("/instructor/courses");
    } catch (requestError) {
      const message = requestError.message || "Failed to update the course.";
      setSubmitError(message);
      notify({
        type: "error",
        title: "Unable to update course",
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
      { label: activeCourse?.title || "Selected course" },
      { label: "Edit course" },
    ],
    [activeCourse?.title]
  );

  if (loading) {
    return <Loader label="Loading course workspace..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Course workspace unavailable"
        message={error}
        actionLabel="Back to courses"
        onAction={() => router.push("/instructor/courses")}
      />
    );
  }

  if (!activeCourse) {
    return (
      <ErrorMessage
        title="Course not found"
        message="This course is unavailable or you no longer have access to manage it."
        actionLabel="Back to courses"
        onAction={() => router.push("/instructor/courses")}
      />
    );
  }

  return (
    <StickyFormPageShell
      title="Edit Course"
      description={`Update ${activeCourse.title} in the same focused workspace used for course creation.`}
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
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : null}
            {isSubmitting ? "Updating..." : "Update Course"}
          </button>
        </div>
      }
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {submitError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
            <p className="font-semibold">We couldn&apos;t update the course.</p>
            <p className="mt-1">{submitError}</p>
          </div>
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-500">
              Course setup
            </p>
            <p className="text-sm text-slate-500">
              Refine the title, category, pricing, thumbnail, and course documents from one focused
              editing workspace.
            </p>
          </div>

          <InstructorCourseForm
            formId={FORM_ID}
            course={activeCourse}
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
