import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/apiResponse.js";
import * as studentService from "../../services/student.service.js";

export const getStudentAssignments = asyncHandler(async (req, res) => {
  const assignments = await studentService.getStudentAssignments(req.user.id);
  return successResponse(res, assignments);
});

export const submitStudentAssignment = asyncHandler(async (req, res) => {
  const submission = await studentService.submitStudentAssignment(req.user.id, req.body);
  return successResponse(res, submission, "Assignment submitted successfully", 201);
});
