
import express from "express";
import {
  getAnalyticsStats,
  getDashboardStats,
} from "../controllers/admin/dashboard.controller.js";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  updateCourse,
} from "../controllers/course.controller.js";
import { protect } from "../middlewares/protect.middleware.js";
import {
  deleteAdminEnrollment,
  getAllAdminEnrollments,
  getEnrollmentsStats,
} from "../controllers/admin/enrollment.controller.js";
import { restrictTo } from "../middlewares/auth.middleware.js"; // safe role check
import {
  createAdminUser,
  deleteAdminUser,
  getAllAdminUsers,
  getUsersStats,
  updateAdminUser,
} from "../controllers/admin/user.controller.js";
import {
  createAdminLesson,
  deleteAdminLesson,
  getAdminLessons,
  updateAdminLesson,
} from "../controllers/admin/lesson.controller.js";
import { validateCategoryId } from "../middlewares/validate.middleware.js";

const router = express.Router();

// Protect and restrict admin
router.use(protect);
router.use(restrictTo("admin"));

// Admin routes

router.get("/dashboard", getDashboardStats);
router.get("/analytics", getAnalyticsStats);

router.route("/courses").get(getAllCourses).post(validateCategoryId(true), createCourse);
router.route("/courses/:id").put(validateCategoryId(false), updateCourse).delete(deleteCourse);

router.get("/users/stats", getUsersStats);
router.route("/users").get(getAllAdminUsers).post(createAdminUser);
router.route("/users/:id").put(updateAdminUser).delete(deleteAdminUser);

router.route("/lessons").get(getAdminLessons).post(createAdminLesson);
router.route("/lessons/:id").put(updateAdminLesson).delete(deleteAdminLesson);

router.get("/enrollments/stats", getEnrollmentsStats);
router.route("/enrollments").get(getAllAdminEnrollments);
router.route("/enrollments/:id").delete(deleteAdminEnrollment);

export default router;
