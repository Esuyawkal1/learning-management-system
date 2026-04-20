import api from "./api";
import { extractApiData, getApiErrorMessage } from "@/services/admin/helpers";

const assertCourseId = (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }
};

export const getMyCourses = async () => {
  try {
    const response = await api.get("/enrollments/my-courses");
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load your enrollments"));
  }
};

export const enrollCourse = async (courseId) => {
  assertCourseId(courseId);

  try {
    const response = await api.post("/enrollments", { courseId });
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to enroll in this course"));
  }
};
