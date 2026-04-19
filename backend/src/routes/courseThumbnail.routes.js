import { Router } from "express";
import { protect } from "../middlewares/protect.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { uploadCourseThumbnail as uploadCourseThumbnailMiddleware } from "../middlewares/courseThumbnail.upload.js";
import { uploadCourseThumbnail } from "../controllers/courseThumbnail.controller.js";

const router = Router();

router.use(protect);
router.use(authorize("instructor", "admin"));

router.post("/course-thumbnail", uploadCourseThumbnailMiddleware, uploadCourseThumbnail);

export default router;
