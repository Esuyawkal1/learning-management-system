// src/routes/enrollment.routes.js

import { Router } from "express";
import * as enrollmentController from "../controllers/enrollment.controller.js";
import { protect } from "../middlewares/protect.middleware.js";

const router = Router();

/**
 * Student enroll in a course
 */
router.post("/", protect, enrollmentController.enrollCourse);

/**
 * Get logged-in user's courses
 */
router.get(
  "/my-courses",
  protect,
  enrollmentController.getMyCourses
);

export default router;