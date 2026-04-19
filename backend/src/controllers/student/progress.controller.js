import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/apiResponse.js";
import * as studentService from "../../services/student.service.js";

export const getStudentProgress = asyncHandler(async (req, res) => {
  const progress = await studentService.getStudentProgress(req.user.id);
  return successResponse(res, progress);
});

export const toggleStudentLessonProgress = asyncHandler(async (req, res) => {
  const progress = await studentService.toggleStudentLessonProgress(
    req.user.id,
    req.params.lessonId,
    req.body.completed
  );

  return successResponse(res, progress, "Lesson progress updated successfully");
});
