import api from "@/services/api";
import { extractApiData, getApiErrorMessage } from "@/services/admin/helpers";

export const toggleStudentLessonCompletion = async (lessonId, completed) => {
  try {
    const response = await api.patch(`/student/progress/lesson/${lessonId}`, { completed });
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to update lesson progress"));
  }
};
