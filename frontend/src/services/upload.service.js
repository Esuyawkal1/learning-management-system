import api from "@/services/api";
import { getApiErrorMessage } from "@/services/admin/helpers";

const uploadLessonAsset = async (endpoint, fieldName, file, onProgress, responseKey = "url") => {
  if (!file) {
    throw new Error("A file is required for upload");
  }

  const formData = new FormData();
  formData.append(fieldName, file);

  try {
    const response = await api.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (!onProgress || !progressEvent.total) {
          return;
        }

        const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        onProgress(progress);
      },
    });

    return response?.data?.[responseKey] || response?.data?.data?.[responseKey] || "";
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to upload lesson asset"));
  }
};

export const uploadLessonVideo = async (file, onProgress) =>
  uploadLessonAsset("/upload/video", "video", file, onProgress);

export const uploadLessonPdf = async (file, onProgress) =>
  uploadLessonAsset("/upload/pdf", "pdf", file, onProgress);

export const uploadCourseThumbnail = async (file, onProgress) =>
  uploadLessonAsset("/upload/course-thumbnail", "thumbnail", file, onProgress, "thumbnailUrl");

export const uploadProfileImage = async (file, onProgress) =>
  uploadLessonAsset(
    "/upload/profile-image",
    "profileImage",
    file,
    onProgress,
    "profileImageUrl"
  );

export const uploadCourseDocument = async (file, onProgress) => {
  if (!file) {
    throw new Error("A file is required for upload");
  }

  const formData = new FormData();
  formData.append("document", file);

  try {
    const response = await api.post("/upload/course-document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (!onProgress || !progressEvent.total) {
          return;
        }

        const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        onProgress(progress);
      },
    });

    return response?.data?.document || response?.data?.data?.document || null;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to upload course document"));
  }
};
