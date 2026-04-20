import api from "@/services/api";
import { extractApiData, getApiErrorMessage } from "@/services/admin/helpers";

const assertCourseId = (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }
};

export const getStudentDashboard = async () => {
  try {
    const response = await api.get("/student/dashboard");
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load dashboard"));
  }
};

export const getStudentCourses = async () => {
  try {
    const response = await api.get("/student/courses");
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load your courses"));
  }
};

export const getStudentCourseById = async (courseId) => {
  assertCourseId(courseId);

  try {
    const response = await api.get(`/student/courses/${courseId}`);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load course workspace"));
  }
};

export const toggleStudentCourseLike = async (courseId) => {
  assertCourseId(courseId);

  try {
    const response = await api.post(`/student/courses/${courseId}/like`);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to update course like"));
  }
};
