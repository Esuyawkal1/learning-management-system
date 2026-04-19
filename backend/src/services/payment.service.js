import axios from "axios";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import config from "../config/index.js";
import Course from "../models/Course.model.js";
import Payment from "../models/Payment.model.js";
import { ensureCourseEnrollment } from "./enrollment.service.js";
import { AppError } from "../utils/AppError.js";

const CHAPA_INITIALIZE_URL = "https://api.chapa.co/v1/transaction/initialize";
const CHAPA_VERIFY_URL = "https://api.chapa.co/v1/transaction/verify";

const getChapaHeaders = () => {
  if (!config.env.chapaSecretKey) {
    throw new AppError("Missing CHAPA_SECRET_KEY configuration", 500);
  }

  return {
    Authorization: `Bearer ${config.env.chapaSecretKey}`,
    "Content-Type": "application/json",
  };
};

const assertValidObjectId = (value, label) => {
  if (!value) {
    throw new AppError(`${label} is required`, 400);
  }

  if (!mongoose.isValidObjectId(value)) {
    throw new AppError(`Invalid ${label.toLowerCase()}`, 400);
  }
};

const getCourseOrThrow = async (courseId) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  return course;
};

const buildCustomerName = (user) => {
  const fallbackName = user?.email?.split("@")[0] || "Student";
  const name = `${user?.name || fallbackName}`.trim();
  const [firstName = "Student", ...rest] = name.split(/\s+/);

  return {
    firstName,
    lastName: rest.join(" ") || "Learner",
  };
};

const getChapaErrorMessage = (error, fallbackMessage) => {
  const candidates = [
    error?.response?.data?.message,
    error?.response?.data?.detail,
    error?.message,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }

    if (candidate && typeof candidate === "object") {
      const nestedMessage =
        candidate.message ||
        candidate.detail ||
        candidate.error ||
        candidate.msg;

      if (typeof nestedMessage === "string" && nestedMessage.trim()) {
        return nestedMessage;
      }

      try {
        return JSON.stringify(candidate);
      } catch (_error) {
        return fallbackMessage;
      }
    }
  }

  return (
    fallbackMessage
  );
};

const loadPaymentOrThrow = async (txRef) => {
  if (!txRef) {
    throw new AppError("Transaction reference is required", 400);
  }

  const payment = await Payment.findOne({ tx_ref: txRef });

  if (!payment) {
    throw new AppError("Payment record not found", 404);
  }

  return payment;
};

const buildPaymentReturnUrl = ({ courseId, txRef }) => {
  const returnUrl = new URL(config.env.chapaReturnUrl);
  const basePath = returnUrl.pathname.replace(/\/+$/, "");

  if (courseId) {
    returnUrl.searchParams.set("courseId", String(courseId));
  }

  if (txRef) {
    returnUrl.pathname = `${basePath}/${encodeURIComponent(String(txRef))}`;
  }

  return returnUrl.toString();
};

const verifyWithChapa = async (txRef) => {
  try {
    const response = await axios.get(`${CHAPA_VERIFY_URL}/${encodeURIComponent(txRef)}`, {
      headers: getChapaHeaders(),
    });

    return response.data;
  } catch (error) {
    throw new AppError(
      getChapaErrorMessage(error, "Unable to verify payment with Chapa"),
      error?.response?.status || 502
    );
  }
};

const resolveVerificationState = (payment, verificationResponse) => {
  const verifiedStatus = `${verificationResponse?.data?.status || verificationResponse?.status || ""}`.toLowerCase();
  const verifiedAmount = Number(verificationResponse?.data?.amount);
  const verifiedCurrency = `${verificationResponse?.data?.currency || ""}`.toUpperCase();
  const amountMatches = Number.isNaN(verifiedAmount) ? true : verifiedAmount === Number(payment.amount);
  const currencyMatches = !verifiedCurrency || verifiedCurrency === config.env.chapaCurrency;
  const paid = verifiedStatus === "success" && amountMatches && currencyMatches;

  return {
    paid,
    verifiedStatus,
    amountMatches,
    currencyMatches,
  };
};

export const initializePayment = async ({ authenticatedUser, userId, courseId }) => {
  if (!authenticatedUser) {
    throw new AppError("Not authorized, no token", 401);
  }

  if ((authenticatedUser.role || "").toLowerCase() !== "student") {
    throw new AppError("Only student accounts can complete course payments", 403);
  }

  assertValidObjectId(courseId, "Course ID");

  const authenticatedUserId = String(authenticatedUser._id || authenticatedUser.id || "");

  if (userId && String(userId) !== authenticatedUserId) {
    throw new AppError("You can only initialize payments for your own account", 403);
  }

  const course = await getCourseOrThrow(courseId);
  const { firstName, lastName } = buildCustomerName(authenticatedUser);

  const txRef = uuidv4();
  const returnUrl = buildPaymentReturnUrl({
    courseId: course._id,
    txRef,
  });

  if (Number(course.price || 0) <= 0) {
    const payment = await Payment.create({
      userId: authenticatedUserId,
      courseId: course._id,
      amount: 0,
      tx_ref: txRef,
      status: "pending",
    });

    try {
      await ensureCourseEnrollment(authenticatedUserId, course._id);
      payment.status = "paid";
      await payment.save();
    } catch (error) {
      payment.status = "failed";
      await payment.save();
      throw error;
    }

    return {
      checkout_url: returnUrl,
      return_url: returnUrl,
      tx_ref: payment.tx_ref,
    };
  }

  const payment = await Payment.create({
    userId: authenticatedUserId,
    courseId: course._id,
    amount: course.price,
    tx_ref: txRef,
    status: "pending",
  });

  try {
    const response = await axios.post(
      CHAPA_INITIALIZE_URL,
      {
        amount: String(course.price),
        currency: config.env.chapaCurrency,
        email: authenticatedUser.email,
        first_name: firstName,
        last_name: lastName,
        tx_ref: txRef,
        callback_url: config.env.chapaCallbackUrl,
        return_url: returnUrl,
        customization: {
          title: course.title,
          description: `Course enrollment payment for ${course.title}`,
        },
        meta: {
          payment_reason: `Course enrollment for ${course.title}`,
          courseId: String(course._id),
          userId: authenticatedUserId,
        },
      },
      {
        headers: getChapaHeaders(),
      }
    );

    const checkoutUrl = response?.data?.data?.checkout_url;

    if (!checkoutUrl) {
      payment.status = "failed";
      await payment.save();
      throw new AppError("Chapa did not return a checkout URL", 502);
    }

    return {
      checkout_url: checkoutUrl,
      return_url: returnUrl,
      tx_ref: payment.tx_ref,
    };
  } catch (error) {
    if (payment.status !== "failed") {
      payment.status = "failed";
      await payment.save();
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      getChapaErrorMessage(error, "Unable to initialize payment with Chapa"),
      error?.response?.status || 502
    );
  }
};

export const verifyPayment = async (txRef) => {
  const payment = await loadPaymentOrThrow(txRef);
  const returnUrl = buildPaymentReturnUrl({
    courseId: payment.courseId,
    txRef: payment.tx_ref,
  });

  if (payment.status === "paid") {
    const enrollmentResult = await ensureCourseEnrollment(payment.userId, payment.courseId);

    return {
      payment,
      chapa: null,
      enrolled: true,
      alreadyEnrolled: enrollmentResult.alreadyEnrolled,
      returnUrl,
    };
  }

  const verificationResponse = await verifyWithChapa(txRef);
  const verificationState = resolveVerificationState(payment, verificationResponse);

  if (!verificationState.paid) {
    if (payment.status !== "failed") {
      payment.status = "failed";
      await payment.save();
    }

    return {
      payment,
      chapa: verificationResponse,
      enrolled: false,
      returnUrl,
    };
  }

  if (payment.status !== "paid") {
    payment.status = "paid";
    await payment.save();
  }

  const enrollmentResult = await ensureCourseEnrollment(payment.userId, payment.courseId);

  return {
    payment,
    chapa: verificationResponse,
    enrolled: true,
    alreadyEnrolled: enrollmentResult.alreadyEnrolled,
    returnUrl,
  };
};
