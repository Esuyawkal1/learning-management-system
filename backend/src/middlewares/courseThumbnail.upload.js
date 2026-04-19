import fs from "fs";
import path from "path";
import multer from "multer";
import { AppError } from "../utils/AppError.js";

const THUMBNAIL_UPLOAD_DIR = path.resolve("uploads", "courses", "thumbnails");
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;

fs.mkdirSync(THUMBNAIL_UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, THUMBNAIL_UPLOAD_DIR);
  },
  filename: (_req, _file, callback) => {
    callback(null, `course-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`);
  },
});

const fileFilter = (_req, file, callback) => {
  if (file.mimetype === "image/png") {
    callback(null, true);
    return;
  }

  callback(new AppError("Only PNG thumbnails are allowed", 400));
};

const thumbnailUploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_THUMBNAIL_SIZE,
  },
}).single("thumbnail");

export const uploadCourseThumbnail = (req, res, next) => {
  thumbnailUploadMiddleware(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(new AppError("Thumbnail size exceeds the 5MB limit", 400));
      return;
    }

    next(error);
  });
};
