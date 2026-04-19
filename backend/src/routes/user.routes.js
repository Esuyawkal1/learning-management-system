// src/routes/user.routes.js
import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { protect } from "../middlewares/protect.middleware.js"; 
import { restrictTo } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * Admin only – test route
 */
router.get(
  "/admin-only",
  protect,
  restrictTo("admin"),
  (req, res) => {
    res.json({ message: "Welcome Admin" });
  }
);

/**
 * Admin-only: list all users
 */
router.get("/", protect, restrictTo("admin"), userController.getAllUsers);

/**
 * Get single user (any authenticated user)
 */
router.get("/:id", protect, userController.getUserById);

/**
 * Update user (any authenticated user)
 */
router.put("/:id", protect, userController.updateUser);

/**
 * Delete user (Admin only)
 */
router.delete("/:id", protect, restrictTo("admin"), userController.deleteUser);

export default router;