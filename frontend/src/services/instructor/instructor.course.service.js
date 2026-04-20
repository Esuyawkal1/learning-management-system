import api from "@/services/api";
import { extractApiData, getApiErrorMessage } from "@/services/admin/helpers";

export const getInstructorCourses = async () => {
  try {
    const response = await api.get("/instructor/courses");
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch instructor courses"));
  }
};

export const createInstructorCourse = async (courseData) => {
  try {
    const response = await api.post("/instructor/courses", courseData);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to create course"));
  }
};

export const updateInstructorCourse = async (courseId, courseData) => {
  try {
    const response = await api.put(`/instructor/courses/${courseId}`, courseData);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to update course"));
  }
};

export const deleteInstructorCourse = async (courseId) => {
  try {
    const response = await api.delete(`/instructor/courses/${courseId}`);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to delete course"));
  }
};
