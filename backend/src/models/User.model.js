

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },

    password: {
      type: String,
      required: function () {
        return this.authProvider !== "google";
      },
      minlength: 6,
      select: false,
    },

    authProvider: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      select: false,
    },

    emailVerified: {
      type: Boolean,
      default: true,
    },

    emailVerificationCode: {
      type: String,
      select: false,
    },

    emailVerificationExpiresAt: {
      type: Date,
      select: false,
    },

    passwordResetCode: {
      type: String,
      select: false,
    },

    passwordResetExpiresAt: {
      type: Date,
      select: false,
    },

    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profileImage: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ================= HASH PASSWORD =================
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ================= COMPARE PASSWORD METHOD =================
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  if (!candidatePassword || !userPassword) return false;
  return bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
export default User;
