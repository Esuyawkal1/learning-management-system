import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import {
  createEmailVerificationCode,
  hashEmailVerificationCode,
} from "../utils/emailVerification.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../utils/emailSender.js";
import { verifyGoogleIdToken } from "../utils/googleAuth.js";

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const sanitizeUser = (user) => {
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.googleId;
  delete userObj.emailVerificationCode;
  delete userObj.emailVerificationExpiresAt;
  delete userObj.passwordResetCode;
  delete userObj.passwordResetExpiresAt;
  return userObj;
};

const buildAuthResponse = (user) => {
  return {
    user: sanitizeUser(user),
    token: generateToken(user._id),
  };
};

const clearEmailVerificationState = (user) => {
  user.emailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpiresAt = undefined;
};

const issueVerificationCode = async (user) => {
  const { code, hashedCode, expiresAt } = createEmailVerificationCode();

  user.emailVerificationCode = hashedCode;
  user.emailVerificationExpiresAt = expiresAt;
  user.emailVerified = false;

  await user.save();
  await sendVerificationEmail({
    email: user.email,
    name: user.name,
    code,
  });

  return {
    email: user.email,
    requiresEmailVerification: true,
  };
};

const issuePasswordResetCode = async (user) => {
  const { code, hashedCode, expiresAt } = createEmailVerificationCode();

  user.passwordResetCode = hashedCode;
  user.passwordResetExpiresAt = expiresAt;

  await user.save();
  await sendPasswordResetEmail({
    email: user.email,
    name: user.name,
    code,
  });

  return {
    email: user.email,
    requiresPasswordReset: true,
  };
};

// ================= REGISTER =================
export const register = async ({ name, email, password, role }) => {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail }).select(
    "+password +googleId +emailVerificationCode +emailVerificationExpiresAt"
  );
  if (existingUser) {
    if (existingUser.authProvider === "google" && !existingUser.password) {
      throw new AppError(
        "This email is already linked to Google sign-in. Continue with Google to access it.",
        400
      );
    }

    if (existingUser.isActive === false) {
      throw new AppError("Your account has been deactivated", 403);
    }

    if (existingUser.emailVerified === false) {
      existingUser.name = name;
      existingUser.email = normalizedEmail;
      existingUser.password = password;
      existingUser.role = role || existingUser.role || "student";
      existingUser.authProvider = "email";
      clearEmailVerificationState(existingUser);

      await existingUser.save();

      return buildAuthResponse(existingUser);
    }

    throw new AppError("Email already in use", 400);
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password, // ❗ DO NOT HASH HERE
    role: role || "student",
    authProvider: "email",
    emailVerified: true,
  });

  return buildAuthResponse(user);
};
// ================= LOGIN =================
export const login = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password +emailVerificationCode +emailVerificationExpiresAt"
  );

  if (user?.isActive === false) {
    throw new AppError("Your account has been deactivated", 403);
  }

  if (user && !user.password) {
    throw new AppError(
      "This account uses Google sign-in. Continue with Google to access it.",
      400
    );
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new AppError("Invalid email or password", 401);
  }

  if (user.emailVerified === false) {
    clearEmailVerificationState(user);
    await user.save();
  }

  return buildAuthResponse(user);
};

export const verifyEmail = async ({ email, code }) => {
  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne({
    email: normalizedEmail,
    emailVerificationCode: hashEmailVerificationCode(code),
    emailVerificationExpiresAt: { $gt: new Date() },
  }).select("+emailVerificationCode +emailVerificationExpiresAt");

  if (!user) {
    throw new AppError("Invalid or expired verification code", 400);
  }

  if (user.isActive === false) {
    throw new AppError("Your account has been deactivated", 403);
  }

  clearEmailVerificationState(user);

  await user.save();

  return buildAuthResponse(user);
};

export const resendVerification = async ({ email }) => {
  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password +emailVerificationCode +emailVerificationExpiresAt"
  );

  if (!user) {
    throw new AppError("No account was found for this email", 404);
  }

  if (user.emailVerified !== false) {
    throw new AppError("This email address is already verified", 400);
  }

  if (!user.password) {
    throw new AppError(
      "This account uses Google sign-in and does not need email verification",
      400
    );
  }

  return issueVerificationCode(user);
};

export const forgotPassword = async ({ email }) => {
  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password +passwordResetCode +passwordResetExpiresAt"
  );

  if (!user) {
    return {
      email: normalizedEmail,
      requiresPasswordReset: true,
    };
  }

  if (user.isActive === false) {
    throw new AppError("Your account has been deactivated", 403);
  }

  return issuePasswordResetCode(user);
};

export const resetPassword = async ({ email, code, password }) => {
  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne({
    email: normalizedEmail,
    passwordResetCode: hashEmailVerificationCode(code),
    passwordResetExpiresAt: { $gt: new Date() },
  }).select(
    "+password +passwordResetCode +passwordResetExpiresAt +emailVerificationCode +emailVerificationExpiresAt"
  );

  if (!user) {
    throw new AppError("Invalid or expired reset code", 400);
  }

  if (user.isActive === false) {
    throw new AppError("Your account has been deactivated", 403);
  }

  user.password = password;
  user.passwordResetCode = undefined;
  user.passwordResetExpiresAt = undefined;

  if (user.emailVerified === false) {
    clearEmailVerificationState(user);
  }

  await user.save();

  return {
    email: user.email,
  };
};

export const loginWithGoogle = async ({ credential, role }) => {
  const googleAccount = await verifyGoogleIdToken(credential);
  const normalizedEmail = normalizeEmail(googleAccount.email);

  let user = await User.findOne({ email: normalizedEmail }).select(
    "+password +googleId"
  );

  if (user) {
    if (user.isActive === false) {
      throw new AppError("Your account has been deactivated", 403);
    }

    let shouldSave = false;

    if (!user.googleId) {
      user.googleId = googleAccount.googleId;
      shouldSave = true;
    }

    if (user.emailVerified === false) {
      user.emailVerified = true;
      shouldSave = true;
    }

    if (!user.profileImage && googleAccount.picture) {
      user.profileImage = googleAccount.picture;
      shouldSave = true;
    }

    if (shouldSave) {
      await user.save();
    }

    return buildAuthResponse(user);
  }

  user = await User.create({
    name: googleAccount.name || normalizedEmail.split("@")[0],
    email: normalizedEmail,
    role: role || "student",
    authProvider: "google",
    googleId: googleAccount.googleId,
    emailVerified: true,
    profileImage: googleAccount.picture,
  });

  return buildAuthResponse(user);
};

// ================= CURRENT USER =================
export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const getGoogleClientConfig = async () => {
  return {
    enabled: Boolean(process.env.GOOGLE_CLIENT_ID),
    clientId: process.env.GOOGLE_CLIENT_ID || "",
  };
};
