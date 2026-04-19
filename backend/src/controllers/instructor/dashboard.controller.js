import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/apiResponse.js";
import * as instructorService from "../../services/instructor.service.js";

export const getInstructorDashboard = asyncHandler(async (req, res) => {
  const dashboard = await instructorService.getInstructorDashboard(req.user.id);
  return successResponse(res, dashboard);
});
