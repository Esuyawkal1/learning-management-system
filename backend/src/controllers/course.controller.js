import * as courseService from "../services/course.service.js";
import asyncHandler from "../utils/asyncHandler.js";
 import { successResponse } from "../utils/apiResponse.js";


 
export const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.getAllCourses({
    limit: req.query.limit,
    user: req.user || null,
    includeUnpublished: req.user?.role === "admin",
  });
  return successResponse(res, courses);
});

export const getCourseById = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(req.params.id, req.user || null);
  return successResponse(res, course);
});

export const getCoursePreview = asyncHandler(async (req, res) => {
  const preview = await courseService.getCoursePreview(req.params.id);
  return successResponse(res, preview);
});

export const createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.body, req.user);
  return successResponse(res, course, "Course created successfully", 201);
});

export const updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(req.params.id, req.body, req.user);
  return successResponse(res, course, "Course updated successfully");
});

export const deleteCourse = asyncHandler(async (req, res) => {
  await courseService.deleteCourse(req.params.id, req.user);
  return successResponse(res, null, "Course deleted successfully");
});
