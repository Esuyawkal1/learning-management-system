import path from "path";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

const buildPublicFileUrl = (req, file, folderName) => {
  const filename = path.basename(file.filename);
  return `${req.protocol}://${req.get("host")}/uploads/lessons/${folderName}/${filename}`;
};

const buildPublicCourseFileUrl = (req, file) => {
  const filename = path.basename(file.filename);
  return `${req.protocol}://${req.get("host")}/uploads/courses/documents/${filename}`;
};

const buildPublicProfileImageUrl = (req, file) => {
  const filename = path.basename(file.filename);
  return `${req.protocol}://${req.get("host")}/uploads/profiles/${filename}`;
};

export const uploadLessonVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Video file is required", 400);
  }

  res.status(200).json({
    success: true,
    url: buildPublicFileUrl(req, req.file, "videos"),
  });
});

export const uploadLessonPdf = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("PDF file is required", 400);
  }

  res.status(200).json({
    success: true,
    url: buildPublicFileUrl(req, req.file, "pdfs"),
  });
});

export const uploadCourseDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Document file is required", 400);
  }

  res.status(200).json({
    success: true,
    document: {
      title: "",
      fileUrl: buildPublicCourseFileUrl(req, req.file),
      fileName: req.file.originalname || path.basename(req.file.filename),
      uploadedAt: new Date().toISOString(),
    },
  });
});

export const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Profile image file is required", 400);
  }

  res.status(200).json({
    success: true,
    profileImageUrl: buildPublicProfileImageUrl(req, req.file),
  });
});
