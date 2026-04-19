import Course from "../models/Course.model.js";
import Category from "../models/Category.model.js";
import Lesson from "../models/Lesson.model.js";
import Enrollment from "../models/Enrollment.model.js";
import User from "../models/User.model.js";
import { AppError } from "../utils/AppError.js";
import mongoose from "mongoose";
import {
  applyCourseLikeSummary,
  getCourseLikeSummary,
} from "./course-like.service.js";

const resolveCategoryFields = async (categoryId) => {
  const category = await Category.findOne({
    _id: categoryId,
    isActive: true,
  }).select("name");

  if (!category) {
    throw new AppError("Category not found or inactive", 400);
  }

  return {
    categoryId: category._id,
    category: category.name,
  };
};

const populateCourseQuery = (query) =>
  query
    .populate("instructor", "name email")
    .populate("categoryId", "name slug isActive");

const resolveThumbnailFields = (data = {}) => {
  const resolvedThumbnail = data.thumbnailUrl ?? data.thumbnail;

  if (resolvedThumbnail === undefined) {
    return {};
  }

  return {
    thumbnail: resolvedThumbnail,
    thumbnailUrl: resolvedThumbnail,
  };
};

const resolveDocumentFields = (data = {}) => {
  if (!Array.isArray(data.documents)) {
    return {};
  }

  return {
    documents: data.documents
      .map((document) => ({
        title: document?.title?.trim?.() || "",
        fileUrl: document?.fileUrl,
        fileName: document?.fileName,
        uploadedAt: document?.uploadedAt || new Date(),
      }))
      .filter((document) => document.fileUrl && document.fileName),
  };
};

const isAdminUser = (user) => user?.role === "admin";

const getRequestedPublishedValue = (data = {}) => data.published ?? data.isPublished;

const serializeCourseObject = (course, { includeDocuments = false } = {}) => {
  const courseObject = course.toObject();

  return {
    ...courseObject,
    likesCount: 0,
    isLiked: false,
    documents: includeDocuments ? courseObject.documents || [] : [],
  };
};

const assertValidCourseId = (courseId) => {
  if (!courseId) {
    throw new AppError("Course ID is required", 400);
  }

  if (!mongoose.isValidObjectId(courseId)) {
    throw new AppError("Invalid course ID", 400);
  }
};

const buildLessonResponse = (lesson, { hasFullAccess }) => {
  const lessonObject = lesson.toObject();
  const previewExcerpt =
    lessonObject.content && lessonObject.content.length > 280
      ? `${lessonObject.content.slice(0, 280).trim()}...`
      : lessonObject.content;

  return {
    ...lessonObject,
    content: hasFullAccess ? lessonObject.content : previewExcerpt,
    videoUrl: hasFullAccess || lessonObject.isPreview ? lessonObject.videoUrl : undefined,
    pdfUrl: hasFullAccess || lessonObject.isPreview ? lessonObject.pdfUrl : undefined,
    locked: !hasFullAccess && !lessonObject.isPreview,
  };
};

const getCourseAccessState = async (course, user) => {
  if (!user) {
    return {
      isAuthenticated: false,
      isEnrolled: false,
      hasFullAccess: false,
      previewOnly: true,
    };
  }

  if (user.role === "admin") {
    return {
      isAuthenticated: true,
      isEnrolled: true,
      hasFullAccess: true,
      previewOnly: false,
    };
  }

  if (user.role === "instructor" && String(course.instructor?._id || course.instructor) === String(user._id || user.id)) {
    return {
      isAuthenticated: true,
      isEnrolled: true,
      hasFullAccess: true,
      previewOnly: false,
    };
  }

  if (user.role !== "student") {
    return {
      isAuthenticated: true,
      isEnrolled: false,
      hasFullAccess: false,
      previewOnly: true,
    };
  }

  const enrollment = await Enrollment.findOne({
    student: user._id || user.id,
    course: course._id,
  }).select("_id");

  const isEnrolled = Boolean(enrollment);

  return {
    isAuthenticated: true,
    isEnrolled,
    hasFullAccess: isEnrolled,
    previewOnly: !isEnrolled,
  };
};

const attachPreviewLessons = async (courses, user = null) => {
  if (!courses.length) {
    return [];
  }

  const likeSummary = await getCourseLikeSummary({
    courseIds: courses.map((course) => course._id),
    studentId: user?._id || user?.id || null,
  });

  const previewLessons = await Lesson.find({
    course: { $in: courses.map((course) => course._id) },
    published: true,
    isPreview: true,
  })
    .sort({ order: 1, createdAt: 1 })
    .select("title videoUrl isPreview order course");

  const previewMap = new Map();

  previewLessons.forEach((lesson) => {
    const key = String(lesson.course);

    if (!previewMap.has(key)) {
      previewMap.set(key, lesson.toObject());
    }
  });

  return courses.map((course) => {
    const courseObject = applyCourseLikeSummary(
      serializeCourseObject(course, { includeDocuments: false }),
      likeSummary
    );
    return {
      ...courseObject,
      previewLesson: previewMap.get(String(course._id)) || null,
      isPublished: courseObject.published,
    };
  });
};

export const getAllCourses = async ({ limit, user = null, includeUnpublished = false } = {}) => {
  const parsedLimit = Number(limit);
  const shouldIncludeUnpublished = includeUnpublished || isAdminUser(user);
  const query = populateCourseQuery(
    Course.find(shouldIncludeUnpublished ? {} : { published: true }).sort({
      isFeatured: -1,
      studentsEnrolled: -1,
      createdAt: -1,
    })
  );

  if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
    query.limit(parsedLimit);
  }

  const courses = await query;
  return attachPreviewLessons(courses, user);
};

export const getCourseById = async (id, user = null) => {
  assertValidCourseId(id);

  const course = await populateCourseQuery(
    Course.findOne({
      _id: id,
      published: true,
    })
  );

  if (!course) throw new AppError("Course not found", 404);

  const allPublishedLessons = await Lesson.find({
    course: id,
    published: true,
  })
    .sort({ order: 1, createdAt: 1 })
    .select("title content videoUrl pdfUrl order isPreview course");

  const access = await getCourseAccessState(course, user);
  const likeSummary = await getCourseLikeSummary({
    courseIds: [course._id],
    studentId: user?._id || user?.id || null,
  });
  const visibleLessons = access.hasFullAccess
    ? allPublishedLessons
    : allPublishedLessons.filter((lesson) => lesson.isPreview);
  const courseObject = applyCourseLikeSummary(
    serializeCourseObject(course, {
      includeDocuments: access.hasFullAccess,
    }),
    likeSummary
  );
  const serializedLessons = visibleLessons.map((lesson) =>
    buildLessonResponse(lesson, {
      hasFullAccess: access.hasFullAccess,
    })
  );

  return {
    ...courseObject,
    lessons: serializedLessons,
    previewLesson: serializedLessons.find((lesson) => lesson.isPreview) || null,
    isPublished: courseObject.published,
    access: {
      ...access,
      accessibleLessonCount: serializedLessons.length,
      totalPublishedLessons: allPublishedLessons.length,
      lockedLessonCount: Math.max(allPublishedLessons.length - serializedLessons.length, 0),
    },
  };
};

export const getCoursePreview = async (id) => {
  assertValidCourseId(id);

  const course = await populateCourseQuery(
    Course.findOne({
      _id: id,
      published: true,
    })
  );

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const previewLessons = await Lesson.find({
    course: id,
    published: true,
    isPreview: true,
  })
    .sort({ order: 1, createdAt: 1 })
    .select("title videoUrl order isPreview course");

  const courseObject = applyCourseLikeSummary(
    serializeCourseObject(course, { includeDocuments: false }),
    await getCourseLikeSummary({ courseIds: [course._id] })
  );

  return {
    ...courseObject,
    previewLessons: previewLessons.map((lesson) => lesson.toObject()),
    previewLesson: previewLessons[0]?.toObject?.() || null,
    isPublished: courseObject.published,
  };
};

export const getPublicStats = async () => {
  const [totalUsers, totalStudents, totalCourses, totalEnrollments] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    Course.countDocuments({ published: true }),
    Enrollment.countDocuments(),
  ]);

  return {
    totalUsers,
    totalStudents,
    totalCourses,
    totalEnrollments,
  };
};

export const createCourse = async (data, user) => {
  const categoryFields = await resolveCategoryFields(data.categoryId);
  const requestedPublishedValue = getRequestedPublishedValue(data);
  const normalizedPayload = {
    ...data,
    ...categoryFields,
    ...resolveThumbnailFields(data),
    ...resolveDocumentFields(data),
    isFeatured: Boolean(data.isFeatured),
    studentsEnrolled: Number.isFinite(Number(data.studentsEnrolled))
      ? Number(data.studentsEnrolled)
      : 0,
    instructor: user.id,
    published: isAdminUser(user) ? Boolean(requestedPublishedValue) : false,
  };

  delete normalizedPayload.isPublished;

  return await Course.create(normalizedPayload);
};

export const updateCourse = async (id, data, user) => {
  const existingCourse = await Course.findById(id);

  if (!existingCourse) throw new AppError("Course not found", 404);

  if (user?.role === "instructor" && String(existingCourse.instructor) !== String(user.id)) {
    throw new AppError("You do not have permission to update this course", 403);
  }

  const updatePayload = { ...data };

  Object.assign(updatePayload, resolveThumbnailFields(data));
  Object.assign(updatePayload, resolveDocumentFields(data));

  if (data.categoryId !== undefined) {
    Object.assign(updatePayload, await resolveCategoryFields(data.categoryId));
  }

  const requestedPublishedValue = getRequestedPublishedValue(data);

  if (requestedPublishedValue !== undefined) {
    if (isAdminUser(user)) {
      updatePayload.published = Boolean(requestedPublishedValue);
    } else {
      delete updatePayload.published;
    }
  }

  delete updatePayload.isPublished;

  const course = await Course.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  });

  return populateCourseQuery(Course.findById(course._id));
};

export const deleteCourse = async (id, user) => {
  const existingCourse = await Course.findById(id);

  if (!existingCourse) throw new AppError("Course not found", 404);

  if (user?.role === "instructor" && String(existingCourse.instructor) !== String(user.id)) {
    throw new AppError("You do not have permission to delete this course", 403);
  }

  const course = await Course.findByIdAndDelete(id);
  if (!course) throw new AppError("Course not found", 404);
};
