import * as authService from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
//import generateToken from "../utils/generateToken.js";
import { generateAccessToken, sendRefreshToken } from "../utils/generateToken.js";

const respondWithSession = (res, { user, token }, message, status = 200) => {
  const jwtToken = token || generateAccessToken(user._id, user.role);

  sendRefreshToken(res, user._id);

  return successResponse(
    res,
    { user, token: jwtToken },
    message,
    status
  );
};

// ================= REGISTER =================
export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  return respondWithSession(res, result, "Registration successful", 201);
});

// ================= LOGIN =================
export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  return respondWithSession(res, result, "Login successful");
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmail(req.body);

  return respondWithSession(res, result, "Email verified successfully");
});

export const resendVerification = asyncHandler(async (req, res) => {
  const result = await authService.resendVerification(req.body);

  return successResponse(
    res,
    result,
    "A new verification code has been sent"
  );
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body);

  return successResponse(
    res,
    result,
    "If an account exists, a reset code has been sent"
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);

  return successResponse(
    res,
    result,
    "Password reset successful"
  );
});

export const googleAuth = asyncHandler(async (req, res) => {
  const result = await authService.loginWithGoogle(req.body);

  return respondWithSession(res, result, "Google sign-in successful");
});

export const getGoogleClientConfig = asyncHandler(async (req, res) => {
  const result = await authService.getGoogleClientConfig();

  return successResponse(
    res,
    result,
    "Google sign-in configuration loaded"
  );
});

// ================= GET CURRENT USER =================
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);

  return successResponse(
    res,
    user,
    "User fetched successfully"
  );
});

// ================= LOGOUT =================
export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  return successResponse(
    res,
    null,
    "Logged out successfully"
  );
});
