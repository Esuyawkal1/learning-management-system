import api from "@/services/api";
import { extractApiData, getApiErrorMessage } from "@/services/admin/helpers";

export const getStudentProfile = async () => {
  try {
    const response = await api.get("/student/profile");
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load profile"));
  }
};

export const updateStudentProfile = async (payload) => {
  try {
    const response = await api.put("/student/profile", payload);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to update profile"));
  }
};
