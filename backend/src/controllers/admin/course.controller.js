// // src/controllers/admin/course.controller.js
// import Course from "../../models/Course.model.js";
// import asyncHandler from "../../utils/asyncHandler.js";

// // Admin: Get all courses
// export const getAllCourses = asyncHandler(async (req, res) => {
//   const courses = await Course.find().populate("lessons");
//   res.status(200).json({ success: true, data: courses });
// });

// // Admin: Create course
// export const createCourse = asyncHandler(async (req, res) => {
//   const course = await Course.create(req.body);
//   res.status(201).json({ success: true, data: course });
// });