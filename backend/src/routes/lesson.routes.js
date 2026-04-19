import { Router } from "express";
import * as lessonController from "../controllers/lesson.controller.js";
import { protect } from "../middlewares/protect.middleware.js";
import { restrictTo } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router({ mergeParams: true });

/**
 * Public – Get all lessons of a course
 * GET /api/v1/courses/:courseId/lessons
 */

/**
 * Instructor / Admin – Create lesson
 * POST /api/v1/courses/:courseId/lessons
 */
router.get("/", protect, lessonController.getLessons);
router.post(
  "/",
  protect,
  authorize("instructor", "admin"),
  lessonController.createLesson
);

router.patch(
  "/:lessonId/publish",
  protect,
  restrictTo("admin", "instructor"),
  lessonController.publishLesson
);

/**
 * Instructor / Admin – Update lesson
 * PUT /api/v1/courses/:courseId/lessons/:id
 */
router.put(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  lessonController.updateLesson
);

/**
 * Instructor / Admin – Delete lesson
 * DELETE /api/v1/courses/:courseId/lessons/:id
 */
router.delete(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  lessonController.deleteLesson
);

export default router;
