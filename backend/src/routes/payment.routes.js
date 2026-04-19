import { Router } from "express";
import { protect } from "../middlewares/protect.middleware.js";
import * as paymentController from "../controllers/payment.controller.js";

const router = Router();

router.post("/initialize", protect, paymentController.initializePayment);
router.get("/verify", paymentController.handlePaymentCallback);
router.get("/verify/:txRef", paymentController.verifyPayment);

export default router;
