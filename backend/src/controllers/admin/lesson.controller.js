import * as adminService from "../../services/admin.service.js";
import { successResponse } from "../../utils/apiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const getAdminLessons = asyncHandler(async (req, res) => {
  const lessons = await adminService.getAllAdminLessons({
    courseId: req.query.courseId,
  });

  return successResponse(res, lessons);
});

export const createAdminLesson = asyncHandler(async (req, res) => {
  const lesson = await adminService.createAdminLesson(req.body);
  return successResponse(res, lesson, "Lesson created successfully", 201);
});

export const updateAdminLesson = asyncHandler(async (req, res) => {
  const lesson = await adminService.updateAdminLesson(req.params.id, req.body);
  return successResponse(res, lesson, "Lesson updated successfully");
});

export const deleteAdminLesson = asyncHandler(async (req, res) => {
  await adminService.deleteAdminLesson(req.params.id);
  return successResponse(res, null, "Lesson deleted successfully");
});
