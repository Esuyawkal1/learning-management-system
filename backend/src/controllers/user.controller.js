import * as userService from "../services/user.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  return successResponse(res, users);
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return successResponse(res, user);
});

export const updateUser = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateUser(req.params.id, req.body);
  return successResponse(res, updatedUser, "User updated successfully");
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  return successResponse(res, null, "User deleted successfully");
});