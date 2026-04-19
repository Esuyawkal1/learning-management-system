import config from "../config/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import * as paymentService from "../services/payment.service.js";

const normalizeQueryKey = (key) => `${key || ""}`.replace(/^(amp;)+/i, "");

const getTxRefFromRequest = (req) => {
  if (req.params.txRef) {
    return req.params.txRef;
  }

  const directTxRef = req.query.tx_ref || req.query.trx_ref || req.query.txRef;

  if (directTxRef) {
    return directTxRef;
  }

  const normalizedQueryEntry = Object.entries(req.query || {}).find(([key, value]) => {
    const normalizedKey = normalizeQueryKey(key);
    return Boolean(value) && ["tx_ref", "trx_ref", "txRef"].includes(normalizedKey);
  });

  return normalizedQueryEntry?.[1] || "";
};

export const initializePayment = asyncHandler(async (req, res) => {
  const result = await paymentService.initializePayment({
    authenticatedUser: req.user,
    userId: req.body.userId,
    courseId: req.body.courseId,
  });

  return successResponse(res, result, "Payment initialized successfully", 201);
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const result = await paymentService.verifyPayment(getTxRefFromRequest(req));

  if (result.payment.status !== "paid") {
    return res.status(400).json({
      success: false,
      message: "Payment verification failed",
      data: result,
    });
  }

  return successResponse(res, result, "Payment verified successfully");
});

export const handlePaymentCallback = asyncHandler(async (req, res) => {
  const result = await paymentService.verifyPayment(getTxRefFromRequest(req));

  if (result.payment.status !== "paid") {
    return res.status(400).json({
      success: false,
      message: "Payment verification failed",
      data: result,
    });
  }

  return res.redirect(result.returnUrl || config.env.chapaReturnUrl);
});
