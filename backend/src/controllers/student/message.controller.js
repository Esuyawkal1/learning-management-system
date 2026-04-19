import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/apiResponse.js";
import * as studentService from "../../services/student.service.js";

export const getStudentMessages = asyncHandler(async (req, res) => {
  const messages = await studentService.getStudentMessages(req.user.id);
  return successResponse(res, messages);
});

export const sendStudentMessage = asyncHandler(async (req, res) => {
  const message = await studentService.sendStudentMessage(req.user.id, req.body);
  return successResponse(res, message, "Message sent successfully", 201);
});
