import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/apiResponse.js";
import * as studentService from "../../services/student.service.js";

export const getStudentDashboard = asyncHandler(async (req, res) => {
  const dashboard = await studentService.getStudentDashboard(req.user.id);
  return successResponse(res, dashboard);
});
