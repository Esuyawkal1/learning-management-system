import { Router } from "express";
import { protect } from "../middlewares/protect.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { getInstructorDashboard } from "../controllers/instructor/dashboard.controller.js";
import {
  createInstructorCourse,
  deleteInstructorCourse,
  getInstructorCourses,
  toggleInstructorCoursePublishState,
  updateInstructorCourse,
} from "../controllers/instructor/course.controller.js";
import {
  createInstructorLesson,
  deleteInstructorLesson,
  getInstructorLessons,
  reorderInstructorLessons,
  updateInstructorLesson,
} from "../controllers/instructor/lesson.controller.js";
import { getInstructorStudents } from "../controllers/instructor/student.controller.js";
import { getInstructorAnalytics } from "../controllers/instructor/analytics.controller.js";
import {
  getInstructorProfile,
  updateInstructorProfile,
} from "../controllers/instructor/profile.controller.js";
import {
  getInstructorMessages,
  sendInstructorMessage,
} from "../controllers/instructor/message.controller.js";
import { validateCategoryId } from "../middlewares/validate.middleware.js";

const router = Router();

router.use(protect);
router.use(authorize("instructor"));

router.get("/dashboard", getInstructorDashboard);

router.route("/courses").get(getInstructorCourses).post(validateCategoryId(true), createInstructorCourse);
router
  .route("/courses/:courseId")
  .put(validateCategoryId(false), updateInstructorCourse)
  .delete(deleteInstructorCourse);
router.patch("/courses/:courseId/publish", toggleInstructorCoursePublishState);

router.route("/lessons").get(getInstructorLessons).post(createInstructorLesson);
router.route("/lessons/:lessonId").put(updateInstructorLesson).delete(deleteInstructorLesson);
router.patch("/courses/:courseId/reorder-lessons", reorderInstructorLessons);

router.get("/students", getInstructorStudents);
router.get("/analytics", getInstructorAnalytics);

router.route("/profile").get(getInstructorProfile).put(updateInstructorProfile);

router.route("/messages").get(getInstructorMessages).post(sendInstructorMessage);

export default router;
