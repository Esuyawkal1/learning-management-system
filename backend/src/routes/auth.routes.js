// src/routes/auth.routes.js

import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { protect } from "../middlewares/protect.middleware.js";
import { restrictTo } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.get("/google/config", authController.getGoogleClientConfig);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/google", authController.googleAuth);
router.post("/logout", authController.logout);

// Protected routes (example: get current user's profile)
router.get("/me", protect, authController.getCurrentUser);
// Admin-only routes example
// router.get("/all-users", protect, restrictTo("admin"), authController.getAllUsers);

export default router;
