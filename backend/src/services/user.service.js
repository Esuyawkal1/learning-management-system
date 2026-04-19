import User from "../models/User.model.js";
import { AppError } from "../utils/AppError.js";

export const getAllUsers = async () => {
  return await User.find();
};

export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new AppError("User not found", 404);
  return user;
};

export const updateUser = async (id, data) => {
  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new AppError("User not found", 404);
  return user;
};

export const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new AppError("User not found", 404);
};