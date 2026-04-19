import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/apiResponse.js";
import * as instructorService from "../../services/instructor.service.js";

export const getInstructorStudents = asyncHandler(async (req, res) => {
  const students = await instructorService.getInstructorStudents(req.user.id, req.query.courseId);
  return successResponse(res, students);
});
