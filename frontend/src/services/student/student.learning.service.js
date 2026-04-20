import api from "@/services/api";
import { extractApiData, getApiErrorMessage } from "@/services/admin/helpers";

const assertCourseId = (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }
};

const assertLessonId = (lessonId) => {
  if (!lessonId) {
    throw new Error("Lesson ID is required");
  }
};

export const getStudentLearningPath = (courseId, lessonId = "") => {
  assertCourseId(courseId);

  if (!lessonId) {
    return `/student/course/${courseId}/learn`;
  }

  return `/student/course/${courseId}/learn?lessonId=${encodeURIComponent(lessonId)}`;
};

export const getCourseLessons = async (courseId) => {
  assertCourseId(courseId);

  try {
    const response = await api.get(`/student/course/${courseId}/lessons`);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load course lessons"));
  }
};

export const saveLessonProgress = async ({
  courseId,
  lessonId,
  completed,
  secondsSpent,
  durationSeconds,
}) => {
  assertCourseId(courseId);
  assertLessonId(lessonId);

  const payload = {
    courseId,
    lessonId,
  };

  if (typeof completed === "boolean") {
    payload.completed = completed;
  }

  if (Number.isFinite(Number(secondsSpent)) && Number(secondsSpent) > 0) {
    payload.secondsSpent = Number(Number(secondsSpent).toFixed(2));
  }

  if (Number.isFinite(Number(durationSeconds)) && Number(durationSeconds) > 0) {
    payload.durationSeconds = Math.round(Number(durationSeconds));
  }

  try {
    const response = await api.post("/student/progress", payload);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to save lesson progress"));
  }
};

export const getLastLesson = async (courseId) => {
  assertCourseId(courseId);

  try {
    const response = await api.get(`/student/course/${courseId}/last-lesson`);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load the last lesson"));
  }
};
