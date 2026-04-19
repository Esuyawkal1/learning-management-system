import Enrollment from "../models/Enrollment.model.js";
import Course from "../models/Course.model.js";
import { AppError } from "../utils/AppError.js";
import mongoose from "mongoose";

const assertValidCourseId = (courseId) => {
  if (!courseId) {
    throw new AppError("Course ID is required", 400);
  }

  if (!mongoose.isValidObjectId(courseId)) {
    throw new AppError("Invalid course ID", 400);
  }
};

const getCourseOrThrow = async (courseId) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  return course;
};

const findEnrollment = async (userId, courseId) => {
  return Enrollment.findOne({
    student: userId,
    course: courseId,
  });
};

const createEnrollmentRecord = async (userId, courseId) => {
  try {
    return await Enrollment.create({
      student: userId,
      course: courseId,
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError("Already enrolled in this course", 400);
    }

    throw error;
  }
};

const incrementStudentCount = async (course) => {
  course.studentsEnrolled = Math.max((course.studentsEnrolled || 0) + 1, 0);
  await course.save();
};

export const enrollCourse = async (userId, courseId) => {
  assertValidCourseId(courseId);

  const course = await getCourseOrThrow(courseId);

  const existing = await findEnrollment(userId, courseId);

  if (existing) {
    throw new AppError("Already enrolled in this course", 400);
  }

  const enrollment = await createEnrollmentRecord(userId, courseId);
  await incrementStudentCount(course);

  return enrollment;
};

export const ensureCourseEnrollment = async (userId, courseId) => {
  assertValidCourseId(courseId);

  const course = await getCourseOrThrow(courseId);
  const existing = await findEnrollment(userId, courseId);

  if (existing) {
    return {
      enrollment: existing,
      alreadyEnrolled: true,
    };
  }

  try {
    const enrollment = await Enrollment.create({
      student: userId,
      course: courseId,
    });

    await incrementStudentCount(course);

    return {
      enrollment,
      alreadyEnrolled: false,
    };
  } catch (error) {
    if (error?.code === 11000) {
      const enrollment = await findEnrollment(userId, courseId);

      return {
        enrollment,
        alreadyEnrolled: true,
      };
    }

    throw error;
  }
};

export const getMyCourses = async (userId) => {
  return await Enrollment.find({ student: userId }).populate("course");
};
