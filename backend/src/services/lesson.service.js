import Lesson from "../models/Lesson.model.js";
import { AppError } from "../utils/AppError.js";
import Enrollment from "../models/Enrollment.model.js";
import Course from "../models/Course.model.js";
import mongoose from "mongoose";

const assertValidCourseId = (courseId) => {
  if (!courseId) {
    throw new AppError("Course ID is required", 400);
  }

  if (!mongoose.isValidObjectId(courseId)) {
    throw new AppError("Invalid course ID", 400);
  }
};

export const getLessonsByCourse = async (courseId, user) => {
  assertValidCourseId(courseId);

  const course = await Course.findById(courseId);
  if (!course) throw new AppError("Course not found", 404);

  // Admin & Instructor → see everything
  if (user.role === "admin" || user.role === "instructor") {
    return await Lesson.find({ course: courseId }).sort("order");
  }

  // Student → must be enrolled
  const enrollment = await Enrollment.findOne({
    student: user._id,
    course: courseId,
  });

  if (!enrollment) {
    throw new AppError("You must enroll to access lessons", 403);
  }

  // Enrolled student → only published lessons
  return await Lesson.find({
    course: courseId,
    published: true,
  }).sort("order");
};
export const publishLesson = async (lessonId, user) => {
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  // Only admin or instructor
  if (user.role !== "admin" && user.role !== "instructor") {
    throw new AppError("Not authorized to publish lessons", 403);
  }

  if (user.role === "instructor") {
    const course = await Course.findById(lesson.course);

    if (!course || String(course.instructor) !== String(user.id)) {
      throw new AppError("Not authorized to publish this lesson", 403);
    }
  }

  lesson.published = true;
  await lesson.save();

  return lesson;
};

export const createLesson = async (data, user) => {
  const course = await Course.findById(data.course);

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (user?.role === "instructor" && String(course.instructor) !== String(user.id)) {
    throw new AppError("Not authorized to create lessons for this course", 403);
  }

  return await Lesson.create({
    ...data,
    isPreview: Boolean(data.isPreview),
  });
};

export const updateLesson = async (id, data, user) => {
  const existingLesson = await Lesson.findById(id).populate("course");

  if (!existingLesson) throw new AppError("Lesson not found", 404);

  if (user?.role === "instructor" && String(existingLesson.course?.instructor) !== String(user.id)) {
    throw new AppError("Not authorized to update this lesson", 403);
  }

  const payload = {
    ...data,
    ...(data.isPreview !== undefined ? { isPreview: Boolean(data.isPreview) } : {}),
  };

  const lesson = await Lesson.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return lesson;
};

export const deleteLesson = async (id, user) => {
  const existingLesson = await Lesson.findById(id).populate("course");

  if (!existingLesson) throw new AppError("Lesson not found", 404);

  if (user?.role === "instructor" && String(existingLesson.course?.instructor) !== String(user.id)) {
    throw new AppError("Not authorized to delete this lesson", 403);
  }

  const lesson = await Lesson.findByIdAndDelete(id);

  if (!lesson) throw new AppError("Lesson not found", 404);

  return lesson;
};
