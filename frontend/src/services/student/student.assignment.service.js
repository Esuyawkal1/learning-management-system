import api from "@/services/api";
import { extractApiData, getApiErrorMessage } from "@/services/admin/helpers";

export const getStudentAssignments = async () => {
  try {
    const response = await api.get("/student/assignments");
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load assignments"));
  }
};

export const submitStudentAssignment = async (payload) => {
  try {
    const response = await api.post("/student/submit-assignment", payload);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to submit assignment"));
  }
};
