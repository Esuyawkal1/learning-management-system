import Category from "../models/Category.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";

const defaultCategories = [
  {
    name: "AI & Machine Learning",
    description: "Artificial intelligence, machine learning, and deep learning programs.",
  },
  {
    name: "Business & Marketing",
    description: "Business growth, digital marketing, strategy, and leadership courses.",
  },
  {
    name: "Cloud Computing",
    description: "Cloud platforms, DevOps, infrastructure, and deployment topics.",
  },
  {
    name: "Cybersecurity",
    description: "Security fundamentals, ethical hacking, and secure system practices.",
  },
  {
    name: "Data Science",
    description: "Data analysis, statistics, visualization, and applied machine learning.",
  },
  {
    name: "Mobile Development",
    description: "Android, iOS, React Native, and cross-platform mobile engineering.",
  },
  {
    name: "UI/UX Design",
    description: "User interface, user experience, prototyping, and design systems.",
  },
  {
    name: "Web Development",
    description: "Frontend, backend, and full-stack web application development.",
  },
];

const buildSlug = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const ensureDefaultCategories = async () => {
  const categoryCount = await Category.countDocuments();

  if (categoryCount > 0) {
    return;
  }

  await Category.insertMany(
    defaultCategories.map((category) => ({
      ...category,
      slug: buildSlug(category.name),
      isActive: true,
    }))
  );
};

export const createCategory = asyncHandler(async (req, res) => {
  const slug = buildSlug(req.body.slug || req.body.name);

  const category = await Category.create({
    name: req.body.name,
    slug,
    description: req.body.description,
    isActive: req.body.isActive !== false,
    createdBy: req.user.id,
  });

  return successResponse(res, category, "Category created successfully", 201);
});

export const getAllCategories = asyncHandler(async (req, res) => {
  await ensureDefaultCategories();

  const categories = await Category.find()
    .sort({ name: 1 })
    .populate("createdBy", "name email");

  return successResponse(res, categories);
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).populate("createdBy", "name email");

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return successResponse(res, category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const updatePayload = {
    name: req.body.name,
    description: req.body.description,
    isActive: req.body.isActive,
  };

  if (req.body.slug || req.body.name) {
    updatePayload.slug = buildSlug(req.body.slug || req.body.name);
  }

  const sanitizedPayload = Object.fromEntries(
    Object.entries(updatePayload).filter(([, value]) => value !== undefined)
  );

  const category = await Category.findByIdAndUpdate(req.params.id, sanitizedPayload, {
    new: true,
    runValidators: true,
  }).populate("createdBy", "name email");

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return successResponse(res, category, "Category updated successfully");
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return successResponse(res, null, "Category deleted successfully");
});
