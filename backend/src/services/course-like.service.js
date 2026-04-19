import mongoose from "mongoose";
import CourseLike from "../models/CourseLike.model.js";

const toObjectIdList = (courseIds = []) =>
  [...new Set(courseIds.map((courseId) => String(courseId || "")).filter(Boolean))]
    .filter((courseId) => mongoose.isValidObjectId(courseId))
    .map((courseId) => new mongoose.Types.ObjectId(courseId));

export const getCourseLikeSummary = async ({ courseIds = [], studentId = null } = {}) => {
  const normalizedCourseIds = toObjectIdList(courseIds);

  if (!normalizedCourseIds.length) {
    return {
      likesCountByCourse: {},
      likedCourseIds: new Set(),
    };
  }

  const [likeCounts, likedRows] = await Promise.all([
    CourseLike.aggregate([
      {
        $match: {
          courseId: { $in: normalizedCourseIds },
        },
      },
      {
        $group: {
          _id: "$courseId",
          count: { $sum: 1 },
        },
      },
    ]),
    studentId && mongoose.isValidObjectId(studentId)
      ? CourseLike.find({
          studentId,
          courseId: { $in: normalizedCourseIds },
        }).select("courseId")
      : [],
  ]);

  return {
    likesCountByCourse: likeCounts.reduce((accumulator, entry) => {
      accumulator[String(entry._id)] = Number(entry.count || 0);
      return accumulator;
    }, {}),
    likedCourseIds: new Set(likedRows.map((entry) => String(entry.courseId))),
  };
};

export const applyCourseLikeSummary = (course, likeSummary = null) => {
  const courseId = String(course?._id || "");
  const likesCount = Number(likeSummary?.likesCountByCourse?.[courseId] || 0);
  const isLiked = Boolean(likeSummary?.likedCourseIds?.has?.(courseId));

  return {
    ...course,
    likesCount,
    isLiked,
  };
};
