import * as lessonService from "../services/lesson.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const getLessons = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const lessons = await lessonService.getLessonsByCourse(
    courseId,
    req.user
  );

  return successResponse(res, lessons);
});


export const publishLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;

  const lesson = await lessonService.publishLesson(
    lessonId,
    req.user
  );

  return successResponse(res, lesson, "Lesson published successfully");
});


export const createLesson = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const lesson = await lessonService.createLesson({
    ...req.body,
    course: courseId, // secure injection
  }, req.user);

  return successResponse(res, lesson, "Lesson created successfully", 201);
});

export const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.updateLesson(
    req.params.id,
    req.body,
    req.user
  );

  return successResponse(res, lesson, "Lesson updated successfully");
});

export const deleteLesson = asyncHandler(async (req, res) => {
  await lessonService.deleteLesson(req.params.id, req.user);

  return successResponse(res, null, "Lesson deleted successfully");
});
