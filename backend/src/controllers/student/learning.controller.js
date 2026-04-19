import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/apiResponse.js";
import * as studentLearningService from "../../services/student.learning.service.js";

export const getStudentCourseLessons = asyncHandler(async (req, res) => {
  const data = await studentLearningService.getStudentCourseLessons(
    req.user.id,
    req.params.courseId
  );

  return successResponse(res, data);
});

export const getStudentLastLesson = asyncHandler(async (req, res) => {
  const data = await studentLearningService.getStudentLastLesson(
    req.user.id,
    req.params.courseId
  );

  return successResponse(res, data);
});

export const saveStudentLessonProgress = asyncHandler(async (req, res) => {
  const data = await studentLearningService.saveStudentLessonProgress(req.user.id, req.body);

  return successResponse(res, data, "Lesson progress updated successfully");
});
