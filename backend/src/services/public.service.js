import { AppError } from "../utils/AppError.js";
import {
  sendContactAutoReplyEmail,
  sendContactNotificationEmail,
} from "../utils/emailSender.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeValue = (value = "") => String(value).trim();

export const submitContactMessage = async (payload = {}) => {
  const name = normalizeValue(payload.name);
  const email = normalizeValue(payload.email).toLowerCase();
  const subject = normalizeValue(payload.subject);
  const phone = normalizeValue(payload.phone);
  const message = normalizeValue(payload.message);

  if (!name || !email || !subject || !message) {
    throw new AppError(
      "Name, email, subject, and message are required",
      400
    );
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new AppError("Please provide a valid email address", 400);
  }

  if (name.length < 2 || name.length > 80) {
    throw new AppError("Name must be between 2 and 80 characters", 400);
  }

  if (subject.length < 4 || subject.length > 120) {
    throw new AppError("Subject must be between 4 and 120 characters", 400);
  }

  if (phone && phone.length > 30) {
    throw new AppError("Phone number must be 30 characters or fewer", 400);
  }

  if (message.length < 20 || message.length > 2000) {
    throw new AppError("Message must be between 20 and 2000 characters", 400);
  }

  await Promise.all([
    sendContactNotificationEmail({
      name,
      email,
      subject,
      phone,
      message,
    }),
    sendContactAutoReplyEmail({
      name,
      email,
      subject,
    }),
  ]);

  return {
    submittedAt: new Date().toISOString(),
  };
};
