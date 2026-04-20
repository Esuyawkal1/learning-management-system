import api from "./api";
import { extractApiData, getApiErrorMessage } from "@/services/admin/helpers";

const assertCourseId = (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }
};

export const getLessonsByCourse = async (courseId) => {
  assertCourseId(courseId);

  try {
    const response = await api.get(`/courses/${courseId}/lessons`);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load course lessons"));
  }
};
