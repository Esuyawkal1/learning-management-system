import api from "../api";
import { extractApiData, getApiErrorMessage } from "./helpers";

/**
 * Get all courses (Admin)
 */
export const getAdminCourses = async () => {
  try {
    const response = await api.get("/admin/courses");
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch courses"));
  }
};

/**
 * Create new course
 */
export const createCourse = async (courseData) => {
  try {
    const response = await api.post("/admin/courses", courseData);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to create course"));
  }
};

/**
 * Update course
 */
export const updateCourse = async (courseId, courseData) => {
  try {
    const response = await api.put(`/admin/courses/${courseId}`, courseData);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to update course"));
  }
};

/**
 * Delete course
 */
export const deleteCourse = async (courseId) => {
  try {
    const response = await api.delete(`/admin/courses/${courseId}`);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to delete course"));
  }
};
