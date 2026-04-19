import { Router } from "express";
import { protect } from "../middlewares/protect.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
  uploadCourseDocument as uploadCourseDocumentMiddleware,
  uploadPdf,
  uploadProfileImage as uploadProfileImageMiddleware,
  uploadVideo,
} from "../middlewares/upload.middleware.js";
import {
  uploadCourseDocument,
  uploadLessonPdf,
  uploadProfileImage,
  uploadLessonVideo,
} from "../controllers/upload.controller.js";

const router = Router();

router.use(protect);

router.post("/profile-image", uploadProfileImageMiddleware, uploadProfileImage);

router.use(authorize("instructor", "admin"));

router.post("/video", uploadVideo, uploadLessonVideo);
router.post("/pdf", uploadPdf, uploadLessonPdf);
router.post(
  "/course-document",
  uploadCourseDocumentMiddleware,
  uploadCourseDocument
);

export default router;
