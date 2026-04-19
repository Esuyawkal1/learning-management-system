import mongoose from "mongoose";
import Enrollment from "../models/Enrollment.model.js";
import Lesson from "../models/Lesson.model.js";
import LessonProgress from "../models/LessonProgress.model.js";
import Progress from "../models/Progress.model.js";
import {
  getLessonProgressRatio,
  getNextTrackedTimeSpentSeconds,
  isLessonProgressCompleted,
  normalizeLessonDurationSeconds,
  normalizeTrackedSeconds,
  resolveLessonProgressTargetSeconds,
} from "../utils/lessonProgress.js";
import { AppError } from "../utils/AppError.js";

const assertValidObjectId = (value, label) => {
  if (!value) {
    throw new AppError(`${label} is required`, 400);
  }

  if (!mongoose.isValidObjectId(value)) {
    throw new AppError(`Invalid ${label.toLowerCase()}`, 400);
  }
};

const getStudentEnrollment = async (studentId, courseId) => {
  assertValidObjectId(courseId, "Course ID");

  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  }).populate({
    path: "course",
    match: { published: true },
    populate: { path: "instructor", select: "name email profileImage" },
  });

  if (!enrollment?.course) {
    throw new AppError("Course not found in your workspace", 404);
  }

  return enrollment;
};

const getPublishedCourseLessons = async (courseId) =>
  Lesson.find({
    course: courseId,
    published: true,
  }).sort({ order: 1, createdAt: 1 });

const getLessonProgressEntries = async (studentId, courseId, lessonIds) => {
  if (!lessonIds.length) {
    return [];
  }

  return LessonProgress.find({
    studentId,
    courseId,
    lessonId: { $in: lessonIds },
  });
};

const getLegacyProgressEntries = async (studentId, lessonIds) => {
  if (!lessonIds.length) {
    return [];
  }

  return Progress.find({
    student: studentId,
    lesson: { $in: lessonIds },
  });
};

const buildLessonState = (lessons, progressEntries, legacyProgressEntries = []) => {
  const progressMap = progressEntries.reduce((accumulator, entry) => {
    accumulator[String(entry.lessonId)] = entry;
    return accumulator;
  }, {});
  const legacyProgressMap = legacyProgressEntries.reduce((accumulator, entry) => {
    accumulator[String(entry.lesson)] = entry;
    return accumulator;
  }, {});

  return lessons.map((lesson) => {
    const progressEntry = progressMap[String(lesson._id)];
    const legacyProgressEntry = legacyProgressMap[String(lesson._id)];
    const lessonProgressPercentage = Math.round(
      getLessonProgressRatio(progressEntry, legacyProgressEntry) * 100
    );
    const completed = Boolean(
      progressEntry?.completed ||
        legacyProgressEntry?.completed ||
        lessonProgressPercentage >= 100
    );

    return {
      ...lesson.toObject(),
      completed,
      completedAt:
        (completed &&
          (progressEntry?.updatedAt ||
            legacyProgressEntry?.completedAt ||
            legacyProgressEntry?.updatedAt)) ||
        null,
      lastAccessedAt:
        progressEntry?.lastAccessedAt || legacyProgressEntry?.updatedAt || null,
      timeSpentSeconds: Number(progressEntry?.timeSpentSeconds || 0),
      lessonProgressPercentage,
      // Sequential locking is disabled so students can open lessons in any order.
      isLocked: false,
      isAccessible: true,
    };
  });
};

const getFirstAccessibleLessonId = (lessons) => lessons[0]?._id || null;

const getSelectableLessonId = (lessons, lessonId) => {
  if (!lessonId) {
    return null;
  }

  const lesson = lessons.find((item) => String(item._id) === String(lessonId));

  if (!lesson) {
    return null;
  }

  return lesson._id;
};

const getLastAccessedLessonId = (progressEntries, legacyProgressEntries, lessons) => {
  const latestEntry = [
    ...progressEntries.map((entry) => ({
      lessonId: entry.lessonId,
      lastAccessedAt: entry.lastAccessedAt,
    })),
    ...legacyProgressEntries.map((entry) => ({
      lessonId: entry.lesson,
      lastAccessedAt: entry.updatedAt,
    })),
  ].sort(
    (left, right) =>
      new Date(right.lastAccessedAt || 0).getTime() - new Date(left.lastAccessedAt || 0).getTime()
  )[0];

  const latestLessonId = latestEntry?.lessonId || null;
  return getSelectableLessonId(lessons, latestLessonId) || getFirstAccessibleLessonId(lessons);
};

// Reuse one snapshot shape for the initial lesson page load and later progress updates.
const buildLearningSnapshot = async (studentId, courseId) => {
  const enrollment = await getStudentEnrollment(studentId, courseId);
  const lessons = await getPublishedCourseLessons(courseId);
  const lessonIds = lessons.map((lesson) => lesson._id);
  const [progressEntries, legacyProgressEntries] = await Promise.all([
    getLessonProgressEntries(studentId, courseId, lessonIds),
    getLegacyProgressEntries(studentId, lessonIds),
  ]);
  const learningLessons = buildLessonState(lessons, progressEntries, legacyProgressEntries);
  const completedLessons = learningLessons.filter((lesson) => lesson.completed).length;
  const totalLessons = learningLessons.length;
  const progressUnits = learningLessons.reduce(
    (sum, lesson) => sum + Number(lesson.lessonProgressPercentage || 0) / 100,
    0
  );
  const progressPercentage = totalLessons
    ? Math.round((progressUnits / totalLessons) * 100)
    : 0;
  const lastLessonId = getLastAccessedLessonId(
    progressEntries,
    legacyProgressEntries,
    learningLessons
  );
  const currentLessonId =
    getSelectableLessonId(learningLessons, lastLessonId) || getFirstAccessibleLessonId(learningLessons);

  return {
    course: {
      ...enrollment.course.toObject(),
      enrolledAt: enrollment.enrolledAt || enrollment.createdAt,
    },
    lessons: learningLessons,
    progress: {
      completedLessons,
      totalLessons,
      progressPercentage,
    },
    currentLessonId,
    lastLessonId,
  };
};

// Mirror completion/access updates into the existing Progress collection so older
// student workspace screens keep their counts and resume data in sync.
const syncLegacyProgress = async ({ studentId, lessonId, completed }) => {
  const filter = {
    student: studentId,
    lesson: lessonId,
  };
  const update = {
    $setOnInsert: {
      student: studentId,
      lesson: lessonId,
    },
    $set: {
      completed: Boolean(completed),
      completedAt: completed ? new Date() : null,
    },
  };

  await Progress.findOneAndUpdate(filter, update, {
    upsert: true,
    returnDocument: "after",
    setDefaultsOnInsert: true,
    runValidators: true,
  });
};

const assertLessonIsAccessible = (lessons, lessonId) => {
  const lesson = lessons.find((item) => String(item._id) === String(lessonId));

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  return lesson;
};

export const getStudentCourseLessons = async (studentId, courseId) =>
  buildLearningSnapshot(studentId, courseId);

export const getStudentLastLesson = async (studentId, courseId) => {
  const snapshot = await buildLearningSnapshot(studentId, courseId);

  return {
    lessonId: snapshot.lastLessonId || snapshot.currentLessonId || null,
  };
};

export const saveStudentLessonProgress = async (
  studentId,
  { courseId, lessonId, completed, secondsSpent, durationSeconds }
) => {
  assertValidObjectId(courseId, "Course ID");
  assertValidObjectId(lessonId, "Lesson ID");

  const snapshotBeforeUpdate = await buildLearningSnapshot(studentId, courseId);
  const lessonStateBeforeUpdate = assertLessonIsAccessible(
    snapshotBeforeUpdate.lessons,
    lessonId
  );

  const lesson = await Lesson.findOne({
    _id: lessonId,
    course: courseId,
    published: true,
  }).select("_id");

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  const existingProgress = await LessonProgress.findOne({
    studentId,
    courseId,
    lessonId,
  });
  const reportedDurationSeconds = normalizeLessonDurationSeconds(durationSeconds);
  const resolvedDurationSeconds =
    reportedDurationSeconds ||
    normalizeLessonDurationSeconds(existingProgress?.mediaDurationSeconds);
  const trackedSecondsSpent = normalizeTrackedSeconds(secondsSpent);
  const updatedProgress =
    existingProgress ||
    new LessonProgress({
      studentId,
      courseId,
      lessonId,
    });

  updatedProgress.lastAccessedAt = new Date();

  if (resolvedDurationSeconds) {
    updatedProgress.mediaDurationSeconds = resolvedDurationSeconds;
  }

  if (trackedSecondsSpent > 0) {
    updatedProgress.timeSpentSeconds = getNextTrackedTimeSpentSeconds({
      currentTimeSpent: updatedProgress.timeSpentSeconds,
      secondsSpent: trackedSecondsSpent,
      durationSeconds: resolveLessonProgressTargetSeconds(updatedProgress),
    });
  }

  const autoCompleted =
    Boolean(completed) ||
    Boolean(lessonStateBeforeUpdate?.completed) ||
    isLessonProgressCompleted(updatedProgress, null);

  updatedProgress.completed = autoCompleted;
  await updatedProgress.save();

  await syncLegacyProgress({
    studentId,
    lessonId,
    completed: autoCompleted,
  });

  return buildLearningSnapshot(studentId, courseId);
};
