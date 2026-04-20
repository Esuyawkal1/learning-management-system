import api from "./api";
import { extractApiData, getApiErrorMessage } from "@/services/admin/helpers";

const assertCourseId = (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }
};

export const getCourses = async () => {
  try {
    const response = await api.get("/courses");
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load courses"));
  }
};

export const getCourseById = async (courseId) => {
  assertCourseId(courseId);

  try {
    const response = await api.get(`/courses/${courseId}`);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load course"));
  }
};
 
