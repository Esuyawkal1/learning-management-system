import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/category.controller.js";
import { protect } from "../middlewares/protect.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

router.route("/").get(getAllCategories).post(protect, authorize("admin"), createCategory);
router
  .route("/:id")
  .get(getCategoryById)
  .put(protect, authorize("admin"), updateCategory)
  .delete(protect, authorize("admin"), deleteCategory);

export default router;
