import api from "@/services/api";
import { extractApiData, getApiErrorMessage } from "@/services/admin/helpers";

export const getStudentMessages = async () => {
  try {
    const response = await api.get("/student/messages");
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load messages"));
  }
};

export const sendStudentMessage = async (payload) => {
  try {
    const response = await api.post("/student/messages", payload);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to send message"));
  }
};
