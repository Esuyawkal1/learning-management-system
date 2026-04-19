import mongoose from "mongoose";

const lessonProgressSchema = new mongoose.Schema(
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
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    mediaDurationSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

lessonProgressSchema.index(
  { studentId: 1, courseId: 1, lessonId: 1 },
  { unique: true }
);
lessonProgressSchema.index({ studentId: 1, courseId: 1, lastAccessedAt: -1 });

const LessonProgress = mongoose.model("LessonProgress", lessonProgressSchema);

export default LessonProgress;
