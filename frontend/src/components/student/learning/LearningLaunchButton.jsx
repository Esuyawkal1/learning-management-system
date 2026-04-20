"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getLastLesson, getStudentLearningPath } from "@/services/student/student.learning.service";
import { notify } from "@/store/notification.store";

export default function LearningLaunchButton({
  courseId,
  mode = "resume",
  className = "",
  children,
  icon: Icon,
  disabled = false,
  fallbackLessonId = "",
  onBeforeNavigate,
  loadingLabel,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!courseId || disabled || loading) {
      return;
    }

    try {
      setLoading(true);
      let lessonId = fallbackLessonId;

      // Resume actions fetch the last opened lesson before routing so students
      // land on the right lesson without a full page reload.
      if (mode === "resume") {
        const response = await getLastLesson(courseId);
        lessonId = response?.lessonId || fallbackLessonId || "";
      }

      onBeforeNavigate?.();
      router.push(getStudentLearningPath(courseId, lessonId));
    } catch (error) {
      notify({
        type: "error",
        title: "Unable to open learning page",
        message: error.message || "Please try again in a moment.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={handleClick}
      className={className}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {loading ? loadingLabel || "Opening..." : children}
    </button>
  );
}
