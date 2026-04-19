import Course from "../models/Course.model.js";
import User from "../models/User.model.js";
import Lesson from "../models/Lesson.model.js";
import Enrollment from "../models/Enrollment.model.js";
import Progress from "../models/Progress.model.js";
import { AppError } from "../utils/AppError.js";

const ADMIN_ACTIVITY_FEED_LIMIT = 3;

const buildLastSixMonths = () => {
  const months = [];

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - index, 1);
    date.setHours(0, 0, 0, 0);

    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleString("en-US", { month: "short" }),
      revenue: 0,
      enrollments: 0,
    });
  }

  return months;
};

const calculatePercentage = (value, total) => {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
};

const calculateChange = (currentValue, previousValue) => {
  if (!previousValue) {
    return currentValue > 0 ? 100 : 0;
  }

  return Math.round(((currentValue - previousValue) / previousValue) * 100);
};

const roundToSingleDecimal = (value) => {
  return Math.round(value * 10) / 10;
};

export const getAdminStats = async () => {
  const [totalUsers, totalCourses, totalLessons, totalEnrollments, recentCourses, recentUsers, recentEnrollments] =
    await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Lesson.countDocuments(),
      Enrollment.countDocuments(),
      Course.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("instructor", "name email"),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role isActive createdAt"),
      Enrollment.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("student", "name email")
        .populate("course", "title price"),
    ]);

  const revenueSeries = buildLastSixMonths();

  recentEnrollments.forEach((enrollment) => {
    const createdAt = new Date(enrollment.createdAt);
    const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
    const targetMonth = revenueSeries.find((month) => month.key === monthKey);

    if (targetMonth) {
      targetMonth.enrollments += 1;
      targetMonth.revenue += enrollment.course?.price || 0;
    }
  });

  const activityFeed = [
    ...recentCourses.map((course) => ({
      id: `course-${course._id}`,
      type: "course",
      title: `Course created: ${course.title}`,
      meta: course.instructor?.name ? `Instructor: ${course.instructor.name}` : "New course published",
      createdAt: course.createdAt,
    })),
    ...recentUsers.map((user) => ({
      id: `user-${user._id}`,
      type: "user",
      title: `New ${user.role} joined`,
      meta: user.email,
      createdAt: user.createdAt,
    })),
    ...recentEnrollments.map((enrollment) => ({
      id: `enrollment-${enrollment._id}`,
      type: "enrollment",
      title: `${enrollment.student?.name || "Learner"} enrolled`,
      meta: enrollment.course?.title || "Course enrollment",
      createdAt: enrollment.createdAt,
    })),
  ]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, ADMIN_ACTIVITY_FEED_LIMIT);

  return {
    totalUsers,
    totalCourses,
    totalLessons,
    totalEnrollments,
    recentCourses,
    recentUsers,
    recentEnrollments,
    revenueSeries,
    totalRevenue: revenueSeries.reduce((sum, month) => sum + month.revenue, 0),
    activityFeed,
  };
};

export const getAdminAnalytics = async () => {
  const [users, courses, lessons, enrollments, progress] = await Promise.all([
    User.find().select("name role isActive createdAt").lean(),
    Course.find()
      .select("title instructor category price published createdAt")
      .populate("instructor", "name email")
      .lean(),
    Lesson.find().select("_id course").lean(),
    Enrollment.find()
      .select("student course createdAt")
      .populate("student", "name")
      .populate({
        path: "course",
        select: "title price instructor category published",
        populate: {
          path: "instructor",
          select: "name email",
        },
      })
      .lean(),
    Progress.find({ completed: true })
      .select("student lesson completedAt createdAt")
      .populate("lesson", "course")
      .lean(),
  ]);

  const series = buildLastSixMonths().map((entry) => ({
    ...entry,
    newUsers: 0,
  }));

  const lessonCountByCourse = lessons.reduce((accumulator, lesson) => {
    const key = String(lesson.course);
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  const completedByCourse = progress.reduce((accumulator, item) => {
    const courseId = item.lesson?.course ? String(item.lesson.course) : "";

    if (!courseId) {
      return accumulator;
    }

    accumulator[courseId] = (accumulator[courseId] || 0) + 1;
    return accumulator;
  }, {});

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.isActive).length;
  const activeStudents = new Set(
    enrollments
      .map((enrollment) => String(enrollment.student?._id || enrollment.student || ""))
      .filter(Boolean)
  );
  const currentMonthEntry = series[series.length - 1];
  const previousMonthEntry = series[series.length - 2] || { revenue: 0, enrollments: 0, newUsers: 0 };

  users.forEach((user) => {
    const createdAt = new Date(user.createdAt);
    const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
    const targetMonth = series.find((month) => month.key === monthKey);

    if (targetMonth) {
      targetMonth.newUsers += 1;
    }
  });

  enrollments.forEach((enrollment) => {
    const createdAt = new Date(enrollment.createdAt);
    const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
    const targetMonth = series.find((month) => month.key === monthKey);

    if (targetMonth) {
      targetMonth.enrollments += 1;
      targetMonth.revenue += enrollment.course?.price || 0;
    }
  });

  const roleCounts = users.reduce(
    (accumulator, user) => {
      accumulator[user.role] = (accumulator[user.role] || 0) + 1;
      return accumulator;
    },
    { student: 0, instructor: 0, admin: 0 }
  );

  const roleDistribution = [
    {
      key: "student",
      label: "Students",
      value: roleCounts.student || 0,
      share: calculatePercentage(roleCounts.student || 0, totalUsers),
      color: "bg-sky-500",
      accent: "text-sky-600",
    },
    {
      key: "instructor",
      label: "Instructors",
      value: roleCounts.instructor || 0,
      share: calculatePercentage(roleCounts.instructor || 0, totalUsers),
      color: "bg-emerald-500",
      accent: "text-emerald-600",
    },
    {
      key: "admin",
      label: "Admins",
      value: roleCounts.admin || 0,
      share: calculatePercentage(roleCounts.admin || 0, totalUsers),
      color: "bg-violet-500",
      accent: "text-violet-600",
    },
  ];

  const coursePerformance = courses
    .map((course) => {
      const courseId = String(course._id);
      const courseEnrollments = enrollments.filter(
        (enrollment) => String(enrollment.course?._id || "") === courseId
      );
      const lessonCount = lessonCountByCourse[courseId] || 0;
      const completedLessons = completedByCourse[courseId] || 0;
      const totalPossibleProgress = lessonCount * courseEnrollments.length;
      const completionRate = calculatePercentage(completedLessons, totalPossibleProgress);
      const revenue = courseEnrollments.reduce(
        (sum, enrollment) => sum + (enrollment.course?.price || course.price || 0),
        0
      );

      return {
        id: course._id,
        title: course.title,
        instructor: course.instructor?.name || "Unassigned",
        category: course.category || "Uncategorized",
        published: Boolean(course.published),
        lessons: lessonCount,
        enrollments: courseEnrollments.length,
        revenue,
        completionRate,
        completionUnits: completedLessons,
        possibleUnits: totalPossibleProgress,
      };
    })
    .sort((left, right) => right.enrollments - left.enrollments || right.revenue - left.revenue);

  const instructorMap = new Map();

  courses.forEach((course) => {
    const instructorId = String(course.instructor?._id || course.instructor || "unknown");

    if (!instructorMap.has(instructorId)) {
      instructorMap.set(instructorId, {
        id: instructorId,
        name: course.instructor?.name || "Unassigned",
        email: course.instructor?.email || "",
        courses: 0,
        publishedCourses: 0,
        enrollments: 0,
        revenue: 0,
        completionUnits: 0,
        possibleUnits: 0,
      });
    }

    const entry = instructorMap.get(instructorId);
    const metrics = coursePerformance.find((item) => String(item.id) === String(course._id));

    entry.courses += 1;
    entry.publishedCourses += course.published ? 1 : 0;
    entry.enrollments += metrics?.enrollments || 0;
    entry.revenue += metrics?.revenue || 0;
    entry.completionUnits += metrics?.completionUnits || 0;
    entry.possibleUnits += metrics?.possibleUnits || 0;
  });

  const instructorPerformance = Array.from(instructorMap.values())
    .map((instructor) => ({
      id: instructor.id,
      name: instructor.name,
      email: instructor.email,
      courses: instructor.courses,
      publishedCourses: instructor.publishedCourses,
      enrollments: instructor.enrollments,
      revenue: instructor.revenue,
      completionRate: calculatePercentage(instructor.completionUnits, instructor.possibleUnits),
    }))
    .sort((left, right) => right.revenue - left.revenue || right.enrollments - left.enrollments)
    .slice(0, 6);

  const totalRevenue = coursePerformance.reduce((sum, course) => sum + course.revenue, 0);

  const categoryBreakdown = Object.values(
    coursePerformance.reduce((accumulator, course) => {
      const key = course.category || "Uncategorized";

      if (!accumulator[key]) {
        accumulator[key] = {
          name: key,
          courses: 0,
          enrollments: 0,
          revenue: 0,
        };
      }

      accumulator[key].courses += 1;
      accumulator[key].enrollments += course.enrollments;
      accumulator[key].revenue += course.revenue;

      return accumulator;
    }, {})
  )
    .map((entry) => ({
      ...entry,
      share: calculatePercentage(entry.revenue, totalRevenue),
    }))
    .sort((left, right) => right.revenue - left.revenue || right.enrollments - left.enrollments)
    .slice(0, 6);

  const totalPossibleProgress = coursePerformance.reduce((sum, course) => sum + course.possibleUnits, 0);
  const totalCompletedProgress = coursePerformance.reduce((sum, course) => sum + course.completionUnits, 0);
  const averageCompletionRate = calculatePercentage(totalCompletedProgress, totalPossibleProgress);
  const publishedCourses = courses.filter((course) => course.published).length;
  const monetizedCourses = courses.filter((course) => Number(course.price || 0) > 0).length;

  const platformHealth = [
    {
      key: "publish-rate",
      label: "Publish rate",
      value: `${calculatePercentage(publishedCourses, courses.length)}%`,
      description: `${publishedCourses} of ${courses.length || 0} courses are live`,
    },
    {
      key: "avg-enrollments",
      label: "Avg enrollments / course",
      value: `${roundToSingleDecimal(enrollments.length / Math.max(courses.length, 1))}`,
      description: "Measures how well the catalog converts into learner demand",
    },
    {
      key: "avg-lessons",
      label: "Avg lessons / course",
      value: `${roundToSingleDecimal(lessons.length / Math.max(courses.length, 1))}`,
      description: "Shows the average depth of course content across the platform",
    },
    {
      key: "active-users",
      label: "Active user rate",
      value: `${calculatePercentage(activeUsers, totalUsers)}%`,
      description: `${activeUsers} active accounts out of ${totalUsers || 0}`,
    },
    {
      key: "paid-catalog",
      label: "Paid catalog share",
      value: `${calculatePercentage(monetizedCourses, courses.length)}%`,
      description: `${monetizedCourses} courses currently generate direct revenue`,
    },
  ];

  const topCourse = coursePerformance[0];
  const topCategory = categoryBreakdown[0];

  const insights = [
    topCourse
      ? {
          title: "Top course momentum",
          description: `${topCourse.title} leads with ${topCourse.enrollments} enrollments and ${topCourse.completionRate}% completion.`,
          tone: "positive",
        }
      : null,
    topCategory
      ? {
          title: "Strongest revenue category",
          description: `${topCategory.name} contributes ${topCategory.share}% of tracked revenue across ${topCategory.courses} courses.`,
          tone: "neutral",
        }
      : null,
    {
      title: "Monthly enrollment movement",
      description:
        currentMonthEntry.enrollments >= previousMonthEntry.enrollments
          ? `Enrollments are up ${calculateChange(currentMonthEntry.enrollments, previousMonthEntry.enrollments)}% versus last month.`
          : `Enrollments are down ${Math.abs(calculateChange(currentMonthEntry.enrollments, previousMonthEntry.enrollments))}% versus last month.`,
      tone:
        currentMonthEntry.enrollments >= previousMonthEntry.enrollments ? "positive" : "attention",
    },
    publishedCourses < courses.length
      ? {
          title: "Catalog optimization opportunity",
          description: `${courses.length - publishedCourses} courses are still unpublished and could improve discovery once reviewed.`,
          tone: "attention",
        }
      : {
          title: "Catalog coverage looks healthy",
          description: "All current courses are published, so the admin team can focus on conversion and retention.",
          tone: "positive",
        },
  ].filter(Boolean);

  return {
    summary: {
      totalRevenue,
      totalEnrollments: enrollments.length,
      activeLearners: activeStudents.size,
      totalCourses: courses.length,
      averageCompletionRate,
      currentMonthRevenue: currentMonthEntry.revenue,
      currentMonthRevenueChange: calculateChange(currentMonthEntry.revenue, previousMonthEntry.revenue),
      currentMonthEnrollments: currentMonthEntry.enrollments,
      currentMonthEnrollmentChange: calculateChange(
        currentMonthEntry.enrollments,
        previousMonthEntry.enrollments
      ),
      newUsersThisMonth: currentMonthEntry.newUsers,
      newUsersChange: calculateChange(currentMonthEntry.newUsers, previousMonthEntry.newUsers),
      publishedCourses,
      activeUserRate: calculatePercentage(activeUsers, totalUsers),
    },
    revenueSeries: series,
    roleDistribution,
    coursePerformance: coursePerformance.map(
      ({ completionUnits, possibleUnits, ...course }) => course
    ),
    instructorPerformance,
    categoryBreakdown,
    platformHealth,
    insights,
  };
};

export const getAllAdminUsers = async () => {
  return User.find()
    .sort({ createdAt: -1 })
    .select("name email role isActive createdAt updatedAt");
};

export const createAdminUser = async (data) => {
  const { name, email, password, role, isActive } = data;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("Email already in use", 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "student",
    isActive: isActive !== false,
  });

  return User.findById(user._id).select("name email role isActive createdAt updatedAt");
};

export const updateAdminUser = async (id, data) => {
  const allowedUpdates = {
    name: data.name,
    email: data.email,
    role: data.role,
    isActive: data.isActive,
  };

  const sanitizedUpdates = Object.fromEntries(
    Object.entries(allowedUpdates).filter(([, value]) => value !== undefined)
  );

  const user = await User.findByIdAndUpdate(id, sanitizedUpdates, {
    new: true,
    runValidators: true,
  }).select("name email role isActive createdAt updatedAt");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const deleteAdminUser = async (id) => {
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new AppError("User not found", 404);
  }
};

export const getAllAdminLessons = async (filters = {}) => {
  const query = {};

  if (filters.courseId) {
    query.course = filters.courseId;
  }

  return Lesson.find(query)
    .sort({ createdAt: -1 })
    .populate("course", "title")
    .select("title content videoUrl pdfUrl order published isPreview course createdAt updatedAt");
};

export const createAdminLesson = async (data) => {
  return Lesson.create({
    ...data,
    isPreview: Boolean(data.isPreview),
  });
};

export const updateAdminLesson = async (id, data) => {
  const payload = {
    ...data,
    ...(data.isPreview !== undefined ? { isPreview: Boolean(data.isPreview) } : {}),
  };

  const lesson = await Lesson.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate("course", "title");

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  return lesson;
};

export const deleteAdminLesson = async (id) => {
  const lesson = await Lesson.findByIdAndDelete(id);

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }
};

export const getAllAdminEnrollments = async (filters = {}) => {
  const query = {};

  if (filters.courseId) {
    query.course = filters.courseId;
  }

  if (filters.userId) {
    query.student = filters.userId;
  }

  return Enrollment.find(query)
    .sort({ createdAt: -1 })
    .populate("student", "name email")
    .populate("course", "title price")
    .select("student course enrolledAt createdAt updatedAt");
};

export const deleteAdminEnrollment = async (id) => {
  const enrollment = await Enrollment.findByIdAndDelete(id);

  if (!enrollment) {
    throw new AppError("Enrollment not found", 404);
  }
};
