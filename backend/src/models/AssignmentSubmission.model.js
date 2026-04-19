import mongoose from "mongoose";

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    submissionText: {
      type: String,
      trim: true,
    },
    attachmentUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["submitted", "late", "graded", "returned"],
      default: "submitted",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    grade: {
      type: Number,
      min: 0,
    },
    feedback: {
      type: String,
      trim: true,
    },
    gradedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

assignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

const AssignmentSubmission = mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);

export default AssignmentSubmission;
