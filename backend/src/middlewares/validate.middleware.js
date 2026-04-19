import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";

export const validateObjectIdField = (fieldName, { required = false } = {}) => {
  return (req, res, next) => {
    const value = req.body?.[fieldName];

    if ((value === undefined || value === null || value === "") && required) {
      return next(new AppError(`${fieldName} is required`, 400));
    }

    if (value !== undefined && value !== null && value !== "" && !mongoose.Types.ObjectId.isValid(value)) {
      return next(new AppError(`${fieldName} must be a valid ObjectId`, 400));
    }

    next();
  };
};

export const validateCategoryId = (required = false) =>
  validateObjectIdField("categoryId", { required });
