
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { AppError } from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const getRequestToken = (req) => {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
};

const getAuthenticatedUser = async (token) => {
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_error) {
    throw new AppError("Invalid token", 401);
  }

  const user = await User.findById(decoded.id || decoded._id);

  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  return user;
};

export const protect = asyncHandler(async (req, res, next) => {
  const token = getRequestToken(req);

  if (!token) {
    return next(new AppError("Not authorized, no token", 401));
  }

  req.user = await getAuthenticatedUser(token);
  next();
});

export const optionalProtect = asyncHandler(async (req, res, next) => {
  const token = getRequestToken(req);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    req.user = await getAuthenticatedUser(token);
  } catch (_error) {
    req.user = null;
  }

  next();
});
