import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/apiResponse.js";
import * as studentService from "../../services/student.service.js";

export const getStudentProfile = asyncHandler(async (req, res) => {
  const profile = await studentService.getStudentProfile(req.user.id);
  return successResponse(res, profile);
});

export const updateStudentProfile = asyncHandler(async (req, res) => {
  const profile = await studentService.updateStudentProfile(req.user.id, req.body);
  return successResponse(res, profile, "Profile updated successfully");
});
