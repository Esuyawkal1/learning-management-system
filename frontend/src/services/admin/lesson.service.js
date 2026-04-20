import api from "../api";
import { extractApiData, getApiErrorMessage } from "./helpers";

export const getAdminLessons = async (params = {}) => {
  try {
    const response = await api.get("/admin/lessons", {
      params,
    });
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch lessons"));
  }
};

export const createAdminLesson = async (lessonData) => {
  try {
    const response = await api.post("/admin/lessons", lessonData);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to create lesson"));
  }
};

export const updateAdminLesson = async (lessonId, lessonData) => {
  try {
    const response = await api.put(`/admin/lessons/${lessonId}`, lessonData);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to update lesson"));
  }
};

export const deleteAdminLesson = async (lessonId) => {
  try {
    const response = await api.delete(`/admin/lessons/${lessonId}`);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to delete lesson"));
  }
};
