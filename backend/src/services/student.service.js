import Assignment from "../models/Assignment.model.js";
import AssignmentSubmission from "../models/AssignmentSubmission.model.js";
import CourseLike from "../models/CourseLike.model.js";
import Enrollment from "../models/Enrollment.model.js";
import Lesson from "../models/Lesson.model.js";
import LessonProgress from "../models/LessonProgress.model.js";
import Message from "../models/Message.model.js";
import Progress from "../models/Progress.model.js";
import User from "../models/User.model.js";
import { AppError } from "../utils/AppError.js";
import {
  getLessonProgressRatio,
  isLessonProgressCompleted,
} from "../utils/lessonProgress.js";
import mongoose from "mongoose";
import {
  applyCourseLikeSummary,
  getCourseLikeSummary,
} from "./course-like.service.js";

const assertValidCourseId = (courseId) => {
  if (!courseId) {
    throw new AppError("Course ID is required", 400);
  }

  if (!mongoose.isValidObjectId(courseId)) {
    throw new AppError("Invalid course ID", 400);
  }
};

const getEnrolledCourses = async (studentId) => {
  const enrollments = await Enrollment.find({ student: studentId })
    .sort({ createdAt: -1 })
    .populate({
      path: "course",
      match: { published: true },
      populate: [
        { path: "instructor", select: "name email profileImage" },
        { path: "categoryId", select: "name slug isActive" },
      ],
    });

  const filteredEnrollments = enrollments.filter((enrollment) => enrollment.course);
  const courses = filteredEnrollments.map((enrollment) => enrollment.course);
  const courseIds = courses.map((course) => course._id);

  return {
    enrollments: filteredEnrollments,
    courses,
    courseIds,
  };
};

const getStudentCourseEnrollment = async (studentId, courseId) => {
  assertValidCourseId(courseId);

  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  }).populate({
    path: "course",
    match: { published: true },
    populate: [
      { path: "instructor", select: "name email profileImage" },
      { path: "categoryId", select: "name slug isActive" },
    ],
  });

  if (!enrollment?.course) {
    throw new AppError("Course not found in your workspace", 404);
  }

  return enrollment;
};

const getPublishedLessonsForCourses = async (courseIds) => {
  if (!courseIds.length) {
    return [];
  }

  return Lesson.find({
    course: { $in: courseIds },
    published: true,
  }).sort({ course: 1, order: 1, createdAt: 1 });
};

const getProgressForLessons = async (studentId, lessonIds) => {
  if (!lessonIds.length) {
    return [];
  }

  return Progress.find({
    student: studentId,
    lesson: { $in: lessonIds },
  });
};

const getLessonProgressForLessons = async (studentId, courseIds, lessonIds) => {
  if (!courseIds.length || !lessonIds.length) {
    return [];
  }

  return LessonProgress.find({
    studentId,
    courseId: { $in: courseIds },
    lessonId: { $in: lessonIds },
  });
};

const toLegacyProgressMap = (progressEntries) =>
  progressEntries.reduce((accumulator, entry) => {
    accumulator[String(entry.lesson)] = entry;
    return accumulator;
  }, {});

const toLessonProgressMap = (progressEntries) =>
  progressEntries.reduce((accumulator, entry) => {
    accumulator[String(entry.lessonId)] = entry;
    return accumulator;
  }, {});

const isLessonCompleted = (lessonProgressEntry, legacyProgressEntry) =>
  isLessonProgressCompleted(lessonProgressEntry, legacyProgressEntry);

const getLastTouchedAt = (lessonProgressEntry, legacyProgressEntry) =>
  lessonProgressEntry?.lastAccessedAt || legacyProgressEntry?.updatedAt || null;

const groupByCourse = (items, getCourseId) =>
  items.reduce((accumulator, item) => {
    const key = String(getCourseId(item) || "");

    if (!accumulator[key]) {
      accumulator[key] = [];
    }

    accumulator[key].push(item);
    return accumulator;
  }, {});

const buildCourseSummaries = ({
  enrollments,
  lessons,
  progressEntries,
  lessonProgressEntries,
  likeSummary,
}) => {
  const lessonsByCourse = groupByCourse(lessons, (lesson) => lesson.course);
  const progressByLesson = toLegacyProgressMap(progressEntries);
  const lessonProgressByLesson = toLessonProgressMap(lessonProgressEntries);

  return enrollments.map((enrollment) => {
    const course = enrollment.course;
    const courseLessons = lessonsByCourse[String(course._id)] || [];
    const completedLessons = courseLessons.filter((lesson) =>
      isLessonCompleted(
        lessonProgressByLesson[String(lesson._id)],
        progressByLesson[String(lesson._id)]
      )
    );
    const totalLessons = courseLessons.length;
    const progressUnits = courseLessons.reduce(
      (sum, lesson) =>
        sum +
        getLessonProgressRatio(
          lessonProgressByLesson[String(lesson._id)],
          progressByLesson[String(lesson._id)]
        ),
      0
    );
    const progressPercentage = totalLessons
      ? Math.round((progressUnits / totalLessons) * 100)
      : 0;
    const lastTouchedLesson = courseLessons
      .map((lesson) => ({
        lesson,
        touchedAt: getLastTouchedAt(
          lessonProgressByLesson[String(lesson._id)],
          progressByLesson[String(lesson._id)]
        ),
      }))
      .filter((entry) => entry.touchedAt)
      .sort((left, right) => new Date(right.touchedAt) - new Date(left.touchedAt))[0];
    const nextLesson =
      courseLessons.find(
        (lesson) =>
          !isLessonCompleted(
            lessonProgressByLesson[String(lesson._id)],
            progressByLesson[String(lesson._id)]
          )
      ) ||
      courseLessons[0] ||
      null;
    const resumeLesson = lastTouchedLesson?.lesson || nextLesson;

    return {
      ...applyCourseLikeSummary(course.toObject(), likeSummary),
      enrollmentId: enrollment._id,
      enrolledAt: enrollment.enrolledAt || enrollment.createdAt,
      totalLessons,
      completedLessons: completedLessons.length,
      progressUnits,
      progressPercentage,
      lastAccessedAt:
        lastTouchedLesson?.touchedAt || enrollment.updatedAt || enrollment.createdAt,
      nextLessonId: nextLesson?._id || null,
      currentLessonId: resumeLesson?._id || nextLesson?._id || null,
    };
  });
};

const getAssignmentsForCourses = async (courseIds) => {
  if (!courseIds.length) {
    return [];
  }

  return Assignment.find({
    course: { $in: courseIds },
    published: true,
  })
    .sort({ dueDate: 1, createdAt: -1 })
    .populate({
      path: "course",
      select: "title instructor",
      populate: { path: "instructor", select: "name email profileImage" },
    });
};

const getSubmissionsForAssignments = async (studentId, assignmentIds) => {
  if (!assignmentIds.length) {
    return [];
  }

  return AssignmentSubmission.find({
    student: studentId,
    assignment: { $in: assignmentIds },
  });
};

const getAssignmentStatus = (assignment, submission) => {
  if (!submission) {
    return new Date(assignment.dueDate).getTime() < Date.now() ? "Missing" : "Pending";
  }

  if (submission.status === "graded" || submission.grade !== undefined) {
    return "Graded";
  }

  if (submission.status === "late") {
    return "Late";
  }

  return "Submitted";
};

const buildAssignmentRows = ({ assignments, submissions }) => {
  const submissionMap = submissions.reduce((accumulator, submission) => {
    accumulator[String(submission.assignment)] = submission;
    return accumulator;
  }, {});

  return assignments.map((assignment) => {
    const submission = submissionMap[String(assignment._id)];

    return {
      ...assignment.toObject(),
      status: getAssignmentStatus(assignment, submission),
      submission: submission ? submission.toObject() : null,
    };
  });
};

const getStudentMessagesForCourses = async (studentId, courseIds) => {
  if (!courseIds.length) {
    return [];
  }

  return Message.find({
    $or: [{ sender: studentId }, { recipient: studentId }],
    course: { $in: courseIds },
  })
    .sort({ createdAt: -1 })
    .populate("sender", "name role profileImage")
    .populate("recipient", "name role profileImage")
    .populate({
      path: "course",
      select: "title instructor",
      populate: { path: "instructor", select: "name email profileImage" },
    });
};

const buildMessageThreads = (messages, studentId) => {
  const threadsMap = new Map();

  messages.forEach((message) => {
    const counterpart =
      String(message.sender?._id) === String(studentId) ? message.recipient : message.sender;
    const key = `${message.course?._id || "general"}-${counterpart?._id || "unknown"}`;

    if (!threadsMap.has(key)) {
      threadsMap.set(key, {
        id: key,
        course: message.course,
        instructor: counterpart,
        latestMessage: message,
        unreadCount: 0,
      });
    }

    if (String(message.recipient?._id) === String(studentId) && !message.readAt) {
      threadsMap.get(key).unreadCount += 1;
    }
  });

  return Array.from(threadsMap.values()).sort(
    (left, right) =>
      new Date(right.latestMessage?.createdAt || 0) - new Date(left.latestMessage?.createdAt || 0)
  );
};

const buildRecentActivity = ({ progressEntries, lessons, assignmentRows, messages, studentId, courseSummaries }) => {
  const lessonMap = lessons.reduce((accumulator, lesson) => {
    accumulator[String(lesson._id)] = lesson;
    return accumulator;
  }, {});
  const courseTitleMap = courseSummaries.reduce((accumulator, course) => {
    accumulator[String(course._id)] = course.title;
    return accumulator;
  }, {});

  const activity = [
    ...progressEntries
      .filter((entry) => entry.completed)
      .map((entry) => {
        const lesson = lessonMap[String(entry.lesson)];

        return {
          id: `progress-${entry._id}`,
          type: "progress",
          title: `Completed lesson: ${lesson?.title || "Lesson"}`,
          meta: courseTitleMap[String(lesson?.course || "")] || "Learning progress",
          createdAt: entry.completedAt || entry.updatedAt,
        };
      }),
    ...assignmentRows
      .filter((assignment) => assignment.submission)
      .map((assignment) => ({
        id: `submission-${assignment.submission._id}`,
        type: "assignment",
        title: `Submitted assignment: ${assignment.title}`,
        meta: assignment.course?.title || "Course assignment",
        createdAt: assignment.submission?.submittedAt || assignment.submission?.updatedAt,
      })),
    ...messages
      .filter((message) => String(message.recipient?._id) === String(studentId))
      .map((message) => ({
        id: `message-${message._id}`,
        type: "message",
        title: `Message from ${message.sender?.name || "Instructor"}`,
        meta: message.course?.title || "Course conversation",
        createdAt: message.createdAt,
      })),
  ];

  return activity
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, 8);
};

const buildNotifications = ({ assignmentRows, messageThreads, courseSummaries }) => {
  const notifications = [];

  assignmentRows
    .filter((assignment) => assignment.status === "Pending" || assignment.status === "Missing")
    .slice(0, 3)
    .forEach((assignment) => {
      notifications.push({
        id: `assignment-${assignment._id}`,
        title: assignment.status === "Missing" ? "Assignment overdue" : "Assignment coming up",
        message: `${assignment.title} for ${assignment.course?.title || "your course"}`,
        href: "/student/assignments",
      });
    });

  messageThreads
    .filter((thread) => thread.unreadCount)
    .slice(0, 2)
    .forEach((thread) => {
      notifications.push({
        id: `message-${thread.id}`,
        title: "Unread instructor message",
        message: `${thread.instructor?.name || "Instructor"} sent ${thread.unreadCount} new message${thread.unreadCount > 1 ? "s" : ""}`,
        href: "/student/messages",
      });
    });

  courseSummaries
    .filter((course) => course.progressPercentage === 100)
    .slice(0, 1)
    .forEach((course) => {
      notifications.push({
        id: `certificate-${course._id}`,
        title: "Certificate ready",
        message: `${course.title} is complete and ready to download.`,
        href: "/student/certificates",
      });
    });

  return notifications.slice(0, 6);
};

const buildOverallProgress = (courseSummaries) => {
  const totalLessons = courseSummaries.reduce((sum, course) => sum + course.totalLessons, 0);
  const completedLessons = courseSummaries.reduce((sum, course) => sum + course.completedLessons, 0);
  const progressUnits = courseSummaries.reduce(
    (sum, course) => sum + Number(course.progressUnits || 0),
    0
  );

  return {
    totalLessons,
    completedLessons,
    progressPercentage: totalLessons ? Math.round((progressUnits / totalLessons) * 100) : 0,
    totalCourses: courseSummaries.length,
    completedCourses: courseSummaries.filter((course) => course.progressPercentage === 100).length,
  };
};

const buildCourseCertificates = (courseSummaries, lessons, progressEntries) => {
  const progressByLesson = progressEntries.reduce((accumulator, entry) => {
    accumulator[String(entry.lesson)] = entry;
    return accumulator;
  }, {});
  const lessonByCourse = groupByCourse(lessons, (lesson) => lesson.course);

  return courseSummaries
    .filter((course) => course.progressPercentage === 100 && course.totalLessons > 0)
    .map((course) => {
      const courseLessons = lessonByCourse[String(course._id)] || [];
      const completedDates = courseLessons
        .map(
          (lesson) =>
            progressByLesson[String(lesson._id)]?.completedAt ||
            progressByLesson[String(lesson._id)]?.updatedAt
        )
        .filter(Boolean)
        .sort((left, right) => new Date(right) - new Date(left));

      return {
        id: `${course._id}-${course.enrollmentId}`,
        courseId: course._id,
        courseTitle: course.title,
        instructorName: course.instructor?.name || "Instructor",
        completionDate: completedDates[0] || course.lastAccessedAt,
        progressPercentage: course.progressPercentage,
      };
    });
};

const getStudentWorkspaceContext = async (studentId) => {
  const { enrollments, courseIds } = await getEnrolledCourses(studentId);
  const lessons = await getPublishedLessonsForCourses(courseIds);
  const [progressEntries, lessonProgressEntries, likeSummary] = await Promise.all([
    getProgressForLessons(
      studentId,
      lessons.map((lesson) => lesson._id)
    ),
    getLessonProgressForLessons(
      studentId,
      courseIds,
      lessons.map((lesson) => lesson._id)
    ),
    getCourseLikeSummary({
      courseIds,
      studentId,
    }),
  ]);
  const courseSummaries = buildCourseSummaries({
    enrollments,
    lessons,
    progressEntries,
    lessonProgressEntries,
    likeSummary,
  });
  const assignments = await getAssignmentsForCourses(courseIds);
  const submissions = await getSubmissionsForAssignments(
    studentId,
    assignments.map((assignment) => assignment._id)
  );
  const assignmentRows = buildAssignmentRows({ assignments, submissions });
  const messages = await getStudentMessagesForCourses(studentId, courseIds);
  const messageThreads = buildMessageThreads(messages, studentId);
  const certificates = buildCourseCertificates(courseSummaries, lessons, progressEntries);

  return {
    lessons,
    progressEntries,
    lessonProgressEntries,
    courseSummaries,
    assignmentRows,
    messages,
    messageThreads,
    certificates,
  };
};

export const getStudentDashboard = async (studentId) => {
  const context = await getStudentWorkspaceContext(studentId);
  const overall = buildOverallProgress(context.courseSummaries);
  const notifications = buildNotifications({
    assignmentRows: context.assignmentRows,
    messageThreads: context.messageThreads,
    courseSummaries: context.courseSummaries,
  });
  const continueLearning =
    [...context.courseSummaries].sort(
      (left, right) => new Date(right.lastAccessedAt || 0) - new Date(left.lastAccessedAt || 0)
    )[0] || null;

  return {
    totalEnrolledCourses: overall.totalCourses,
    completedLessons: overall.completedLessons,
    progressPercentage: overall.progressPercentage,
    pendingAssignments: context.assignmentRows.filter(
      (assignment) => assignment.status === "Pending" || assignment.status === "Missing"
    ).length,
    continueLearning,
    enrolledCourses: context.courseSummaries.slice(0, 4),
    upcomingDeadlines: context.assignmentRows
      .filter((assignment) => assignment.status === "Pending" || assignment.status === "Missing")
      .slice(0, 5),
    recentActivity: buildRecentActivity({
      progressEntries: context.progressEntries,
      lessons: context.lessons,
      assignmentRows: context.assignmentRows,
      messages: context.messages,
      studentId,
      courseSummaries: context.courseSummaries,
    }),
    progressOverview: context.courseSummaries.map((course) => ({
      id: course._id,
      title: course.title,
      progressPercentage: course.progressPercentage,
      completedLessons: course.completedLessons,
      totalLessons: course.totalLessons,
      instructor: course.instructor,
    })),
    notifications,
    certificatesEarned: context.certificates.length,
  };
};

export const getStudentCourses = async (studentId) => {
  const context = await getStudentWorkspaceContext(studentId);
  const overall = buildOverallProgress(context.courseSummaries);

  return {
    courses: context.courseSummaries,
    continueLearning:
      [...context.courseSummaries].sort(
        (left, right) => new Date(right.lastAccessedAt || 0) - new Date(left.lastAccessedAt || 0)
      )[0] || null,
    stats: overall,
  };
};

export const getStudentCourseById = async (studentId, courseId) => {
  assertValidCourseId(courseId);

  const enrollment = await getStudentCourseEnrollment(studentId, courseId);
  const course = enrollment.course;
  const lessons = await Lesson.find({
    course: courseId,
    published: true,
  }).sort({ order: 1, createdAt: 1 });
  const [progressEntries, lessonProgressEntries, likeSummary] = await Promise.all([
    getProgressForLessons(
      studentId,
      lessons.map((lesson) => lesson._id)
    ),
    getLessonProgressForLessons(
      studentId,
      [courseId],
      lessons.map((lesson) => lesson._id)
    ),
    getCourseLikeSummary({
      courseIds: [courseId],
      studentId,
    }),
  ]);
  const progressMap = toLegacyProgressMap(progressEntries);
  const lessonProgressMap = toLessonProgressMap(lessonProgressEntries);
  const completedLessons = lessons.filter((lesson) =>
    isLessonCompleted(
      lessonProgressMap[String(lesson._id)],
      progressMap[String(lesson._id)]
    )
  );
  const progressUnits = lessons.reduce(
    (sum, lesson) =>
      sum +
      getLessonProgressRatio(
        lessonProgressMap[String(lesson._id)],
        progressMap[String(lesson._id)]
      ),
    0
  );
  const progressPercentage = lessons.length
    ? Math.round((progressUnits / lessons.length) * 100)
    : 0;
  const lastTouchedLesson = lessons
    .map((lesson) => ({
      lesson,
      touchedAt: getLastTouchedAt(
        lessonProgressMap[String(lesson._id)],
        progressMap[String(lesson._id)]
      ),
    }))
    .filter((entry) => entry.touchedAt)
    .sort((left, right) => new Date(right.touchedAt) - new Date(left.touchedAt))[0];
  const currentLesson =
    lastTouchedLesson?.lesson ||
    lessons.find((lesson) =>
      !isLessonCompleted(
        lessonProgressMap[String(lesson._id)],
        progressMap[String(lesson._id)]
      )
    ) ||
    lessons[0] ||
    null;
  const assignments = await getAssignmentsForCourses([courseId]);
  const submissions = await getSubmissionsForAssignments(
    studentId,
    assignments.map((assignment) => assignment._id)
  );
  const assignmentRows = buildAssignmentRows({ assignments, submissions });

  return {
    ...applyCourseLikeSummary(course.toObject(), likeSummary),
    enrolledAt: enrollment.enrolledAt || enrollment.createdAt,
    totalLessons: lessons.length,
    completedLessons: completedLessons.length,
    progressPercentage,
    currentLessonId: currentLesson?._id || null,
    lessons: lessons.map((lesson) => ({
      ...lesson.toObject(),
      completed: isLessonCompleted(
        lessonProgressMap[String(lesson._id)],
        progressMap[String(lesson._id)]
      ),
      completedAt:
        progressMap[String(lesson._id)]?.completedAt ||
        (isLessonCompleted(
          lessonProgressMap[String(lesson._id)],
          progressMap[String(lesson._id)]
        )
          ? lessonProgressMap[String(lesson._id)]?.updatedAt || null
          : null),
      lastTouchedAt: getLastTouchedAt(
        lessonProgressMap[String(lesson._id)],
        progressMap[String(lesson._id)]
      ),
      timeSpentSeconds: Number(
        lessonProgressMap[String(lesson._id)]?.timeSpentSeconds || 0
      ),
      lessonProgressPercentage: Math.round(
        getLessonProgressRatio(
          lessonProgressMap[String(lesson._id)],
          progressMap[String(lesson._id)]
        ) * 100
      ),
    })),
    assignments: assignmentRows,
  };
};

export const getStudentProgress = async (studentId) => {
  const context = await getStudentWorkspaceContext(studentId);
  const overall = buildOverallProgress(context.courseSummaries);

  return {
    ...overall,
    byCourse: context.courseSummaries.map((course) => ({
      courseId: course._id,
      title: course.title,
      progressPercentage: course.progressPercentage,
      completedLessons: course.completedLessons,
      totalLessons: course.totalLessons,
      lastAccessedAt: course.lastAccessedAt,
    })),
  };
};

export const toggleStudentLessonProgress = async (studentId, lessonId, completed) => {
  const lesson = await Lesson.findById(lessonId).populate("course", "title published");

  if (!lesson || !lesson.published || !lesson.course?.published) {
    throw new AppError("Lesson not found", 404);
  }

  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: lesson.course?._id || lesson.course,
  });

  if (!enrollment) {
    throw new AppError("You are not enrolled in this course", 403);
  }

  await Progress.findOneAndUpdate(
    {
      student: studentId,
      lesson: lesson._id,
    },
    {
      student: studentId,
      lesson: lesson._id,
      completed: Boolean(completed),
      completedAt: completed ? new Date() : null,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  );

  const refreshedCourse = await getStudentCourseById(studentId, lesson.course?._id || lesson.course);

  return {
    lessonId: lesson._id,
    completed: Boolean(completed),
    courseId: refreshedCourse._id,
    progressPercentage: refreshedCourse.progressPercentage,
    completedLessons: refreshedCourse.completedLessons,
    totalLessons: refreshedCourse.totalLessons,
  };
};

export const toggleStudentCourseLike = async (studentId, courseId) => {
  const enrollment = await getStudentCourseEnrollment(studentId, courseId);

  const existingLike = await CourseLike.findOne({
    studentId,
    courseId: enrollment.course?._id || enrollment.course,
  }).select("_id");

  if (existingLike) {
    await CourseLike.deleteOne({ _id: existingLike._id });
  } else {
    await CourseLike.create({
      studentId,
      courseId: enrollment.course?._id || enrollment.course,
    });
  }

  const likeSummary = await getCourseLikeSummary({
    courseIds: [courseId],
    studentId,
  });
  const courseWithLikes = applyCourseLikeSummary(
    { _id: enrollment.course?._id || enrollment.course },
    likeSummary
  );

  return {
    courseId: courseWithLikes._id,
    likesCount: courseWithLikes.likesCount,
    isLiked: courseWithLikes.isLiked,
  };
};

export const getStudentAssignments = async (studentId) => {
  const { courseIds } = await getEnrolledCourses(studentId);
  const assignments = await getAssignmentsForCourses(courseIds);
  const submissions = await getSubmissionsForAssignments(
    studentId,
    assignments.map((assignment) => assignment._id)
  );

  return buildAssignmentRows({ assignments, submissions });
};

export const submitStudentAssignment = async (studentId, data) => {
  if (!data.assignmentId) {
    throw new AppError("Assignment is required", 400);
  }

  if (!data.submissionText && !data.attachmentUrl) {
    throw new AppError("Provide submission text or an attachment URL", 400);
  }

  const assignment = await Assignment.findById(data.assignmentId).populate({
    path: "course",
    select: "title instructor published",
    populate: { path: "instructor", select: "name email profileImage" },
  });

  if (!assignment || !assignment.published || !assignment.course?.published) {
    throw new AppError("Assignment not found", 404);
  }

  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: assignment.course?._id || assignment.course,
  });

  if (!enrollment) {
    throw new AppError("You are not enrolled in this course", 403);
  }

  const isLate = new Date(assignment.dueDate).getTime() < Date.now();

  const submission = await AssignmentSubmission.findOneAndUpdate(
    {
      assignment: assignment._id,
      student: studentId,
    },
    {
      assignment: assignment._id,
      student: studentId,
      submissionText: data.submissionText,
      attachmentUrl: data.attachmentUrl,
      submittedAt: new Date(),
      status: isLate ? "late" : "submitted",
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  );

  return {
    assignmentId: assignment._id,
    title: assignment.title,
    course: assignment.course,
    status: isLate ? "Late" : "Submitted",
    submission,
  };
};

export const getStudentCertificates = async (studentId) => {
  const context = await getStudentWorkspaceContext(studentId);
  return context.certificates;
};

export const getStudentMessages = async (studentId) => {
  const { courses } = await getEnrolledCourses(studentId);
  const courseIds = courses.map((course) => course._id);
  const messages = await getStudentMessagesForCourses(studentId, courseIds);

  return {
    threads: buildMessageThreads(messages, studentId),
    messages,
    availableCourses: courses.map((course) => ({
      courseId: course._id,
      title: course.title,
      instructor: course.instructor,
    })),
  };
};

export const sendStudentMessage = async (studentId, data) => {
  if (!data.courseId || !data.content) {
    throw new AppError("Course and message content are required", 400);
  }

  const enrollment = await getStudentCourseEnrollment(studentId, data.courseId);
  const course = enrollment.course;

  const message = await Message.create({
    sender: studentId,
    recipient: course.instructor?._id || course.instructor,
    course: course._id,
    content: data.content,
  });

  return Message.findById(message._id)
    .populate("sender", "name role profileImage")
    .populate("recipient", "name role profileImage")
    .populate({
      path: "course",
      select: "title instructor",
      populate: { path: "instructor", select: "name email profileImage" },
    });
};

export const getStudentProfile = async (studentId) => {
  const user = await User.findById(studentId).select("name email role profileImage createdAt updatedAt");

  if (!user) {
    throw new AppError("Student profile not found", 404);
  }

  return user;
};

export const updateStudentProfile = async (studentId, data) => {
  const user = await User.findById(studentId).select("+password");

  if (!user) {
    throw new AppError("Student profile not found", 404);
  }

  if (data.currentPassword || data.newPassword) {
    if (!data.currentPassword || !data.newPassword) {
      throw new AppError("Both current and new passwords are required", 400);
    }

    const isCorrectPassword = await user.correctPassword(data.currentPassword, user.password);

    if (!isCorrectPassword) {
      throw new AppError("Current password is incorrect", 400);
    }

    user.password = data.newPassword;
  }

  if (data.name !== undefined) {
    user.name = data.name;
  }

  if (data.email !== undefined) {
    const existingEmail = await User.findOne({
      email: data.email,
      _id: { $ne: studentId },
    });

    if (existingEmail) {
      throw new AppError("Email already in use", 400);
    }

    user.email = data.email;
  }

  if (data.profileImage !== undefined) {
    user.profileImage = data.profileImage;
  }

  await user.save();

  return User.findById(studentId).select("name email role profileImage createdAt updatedAt");
};
