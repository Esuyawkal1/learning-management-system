import User from "../../models/User.model.js";
import * as adminService from "../../services/admin.service.js";
import { successResponse } from "../../utils/apiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const getUsersStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
    },
  });
});

export const getAllAdminUsers = asyncHandler(async (req, res) => {
  const users = await adminService.getAllAdminUsers();
  return successResponse(res, users);
});

export const createAdminUser = asyncHandler(async (req, res) => {
  const user = await adminService.createAdminUser(req.body);
  return successResponse(res, user, "User created successfully", 201);
});

export const updateAdminUser = asyncHandler(async (req, res) => {
  const updatedUser = await adminService.updateAdminUser(req.params.id, req.body);
  return successResponse(res, updatedUser, "User updated successfully");
});

export const deleteAdminUser = asyncHandler(async (req, res) => {
  await adminService.deleteAdminUser(req.params.id);
  return successResponse(res, null, "User deleted successfully");
});
