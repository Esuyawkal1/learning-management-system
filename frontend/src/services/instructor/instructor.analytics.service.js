import api from "@/services/api";
import { extractApiData, getApiErrorMessage } from "@/services/admin/helpers";

export const getInstructorDashboard = async () => {
  try {
    const response = await api.get("/instructor/dashboard");
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load instructor dashboard"));
  }
};

export const getInstructorAnalytics = async () => {
  try {
    const response = await api.get("/instructor/analytics");
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load analytics"));
  }
};

export const getInstructorProfile = async () => {
  try {
    const response = await api.get("/instructor/profile");
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load profile"));
  }
};

export const updateInstructorProfile = async (profileData) => {
  try {
    const response = await api.put("/instructor/profile", profileData);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to update profile"));
  }
};

export const getInstructorMessages = async () => {
  try {
    const response = await api.get("/instructor/messages");
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load messages"));
  }
};

export const sendInstructorMessage = async (payload) => {
  try {
    const response = await api.post("/instructor/messages", payload);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to send message"));
  }
};
