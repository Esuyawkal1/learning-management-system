import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/apiResponse.js";
import * as studentService from "../../services/student.service.js";

export const getStudentCertificates = asyncHandler(async (req, res) => {
  const certificates = await studentService.getStudentCertificates(req.user.id);
  return successResponse(res, certificates);
});
