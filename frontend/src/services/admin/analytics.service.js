import api from "../api";
import { extractApiData, getApiErrorMessage } from "./helpers";

export const getAdminAnalytics = async () => {
  try {
    const response = await api.get("/admin/analytics");
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load admin analytics"));
  }
};
