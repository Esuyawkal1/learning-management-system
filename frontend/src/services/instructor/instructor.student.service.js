import api from "@/services/api";
import { extractApiData, getApiErrorMessage } from "@/services/admin/helpers";

export const getInstructorStudents = async (courseId) => {
  try {
    const response = await api.get("/instructor/students", {
      params: courseId ? { courseId } : {},
    });
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch students"));
  }
};
