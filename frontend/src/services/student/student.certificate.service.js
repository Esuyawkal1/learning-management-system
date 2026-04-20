import api from "@/services/api";
import { extractApiData, getApiErrorMessage } from "@/services/admin/helpers";

export const getStudentCertificates = async () => {
  try {
    const response = await api.get("/student/certificates");
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load certificates"));
  }
};
