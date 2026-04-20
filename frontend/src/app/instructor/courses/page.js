"use client";

import { useEffect, useState } from "react";
import { Filter, Plus, Search } from "@/components/common/icons";
import { useRouter } from "next/navigation";
import Loader from "@/components/common/Loader";
import ErrorMessage from "@/components/common/ErrorMessage";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import Modal from "@/components/common/Modal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import InstructorCourseTable from "@/components/instructor/courses/InstructorCourseTable";
import CourseStudentsTable from "@/components/instructor/courses/CourseStudentsTable";
import { deleteInstructorCourse, getInstructorCourses } from "@/services/instructor/instructor.course.service";
import { getInstructorStudents } from "@/services/instructor/instructor.student.service";
import { notify } from "@/store/notification.store";
import { matchesSearch, paginateItems } from "@/utils/helpers";

const PAGE_SIZE = 6;

export default function InstructorCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [studentsCourse, setStudentsCourse] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesResponse, studentsResponse] = await Promise.all([getInstructorCourses(), getInstructorStudents()]);
      setCourses(coursesResponse || []);
      setStudents(studentsResponse || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const statusMatch = statusFilter === "all" ? true : statusFilter === "published" ? course.published : !course.published;
    const searchMatch = matchesSearch([course.title, course.category, course.description], searchQuery);
    return statusMatch && searchMatch;
  });

  const studentCounts = students.reduce((accumulator, student) => {
    const courseId = student.course?._id;
    if (courseId) accumulator[courseId] = (accumulator[courseId] || 0) + 1;
    return accumulator;
  }, {});

  const totalPages = Math.max(Math.ceil(filteredCourses.length / PAGE_SIZE), 1);
  const paginatedCourses = paginateItems(filteredCourses, currentPage, PAGE_SIZE);
  const courseStudents = studentsCourse ? students.filter((student) => student.course?._id === studentsCourse._id) : [];

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      setIsDeleting(true);
      await deleteInstructorCourse(courseToDelete._id);
      notify({ type: "success", title: "Course deleted", message: "The course and its related teaching content were removed." });
      setCourseToDelete(null);
      await loadData();
    } catch (requestError) {
      notify({ type: "error", title: "Unable to delete course", message: requestError.message });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <Loader label="Loading courses..." />;
  if (error) return <ErrorMessage title="Courses unavailable" message={error} actionLabel="Retry" onAction={loadData} />;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">My Courses</h2>
            <p className="mt-1 text-sm text-slate-500">Create and refine the courses you own while admins control student-facing publication.</p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500">
              <Search className="h-4 w-4" />
              <input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search courses..." className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400" />
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-500">
              <Filter className="h-4 w-4" />
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="bg-transparent text-sm text-slate-700">
                <option value="all">All courses</option>
                <option value="published">Published</option>
                <option value="pending">Pending</option>
              </select>
            </label>
            <button type="button" onClick={() => router.push("/instructor/courses/create")} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">
              <Plus className="h-4 w-4" />
              Create Course
            </button>
          </div>
        </div>
      </div>

      {filteredCourses.length ? (
        <>
          <InstructorCourseTable
            courses={paginatedCourses}
            studentCounts={studentCounts}
            onEdit={(course) => {
              router.push(`/instructor/${encodeURIComponent(course._id)}/edit`);
            }}
            onDelete={setCourseToDelete}
            onViewStudents={setStudentsCourse}
          />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : (
        <EmptyState title="No courses found" description="Create your first course or broaden the current filters." actionLabel="Create Course" onAction={() => router.push("/instructor/courses/create")} />
      )}

      <Modal isOpen={Boolean(studentsCourse)} onClose={() => setStudentsCourse(null)} title={studentsCourse ? `${studentsCourse.title} students` : "Students"} description="Students enrolled in this course." maxWidth="max-w-4xl">
        {courseStudents.length ? <CourseStudentsTable students={courseStudents} /> : <EmptyState title="No students yet" description="This course has no enrollments yet." />}
      </Modal>

      <ConfirmDialog isOpen={Boolean(courseToDelete)} title="Delete course" description={`This will permanently remove "${courseToDelete?.title || "this course"}" and its related lessons/enrollments.`} confirmLabel="Delete Course" onClose={() => setCourseToDelete(null)} onConfirm={handleDeleteCourse} isLoading={isDeleting} />
    </div>
  );
}
