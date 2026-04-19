import path from "path";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

const buildThumbnailUrl = (req, file) =>
  `${req.protocol}://${req.get("host")}/uploads/courses/thumbnails/${path.basename(file.filename)}`;

export const uploadCourseThumbnail = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Thumbnail file is required", 400);
  }

  res.status(200).json({
    success: true,
    thumbnailUrl: buildThumbnailUrl(req, req.file),
  });
});
