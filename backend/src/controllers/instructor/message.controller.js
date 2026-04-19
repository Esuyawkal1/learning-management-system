import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/apiResponse.js";
import * as instructorService from "../../services/instructor.service.js";

export const getInstructorMessages = asyncHandler(async (req, res) => {
  const messages = await instructorService.getInstructorMessages(req.user.id);
  return successResponse(res, messages);
});

export const sendInstructorMessage = asyncHandler(async (req, res) => {
  const message = await instructorService.sendInstructorMessage(req.user.id, req.body);
  return successResponse(res, message, "Message sent successfully", 201);
});
