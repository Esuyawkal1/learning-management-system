import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/apiResponse.js";
import * as instructorService from "../../services/instructor.service.js";

export const getInstructorLessons = asyncHandler(async (req, res) => {
  const lessons = await instructorService.getInstructorLessons(req.user.id);
  return successResponse(res, lessons);
});

export const createInstructorLesson = asyncHandler(async (req, res) => {
  const lesson = await instructorService.createInstructorLesson(req.user.id, req.body);
  return successResponse(res, lesson, "Lesson created successfully", 201);
});

export const updateInstructorLesson = asyncHandler(async (req, res) => {
  const lesson = await instructorService.updateInstructorLesson(req.params.lessonId, req.user.id, req.body);
  return successResponse(res, lesson, "Lesson updated successfully");
});

export const deleteInstructorLesson = asyncHandler(async (req, res) => {
  await instructorService.deleteInstructorLesson(req.params.lessonId, req.user.id);
  return successResponse(res, null, "Lesson deleted successfully");
});

export const reorderInstructorLessons = asyncHandler(async (req, res) => {
  const lessons = await instructorService.reorderInstructorLessons(
    req.params.courseId,
    req.user.id,
    req.body.lessonIds || []
  );

  return successResponse(res, lessons, "Lesson order updated successfully");
});
