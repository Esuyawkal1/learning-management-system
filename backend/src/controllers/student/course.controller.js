import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/apiResponse.js";
import * as studentService from "../../services/student.service.js";
import { AppError } from "../../utils/AppError.js";

export const getStudentCourses = asyncHandler(async (req, res) => {
  const courses = await studentService.getStudentCourses(req.user.id);
  return successResponse(res, courses);
});

export const getStudentCourseById = asyncHandler(async (req, res) => {
  const courseId = req.params.courseId || req.params.id;

  if (!courseId) {
    throw new AppError("Course ID is required", 400);
  }

  const course = await studentService.getStudentCourseById(req.user.id, courseId);
  return successResponse(res, course);
});

export const toggleStudentCourseLike = asyncHandler(async (req, res) => {
  const courseId = req.params.courseId;

  if (!courseId) {
    throw new AppError("Course ID is required", 400);
  }

  const likeState = await studentService.toggleStudentCourseLike(req.user.id, courseId);
  return successResponse(res, likeState, "Course like updated successfully");
});
