import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/apiResponse.js";
import * as instructorService from "../../services/instructor.service.js";

export const getInstructorAnalytics = asyncHandler(async (req, res) => {
  const analytics = await instructorService.getInstructorAnalytics(req.user.id);
  return successResponse(res, analytics);
});
