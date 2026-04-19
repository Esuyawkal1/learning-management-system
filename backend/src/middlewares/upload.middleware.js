import fs from "fs";
import path from "path";
import multer from "multer";
import { AppError } from "../utils/AppError.js";

const MAX_FILE_SIZE = 200 * 1024 * 1024;
const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const VIDEO_UPLOAD_DIR = path.resolve("uploads", "lessons", "videos");
const PDF_UPLOAD_DIR = path.resolve("uploads", "lessons", "pdfs");
const COURSE_DOCUMENT_UPLOAD_DIR = path.resolve("uploads", "courses", "documents");
const PROFILE_IMAGE_UPLOAD_DIR = path.resolve("uploads", "profiles");

[VIDEO_UPLOAD_DIR, PDF_UPLOAD_DIR, COURSE_DOCUMENT_UPLOAD_DIR, PROFILE_IMAGE_UPLOAD_DIR].forEach((directoryPath) => {
  fs.mkdirSync(directoryPath, { recursive: true });
});

const toSafeFilename = (filename = "file") =>
  filename
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "lesson-file";

const createStorage = (destinationPath) =>
  multer.diskStorage({
    destination: (_req, _file, callback) => {
      callback(null, destinationPath);
    },
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname || "");
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      callback(null, `${toSafeFilename(file.originalname)}-${uniqueSuffix}${extension}`);
    },
  });

const createFileFilter = (allowedMimeTypes, expectedLabel) => (_req, file, callback) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
    return;
  }

  callback(new AppError(`Only ${expectedLabel} files are allowed`, 400));
};

const mapUploadError = (error) => {
  if (!error) {
    return null;
  }

  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return new AppError("File size exceeds the 200MB limit", 400);
  }

  return error;
};

const courseDocumentFileFilter = (_req, file, callback) => {
  const extension = path.extname(file.originalname || "").toLowerCase();
  const allowedExtensions = new Set([".pdf", ".doc", ".docx", ".ppt", ".pptx", ".zip"]);
  const allowedMimeTypes = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-zip-compressed",
  ]);

  if (allowedExtensions.has(extension) && allowedMimeTypes.has(file.mimetype)) {
    callback(null, true);
    return;
  }

  callback(
    new AppError("Only PDF, DOC, DOCX, PPT, PPTX, and ZIP files are allowed", 400)
  );
};

const videoUploadMiddleware = multer({
  storage: createStorage(VIDEO_UPLOAD_DIR),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: createFileFilter(
    [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
      "video/mpeg",
    ],
    "video"
  ),
}).single("video");

const pdfUploadMiddleware = multer({
  storage: createStorage(PDF_UPLOAD_DIR),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: createFileFilter(["application/pdf"], "PDF"),
}).single("pdf");

const courseDocumentUploadMiddleware = multer({
  storage: createStorage(COURSE_DOCUMENT_UPLOAD_DIR),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: courseDocumentFileFilter,
}).single("document");

const profileImageUploadMiddleware = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => {
      callback(null, PROFILE_IMAGE_UPLOAD_DIR);
    },
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname || "").toLowerCase();
      const fallbackExtension = extension || ".png";
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      callback(null, `profile-${uniqueSuffix}${fallbackExtension}`);
    },
  }),
  limits: { fileSize: MAX_PROFILE_IMAGE_SIZE },
  fileFilter: createFileFilter(
    ["image/png", "image/jpeg", "image/jpg", "image/webp"],
    "profile image"
  ),
}).single("profileImage");

export const uploadVideo = (req, res, next) => {
  videoUploadMiddleware(req, res, (error) => next(mapUploadError(error)));
};

export const uploadPdf = (req, res, next) => {
  pdfUploadMiddleware(req, res, (error) => next(mapUploadError(error)));
};

export const uploadCourseDocument = (req, res, next) => {
  courseDocumentUploadMiddleware(req, res, (error) => next(mapUploadError(error)));
};

export const uploadProfileImage = (req, res, next) => {
  profileImageUploadMiddleware(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(new AppError("Profile image size exceeds the 5MB limit", 400));
      return;
    }

    next(error);
  });
};
