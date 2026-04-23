import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Using Database: ${conn.connection.name}`);
    
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};