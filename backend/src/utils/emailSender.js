import nodemailer from "nodemailer";

import { AppError } from "./AppError.js";

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new AppError(
      "Email delivery is not configured on the server",
      500
    );
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure:
      String(process.env.SMTP_SECURE).toLowerCase() === "true" ||
      Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const sendVerificationEmail = async ({ email, name, code }) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to: email,
    subject: "Verify your email address",
    text: `Hi ${name || "there"}, your verification code is ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <p>Hi ${name || "there"},</p>
        <p>Use this code to verify your email address:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 24px 0;">${code}</p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async ({ email, name, code }) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to: email,
    subject: "Reset your password",
    text: `Hi ${name || "there"}, your password reset code is ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <p>Hi ${name || "there"},</p>
        <p>Use this code to reset your password:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 24px 0;">${code}</p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
};

export const sendContactNotificationEmail = async ({
  name,
  email,
  subject,
  phone,
  message,
}) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safePhone = escapeHtml(phone || "Not provided");
  const safeMessage = escapeHtml(message);

  if (!supportEmail) {
    throw new AppError("Support inbox is not configured on the server", 500);
  }

  const phoneLine = phone ? `Phone: ${phone}` : "Phone: Not provided";

  await transporter.sendMail({
    from,
    to: supportEmail,
    replyTo: email,
    subject: `[Contact] ${subject}`,
    text: `New contact message from ${name} <${email}>.

${phoneLine}

Subject: ${subject}

Message:
${message}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin-bottom: 16px;">New contact message</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Phone:</strong> ${safePhone}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <div style="margin-top: 20px; padding: 16px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0;">
          <p style="margin: 0 0 8px;"><strong>Message</strong></p>
          <p style="margin: 0; white-space: pre-line;">${safeMessage}</p>
        </div>
      </div>
    `,
  });
};

export const sendContactAutoReplyEmail = async ({ email, name, subject }) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;
  const safeName = escapeHtml(name);
  const safeSubject = escapeHtml(subject);
  const safeSupportEmail = escapeHtml(supportEmail);

  await transporter.sendMail({
    from,
    to: email,
    subject: "We received your message",
    text: `Hi ${name},

Thanks for contacting Tech Learning Platform. We received your message about "${subject}" and will get back to you soon.

You can reply directly to this email if you need to add more details.

Support inbox: ${supportEmail}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <p>Hi ${safeName},</p>
        <p>Thanks for contacting <strong>Tech Learning Platform</strong>.</p>
        <p>We received your message about <strong>${safeSubject}</strong> and will get back to you soon.</p>
        <p>You can reply directly to this email if you need to add more details.</p>
        <p style="margin-top: 24px; color: #475569;">Support inbox: ${safeSupportEmail}</p>
      </div>
    `,
  });
};
