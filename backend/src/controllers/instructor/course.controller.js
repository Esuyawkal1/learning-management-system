import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/apiResponse.js";
import * as instructorService from "../../services/instructor.service.js";

export const getInstructorCourses = asyncHandler(async (req, res) => {
  const courses = await instructorService.getInstructorCourses(req.user.id);
  return successResponse(res, courses);
});

export const createInstructorCourse = asyncHandler(async (req, res) => {
  const course = await instructorService.createInstructorCourse(req.user.id, req.body);
  return successResponse(res, course, "Course created successfully", 201);
});

export const updateInstructorCourse = asyncHandler(async (req, res) => {
  const course = await instructorService.updateInstructorCourse(req.params.courseId, req.user.id, req.body);
  return successResponse(res, course, "Course updated successfully");
});

export const deleteInstructorCourse = asyncHandler(async (req, res) => {
  await instructorService.deleteInstructorCourse(req.params.courseId, req.user.id);
  return successResponse(res, null, "Course deleted successfully");
});

export const toggleInstructorCoursePublishState = asyncHandler(async (req, res) => {
  const course = await instructorService.toggleCoursePublishState(req.params.courseId, req.user.id);
  return successResponse(res, course, "Course status updated successfully");
});
