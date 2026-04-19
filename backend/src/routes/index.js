import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import courseRoutes from "./course.routes.js";
import lessonRoutes from "./lesson.routes.js";
import enrollmentRoutes from "./enrollment.routes.js";
import adminRoutes from "./admin.routes.js";
import instructorRoutes from "./instructor.routes.js";
import studentRoutes from "./student.routes.js";
import categoryRoutes from "./category.routes.js";
import publicRoutes from "./public.routes.js";
import uploadRoutes from "./upload.routes.js";
import courseThumbnailRoutes from "./courseThumbnail.routes.js";
import paymentRoutes from "./payment.routes.js";

const router = Router();

// Public & protected routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/courses", courseRoutes);
router.use("/lessons", lessonRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/categories", categoryRoutes);
router.use("/upload", uploadRoutes);
router.use("/upload", courseThumbnailRoutes);
router.use("/payment", paymentRoutes);
router.use("/", publicRoutes);

// Admin-only routes
router.use("/admin", adminRoutes);
router.use("/instructor", instructorRoutes);
router.use("/student", studentRoutes);

export default router;
