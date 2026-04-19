import Course from "../models/Course.model.js";
import Lesson from "../models/Lesson.model.js";
import Enrollment from "../models/Enrollment.model.js";
import Progress from "../models/Progress.model.js";
import User from "../models/User.model.js";
import Message from "../models/Message.model.js";
import Category from "../models/Category.model.js";
import { AppError } from "../utils/AppError.js";

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

const getInstructorCourseIds = async (instructorId) => {
  const courses = await Course.find({ instructor: instructorId }).select("_id");
  return courses.map((course) => course._id);
};

const getOwnedCourse = async (courseId, instructorId) => {
  const course = await Course.findOne({
    _id: courseId,
    instructor: instructorId,
  }).populate("instructor", "name email profileImage");

  if (!course) {
    throw new AppError("Course not found or not owned by instructor", 404);
  }

  return course;
};

const getOwnedLesson = async (lessonId, instructorId) => {
  const lesson = await Lesson.findById(lessonId).populate("course", "title instructor");

  if (!lesson || String(lesson.course?.instructor) !== String(instructorId)) {
    throw new AppError("Lesson not found or not owned by instructor", 404);
  }

  return lesson;
};

const buildMonthSeries = () => {
  const months = [];

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - index, 1);
    date.setHours(0, 0, 0, 0);

    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleString("en-US", { month: "short" }),
      enrollments: 0,
      revenue: 0,
      progress: 0,
    });
  }

  return months;
};

const computeCompletionRate = async (courseIds) => {
  if (!courseIds.length) {
    return 0;
  }

  const [lessons, enrollments, completedProgress] = await Promise.all([
    Lesson.find({ course: { $in: courseIds } }).select("_id course"),
    Enrollment.find({ course: { $in: courseIds } }).select("_id course student"),
    Progress.countDocuments({
      completed: true,
      lesson: {
        $in: await Lesson.find({ course: { $in: courseIds } }).distinct("_id"),
      },
    }),
  ]);

  const totalPossible = lessons.length * enrollments.length;

  if (!totalPossible) {
    return 0;
  }

  return Math.round((completedProgress / totalPossible) * 100);
};

export const getInstructorDashboard = async (instructorId) => {
  const courseIds = await getInstructorCourseIds(instructorId);

  const [
    courses,
    lessons,
    enrollments,
    recentStudents,
    recentLessons,
    recentMessages,
    completionRate,
  ] = await Promise.all([
    Course.find({ instructor: instructorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("instructor", "name email"),
    Lesson.find({ course: { $in: courseIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("course", "title"),
    Enrollment.find({ course: { $in: courseIds } })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("student", "name email profileImage")
      .populate("course", "title price"),
    Enrollment.find({ course: { $in: courseIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("student", "name email profileImage")
      .populate("course", "title"),
    Lesson.find({ course: { $in: courseIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("course", "title"),
    Message.find({
      $or: [{ sender: instructorId }, { recipient: instructorId }],
      course: { $in: courseIds },
    })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("sender", "name role")
      .populate("recipient", "name role")
      .populate("course", "title"),
    computeCompletionRate(courseIds),
  ]);

  const totalStudents = await Enrollment.countDocuments({ course: { $in: courseIds } });
  const totalCourses = await Course.countDocuments({ instructor: instructorId });
  const totalLessons = await Lesson.countDocuments({ course: { $in: courseIds } });

  const activityFeed = [
    ...courses.map((course) => ({
      id: `course-${course._id}`,
      type: "course",
      title: `Course updated: ${course.title}`,
      meta: course.published ? "Published course" : "Draft course",
      createdAt: course.updatedAt,
    })),
    ...recentStudents.map((enrollment) => ({
      id: `enrollment-${enrollment._id}`,
      type: "student",
      title: `${enrollment.student?.name || "Student"} enrolled`,
      meta: enrollment.course?.title || "Course enrollment",
      createdAt: enrollment.createdAt,
    })),
    ...recentLessons.map((lesson) => ({
      id: `lesson-${lesson._id}`,
      type: "lesson",
      title: `Lesson added: ${lesson.title}`,
      meta: lesson.course?.title || "Course lesson",
      createdAt: lesson.createdAt,
    })),
    ...recentMessages.map((message) => ({
      id: `message-${message._id}`,
      type: "message",
      title: `Message ${String(message.sender?._id) === String(instructorId) ? "sent" : "received"}`,
      meta: message.course?.title || "Student communication",
      createdAt: message.createdAt,
    })),
  ]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, 8);

  return {
    totalCourses,
    totalStudents,
    totalLessons,
    completionRate,
    recentCourses: courses,
    recentStudents: recentStudents.map((enrollment) => ({
      ...enrollment.toObject(),
      student: enrollment.student,
      course: enrollment.course,
    })),
    recentLessons,
    activityFeed,
  };
};

export const getInstructorCourses = async (instructorId) => {
  return Course.find({ instructor: instructorId })
    .sort({ createdAt: -1 })
    .populate("instructor", "name email profileImage")
    .populate("categoryId", "name slug isActive");
};

export const createInstructorCourse = async (instructorId, data) => {
  const categoryFields = await resolveCategoryFields(data.categoryId);

  const payload = {
    title: data.title,
    description: data.description,
    ...categoryFields,
    ...resolveThumbnailFields(data),
    ...resolveDocumentFields(data),
    price: data.price || 0,
    published: false,
    instructor: instructorId,
  };

  return Course.create(payload);
};

export const updateInstructorCourse = async (courseId, instructorId, data) => {
  await getOwnedCourse(courseId, instructorId);

  const payload = {
    title: data.title,
    description: data.description,
    ...resolveThumbnailFields(data),
    ...resolveDocumentFields(data),
    price: data.price,
  };

  if (data.categoryId !== undefined) {
    Object.assign(payload, await resolveCategoryFields(data.categoryId));
  }

  const sanitizedPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );

  return Course.findByIdAndUpdate(courseId, sanitizedPayload, {
    new: true,
    runValidators: true,
  })
    .populate("instructor", "name email profileImage")
    .populate("categoryId", "name slug isActive");
};

export const deleteInstructorCourse = async (courseId, instructorId) => {
  await getOwnedCourse(courseId, instructorId);
  await Lesson.deleteMany({ course: courseId });
  await Enrollment.deleteMany({ course: courseId });
  await Course.findByIdAndDelete(courseId);
};

export const toggleCoursePublishState = async (courseId, instructorId) => {
  await getOwnedCourse(courseId, instructorId);
  throw new AppError("Only admins can publish or unpublish courses", 403);
};

export const getInstructorLessons = async (instructorId) => {
  const courseIds = await getInstructorCourseIds(instructorId);

  return Lesson.find({ course: { $in: courseIds } })
    .sort({ course: 1, order: 1, createdAt: -1 })
    .populate("course", "title instructor");
};

export const createInstructorLesson = async (instructorId, data) => {
  await getOwnedCourse(data.course, instructorId);

  return Lesson.create({
    title: data.title,
    content: data.content,
    videoUrl: data.videoUrl,
    pdfUrl: data.pdfUrl,
    isPreview: Boolean(data.isPreview),
    order: data.order || 0,
    published: Boolean(data.published),
    course: data.course,
  });
};

export const updateInstructorLesson = async (lessonId, instructorId, data) => {
  const lesson = await getOwnedLesson(lessonId, instructorId);

  if (data.course && String(data.course) !== String(lesson.course?._id || lesson.course)) {
    await getOwnedCourse(data.course, instructorId);
  }

  const payload = {
    title: data.title,
    content: data.content,
    videoUrl: data.videoUrl,
    pdfUrl: data.pdfUrl,
    isPreview: data.isPreview,
    order: data.order,
    published: data.published,
    course: data.course,
  };

  const sanitizedPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );

  return Lesson.findByIdAndUpdate(lessonId, sanitizedPayload, {
    new: true,
    runValidators: true,
  }).populate("course", "title instructor");
};

export const deleteInstructorLesson = async (lessonId, instructorId) => {
  await getOwnedLesson(lessonId, instructorId);
  await Progress.deleteMany({ lesson: lessonId });
  await Lesson.findByIdAndDelete(lessonId);
};

export const reorderInstructorLessons = async (courseId, instructorId, lessonIds) => {
  await getOwnedCourse(courseId, instructorId);

  const lessons = await Lesson.find({
    _id: { $in: lessonIds },
    course: courseId,
  }).select("_id");

  if (lessons.length !== lessonIds.length) {
    throw new AppError("One or more lessons do not belong to this course", 400);
  }

  await Promise.all(
    lessonIds.map((lessonId, index) =>
      Lesson.findByIdAndUpdate(lessonId, { order: index + 1 })
    )
  );

  return Lesson.find({ course: courseId }).sort({ order: 1 }).populate("course", "title");
};

export const getInstructorStudents = async (instructorId, courseId) => {
  const courseQuery = { instructor: instructorId };

  if (courseId) {
    courseQuery._id = courseId;
  }

  const courses = await Course.find(courseQuery).select("_id title");
  const courseIds = courses.map((course) => course._id);

  const [enrollments, lessons, progress] = await Promise.all([
    Enrollment.find({ course: { $in: courseIds } })
      .sort({ createdAt: -1 })
      .populate("student", "name email profileImage")
      .populate("course", "title"),
    Lesson.find({ course: { $in: courseIds } }).select("_id course"),
    Progress.find({
      lesson: { $in: await Lesson.find({ course: { $in: courseIds } }).distinct("_id") },
      completed: true,
    }).populate("lesson", "course"),
  ]);

  const lessonCountByCourse = lessons.reduce((accumulator, lesson) => {
    const key = String(lesson.course);
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  const completedByStudentCourse = progress.reduce((accumulator, item) => {
    const key = `${item.student || ""}-${item.lesson?.course || ""}`;
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  return enrollments.map((enrollment) => {
    const studentId = String(enrollment.student?._id || "");
    const ownedCourseId = String(enrollment.course?._id || "");
    const totalLessons = lessonCountByCourse[ownedCourseId] || 0;
    const completedLessons = completedByStudentCourse[`${studentId}-${ownedCourseId}`] || 0;
    const progressRate = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      ...enrollment.toObject(),
      progressRate,
      completedLessons,
      totalLessons,
    };
  });
};

export const getInstructorAnalytics = async (instructorId) => {
  const courseIds = await getInstructorCourseIds(instructorId);
  const courses = await Course.find({ instructor: instructorId }).select("title price published createdAt");
  const enrollments = await Enrollment.find({ course: { $in: courseIds } })
    .populate("course", "title price")
    .populate("student", "name");
  const lessons = await Lesson.find({ course: { $in: courseIds } }).select("_id course");
  const progress = await Progress.find({
    lesson: { $in: lessons.map((lesson) => lesson._id) },
    completed: true,
  }).populate("lesson", "course");

  const totalEnrollments = enrollments.length;
  const totalRevenue = enrollments.reduce((sum, enrollment) => sum + (enrollment.course?.price || 0), 0);
  const mostPopularCourse = courses
    .map((course) => ({
      id: course._id,
      title: course.title,
      enrollmentCount: enrollments.filter(
        (enrollment) => String(enrollment.course?._id) === String(course._id)
      ).length,
    }))
    .sort((left, right) => right.enrollmentCount - left.enrollmentCount)[0];

  const averageProgress = await computeCompletionRate(courseIds);

  const performance = courses.map((course) => {
    const courseLessonIds = lessons
      .filter((lesson) => String(lesson.course) === String(course._id))
      .map((lesson) => String(lesson._id));
    const courseEnrollments = enrollments.filter(
      (enrollment) => String(enrollment.course?._id) === String(course._id)
    );
    const completed = progress.filter((item) => courseLessonIds.includes(String(item.lesson?._id))).length;
    const possible = courseLessonIds.length * courseEnrollments.length;

    return {
      id: course._id,
      course: course.title,
      enrollments: courseEnrollments.length,
      revenue: courseEnrollments.reduce((sum, enrollment) => sum + (enrollment.course?.price || 0), 0),
      completionRate: possible ? Math.round((completed / possible) * 100) : 0,
    };
  });

  const revenueSeries = buildMonthSeries();

  enrollments.forEach((enrollment) => {
    const createdAt = new Date(enrollment.createdAt);
    const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
    const target = revenueSeries.find((entry) => entry.key === key);

    if (target) {
      target.enrollments += 1;
      target.revenue += enrollment.course?.price || 0;
    }
  });

  const studentProgress = enrollments.map((enrollment) => {
    const relatedLessons = lessons.filter(
      (lesson) => String(lesson.course) === String(enrollment.course?._id)
    );
    const completed = progress.filter(
      (item) =>
        String(item.student) === String(enrollment.student?._id) &&
        relatedLessons.some((lesson) => String(lesson._id) === String(item.lesson?._id))
    ).length;
    const completionRate = relatedLessons.length ? Math.round((completed / relatedLessons.length) * 100) : 0;

    return {
      id: enrollment._id,
      student: enrollment.student?.name || "Student",
      course: enrollment.course?.title || "Course",
      progress: completionRate,
    };
  });

  return {
    totalEnrollments,
    totalRevenue,
    averageProgress,
    mostPopularCourse: mostPopularCourse?.title || "No courses yet",
    coursePerformance: performance,
    studentProgress,
    revenueSeries,
  };
};

export const getInstructorProfile = async (instructorId) => {
  const user = await User.findById(instructorId).select("name email role profileImage createdAt");

  if (!user) {
    throw new AppError("Instructor profile not found", 404);
  }

  return user;
};

export const updateInstructorProfile = async (instructorId, data) => {
  const user = await User.findById(instructorId).select("+password");

  if (!user) {
    throw new AppError("Instructor profile not found", 404);
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
      _id: { $ne: instructorId },
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

  return User.findById(instructorId).select("name email role profileImage createdAt updatedAt");
};

export const getInstructorMessages = async (instructorId) => {
  const courseIds = await getInstructorCourseIds(instructorId);
  const messages = await Message.find({
    $or: [{ sender: instructorId }, { recipient: instructorId }],
    course: { $in: courseIds },
  })
    .sort({ createdAt: -1 })
    .populate("sender", "name role profileImage")
    .populate("recipient", "name role profileImage")
    .populate("course", "title");

  const threadsMap = new Map();

  messages.forEach((message) => {
    const counterpart =
      String(message.sender?._id) === String(instructorId) ? message.recipient : message.sender;

    const key = `${counterpart?._id || "unknown"}-${message.course?._id || "general"}`;

    if (!threadsMap.has(key)) {
      threadsMap.set(key, {
        id: key,
        student: counterpart,
        course: message.course,
        latestMessage: message,
        unreadCount: 0,
      });
    }

    if (
      String(message.recipient?._id) === String(instructorId) &&
      !message.readAt &&
      threadsMap.get(key)
    ) {
      threadsMap.get(key).unreadCount += 1;
    }
  });

  const availableStudents = await getInstructorStudents(instructorId);

  return {
    threads: Array.from(threadsMap.values()),
    messages,
    availableStudents,
  };
};

export const sendInstructorMessage = async (instructorId, data) => {
  const course = await getOwnedCourse(data.courseId, instructorId);
  const enrollment = await Enrollment.findOne({
    course: course._id,
    student: data.recipientId,
  });

  if (!enrollment) {
    throw new AppError("Student is not enrolled in this course", 400);
  }

  const message = await Message.create({
    sender: instructorId,
    recipient: data.recipientId,
    course: course._id,
    content: data.content,
  });

  return Message.findById(message._id)
    .populate("sender", "name role profileImage")
    .populate("recipient", "name role profileImage")
    .populate("course", "title");
};
