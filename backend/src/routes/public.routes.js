import { Router } from "express";
import {
  getPlatformStats,
  submitPublicContactMessage,
} from "../controllers/public.controller.js";

const router = Router();

router.get("/stats", getPlatformStats);
router.post("/contact", submitPublicContactMessage);

export default router;
