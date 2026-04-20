import api from "@/services/api";
import { extractApiData, getApiErrorMessage } from "@/services/admin/helpers";

export const getInstructorLessons = async () => {
  try {
    const response = await api.get("/instructor/lessons");
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch lessons"));
  }
};

export const createInstructorLesson = async (lessonData) => {
  try {
    const response = await api.post("/instructor/lessons", lessonData);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to create lesson"));
  }
};

export const updateInstructorLesson = async (lessonId, lessonData) => {
  try {
    const response = await api.put(`/instructor/lessons/${lessonId}`, lessonData);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to update lesson"));
  }
};

export const deleteInstructorLesson = async (lessonId) => {
  try {
    const response = await api.delete(`/instructor/lessons/${lessonId}`);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to delete lesson"));
  }
};

export const reorderInstructorLessons = async (courseId, lessonIds) => {
  try {
    const response = await api.patch(`/instructor/courses/${courseId}/reorder-lessons`, {
      lessonIds,
    });
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to reorder lessons"));
  }
};
