import Enrollment from "../../models/Enrollment.model.js";
import * as adminService from "../../services/admin.service.js";
import { successResponse } from "../../utils/apiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const getEnrollmentsStats = asyncHandler(async (req, res) => {
  const totalEnrollments = await Enrollment.countDocuments();

  res.status(200).json({
    success: true,
    data: { totalEnrollments },
  });
});

export const getAllAdminEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await adminService.getAllAdminEnrollments({
    courseId: req.query.courseId,
    userId: req.query.userId,
  });

  return successResponse(res, enrollments);
});

export const deleteAdminEnrollment = asyncHandler(async (req, res) => {
  await adminService.deleteAdminEnrollment(req.params.id);
  return successResponse(res, null, "Enrollment deleted successfully");
});
