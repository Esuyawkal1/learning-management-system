import api from "../api";
import { extractApiData, getApiErrorMessage } from "./helpers";

export const getEnrollmentsStats = async () => {
  try {
    const response = await api.get("/admin/enrollments/stats");
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch enrollment stats"));
  }
};

export const getAdminEnrollments = async (params = {}) => {
  try {
    const response = await api.get("/admin/enrollments", {
      params,
    });
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch enrollments"));
  }
};

export const deleteAdminEnrollment = async (enrollmentId) => {
  try {
    const response = await api.delete(`/admin/enrollments/${enrollmentId}`);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to delete enrollment"));
  }
};
