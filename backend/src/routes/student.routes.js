import { Router } from "express";
import { protect } from "../middlewares/protect.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { getStudentDashboard } from "../controllers/student/dashboard.controller.js";
import {
  getStudentCourses,
  getStudentCourseById,
  toggleStudentCourseLike,
} from "../controllers/student/course.controller.js";
import {
  getStudentProgress,
  toggleStudentLessonProgress,
} from "../controllers/student/progress.controller.js";
import {
  getStudentCourseLessons,
  getStudentLastLesson,
  saveStudentLessonProgress,
} from "../controllers/student/learning.controller.js";
import {
  getStudentAssignments,
  submitStudentAssignment,
} from "../controllers/student/assignment.controller.js";
import { getStudentCertificates } from "../controllers/student/certificate.controller.js";
import {
  getStudentMessages,
  sendStudentMessage,
} from "../controllers/student/message.controller.js";
import {
  getStudentProfile,
  updateStudentProfile,
} from "../controllers/student/profile.controller.js";

const router = Router();

router.use(protect);
router.use(authorize("student"));

router.get("/dashboard", getStudentDashboard);
router.get("/courses", getStudentCourses);
router.get("/courses/:courseId", getStudentCourseById);
router.post("/courses/:courseId/like", toggleStudentCourseLike);
router.get("/course/:courseId/lessons", getStudentCourseLessons);
router.get("/course/:courseId/last-lesson", getStudentLastLesson);
router.get("/course/:id", getStudentCourseById);
router.post("/progress", saveStudentLessonProgress);
router.get("/progress", getStudentProgress);
router.patch("/progress/lesson/:lessonId", toggleStudentLessonProgress);
router.get("/assignments", getStudentAssignments);
router.post("/submit-assignment", submitStudentAssignment);
router.get("/certificates", getStudentCertificates);
router.route("/messages").get(getStudentMessages).post(sendStudentMessage);
router.route("/profile").get(getStudentProfile).put(updateStudentProfile);

export default router;
