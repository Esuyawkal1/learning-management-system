import api from "@/services/api";
import { extractApiData, getApiErrorMessage } from "@/services/admin/helpers";

export const submitContactRequest = async (payload) => {
  try {
    const response = await api.post("/contact", payload);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to send your message"));
  }
};
