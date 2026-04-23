
import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    videoUrl: {
      type: String,
      trim: true,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    pdfUrl: {
      type: String,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true, // improves query performance by course
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

lessonSchema.index({ course: 1, order: 1 });
lessonSchema
  .virtual("courseId")
  .get(function () {
    return this.course;
  })
  .set(function (value) {
    this.course = value;
  });

lessonSchema.set("toObject", { virtuals: true });
lessonSchema.set("toJSON", { virtuals: true });

const Lesson = mongoose.model("Lesson", lessonSchema);

export default Lesson;
