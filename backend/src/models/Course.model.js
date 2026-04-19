import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    category: {
      type: String,
      trim: true,
    },
    thumbnail: {
      type: String,
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      default: "",
      trim: true,
    },
    documents: {
      type: [
        {
          title: {
            type: String,
            trim: true,
            default: "",
          },
          fileUrl: {
            type: String,
            required: true,
            trim: true,
          },
          fileName: {
            type: String,
            required: true,
            trim: true,
          },
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    price: {
      type: Number,
      default: 0,
    },
    published: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    studentsEnrolled: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

/*
Virtual relationship
Course -> Lessons
This does NOT store lessons inside course.
It only allows populate("lessons")
*/
courseSchema.virtual("lessons", {
  ref: "Lesson",
  localField: "_id",
  foreignField: "course",
});

courseSchema
  .virtual("isPublished")
  .get(function () {
    return this.published;
  })
  .set(function (value) {
    this.published = value;
  });

/* Allow virtual fields in JSON responses */
courseSchema.set("toObject", { virtuals: true });
courseSchema.set("toJSON", { virtuals: true });

courseSchema.index({ published: 1, isFeatured: -1, createdAt: -1 });

const Course = mongoose.model("Course", courseSchema);

export default Course;
