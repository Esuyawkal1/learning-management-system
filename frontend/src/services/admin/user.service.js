import api from "../api";
import { extractApiData, getApiErrorMessage } from "./helpers";

export const getAdminUsers = async () => {
  try {
    const response = await api.get("/admin/users");
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch users"));
  }
};

export const createAdminUser = async (userData) => {
  try {
    const response = await api.post("/admin/users", userData);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to create user"));
  }
};

export const updateAdminUser = async (userId, userData) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to update user"));
  }
};

export const deleteAdminUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to delete user"));
  }
};
