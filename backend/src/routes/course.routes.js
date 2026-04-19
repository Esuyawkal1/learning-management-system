import { Router } from "express";
import * as courseController from "../controllers/course.controller.js";
import { optionalProtect, protect } from "../middlewares/protect.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { validateCategoryId } from "../middlewares/validate.middleware.js";
import lessonRouter from "./lesson.routes.js";

const router = Router();

/**
 * Public
 */
router.get("/", optionalProtect, courseController.getAllCourses);
router.get("/:id/preview", courseController.getCoursePreview);
router.get("/:id", optionalProtect, courseController.getCourseById);

/**
 * Instructor / Admin
 */

router.post(
  "/",
  protect,
  validateCategoryId(true),
  authorize("instructor", "admin"),
  courseController.createCourse
);

router.put(
  "/:id",
  protect,
  validateCategoryId(false),
  authorize("instructor", "admin"),
  courseController.updateCourse
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  courseController.deleteCourse
);

/**
 * Nested Lessons Router
 * Mount lesson routes under /:courseId/lessons
 */
router.use("/:courseId/lessons", lessonRouter);

export default router;
