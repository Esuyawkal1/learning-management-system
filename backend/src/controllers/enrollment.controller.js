import * as enrollmentService from "../services/enrollment.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const enrollCourse = asyncHandler(async (req, res) => {
  const enrollment = await enrollmentService.enrollCourse(req.user.id, req.body.courseId);
  return successResponse(res, enrollment, "Enrollment successful", 201);
});

export const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await enrollmentService.getMyCourses(req.user.id);
  return successResponse(res, courses);
});