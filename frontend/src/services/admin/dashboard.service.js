import api from "../api";
import { extractApiData, getApiErrorMessage } from "./helpers";

export const getDashboardStats = async () => {
  try {
    const response = await api.get("/admin/dashboard");
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load dashboard statistics"));
  }
};
