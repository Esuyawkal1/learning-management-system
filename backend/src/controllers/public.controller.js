import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { getPublicStats } from "../services/course.service.js";
import { submitContactMessage } from "../services/public.service.js";

export const getPlatformStats = asyncHandler(async (_req, res) => {
  const stats = await getPublicStats();
  return successResponse(res, stats);
});

export const submitPublicContactMessage = asyncHandler(async (req, res) => {
  const result = await submitContactMessage(req.body);
  return successResponse(
    res,
    result,
    "Your message has been sent successfully",
    201
  );
});
