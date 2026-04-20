import api from "./api";
import { extractApiData, getApiErrorMessage } from "@/services/admin/helpers";

const assertPaymentPayload = ({ userId, courseId }) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!courseId) {
    throw new Error("Course ID is required");
  }
};

const assertTxRef = (txRef) => {
  if (!txRef) {
    throw new Error("Transaction reference is required");
  }
};

const normalizeErrorMessage = (value, fallback) => {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (value && typeof value === "object") {
    const nestedValue = value.message || value.detail || value.error;

    if (typeof nestedValue === "string" && nestedValue.trim()) {
      return nestedValue;
    }

    try {
      return JSON.stringify(value);
    } catch (_error) {
      return fallback;
    }
  }

  return fallback;
};

export const initializePayment = async ({ userId, courseId }) => {
  assertPaymentPayload({ userId, courseId });

  try {
    const response = await api.post("/payment/initialize", {
      userId,
      courseId,
    });

    return extractApiData(response);
  } catch (error) {
    throw new Error(
      normalizeErrorMessage(
        getApiErrorMessage(error, "Failed to initialize payment"),
        "Failed to initialize payment"
      )
    );
  }
};

export const verifyPayment = async (txRef) => {
  assertTxRef(txRef);

  try {
    const response = await api.get(`/payment/verify/${encodeURIComponent(txRef)}`);
    return extractApiData(response);
  } catch (error) {
    throw new Error(
      normalizeErrorMessage(
        getApiErrorMessage(error, "Failed to verify payment"),
        "Failed to verify payment"
      )
    );
  }
};
