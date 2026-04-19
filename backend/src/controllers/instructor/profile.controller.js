import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/apiResponse.js";
import * as instructorService from "../../services/instructor.service.js";

export const getInstructorProfile = asyncHandler(async (req, res) => {
  const profile = await instructorService.getInstructorProfile(req.user.id);
  return successResponse(res, profile);
});

export const updateInstructorProfile = asyncHandler(async (req, res) => {
  const profile = await instructorService.updateInstructorProfile(req.user.id, req.body);
  return successResponse(res, profile, "Profile updated successfully");
});
