import { getAdminAnalytics, getAdminStats } from "../../services/admin.service.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const data = await getAdminStats();

  res.status(200).json({
    success: true,
    data,
  });
});

export const getAnalyticsStats = asyncHandler(async (req, res) => {
  const data = await getAdminAnalytics();

  res.status(200).json({
    success: true,
    data,
  });
});
