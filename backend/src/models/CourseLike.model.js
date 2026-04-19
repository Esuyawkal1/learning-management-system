import mongoose from "mongoose";

const courseLikeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

courseLikeSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
courseLikeSchema.index({ courseId: 1, createdAt: -1 });

const CourseLike = mongoose.model("CourseLike", courseLikeSchema);

export default CourseLike;
