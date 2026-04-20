"use client";

import { useEffect, useState } from "react";
import { Search } from "@/components/common/icons";
import Loader from "@/components/common/Loader";
import ErrorMessage from "@/components/common/ErrorMessage";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import StudentTable from "@/components/instructor/students/StudentTable";
import { getInstructorCourses } from "@/services/instructor/instructor.course.service";
import { getInstructorStudents } from "@/services/instructor/instructor.student.service";
import { matchesSearch, paginateItems } from "@/utils/helpers";

const PAGE_SIZE = 8;

export default function InstructorStudentsPage() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesResponse, studentsResponse] = await Promise.all([getInstructorCourses(), getInstructorStudents()]);
      setCourses(coursesResponse || []);
      setStudents(studentsResponse || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudents = students.filter((student) => (courseFilter === "all" ? true : student.course?._id === courseFilter) && matchesSearch([student.student?.name, student.student?.email, student.course?.title], searchQuery));
  const totalPages = Math.max(Math.ceil(filteredStudents.length / PAGE_SIZE), 1);
  const paginatedStudents = paginateItems(filteredStudents, currentPage, PAGE_SIZE);

  if (loading) return <Loader label="Loading students..." />;
  if (error) return <ErrorMessage title="Students unavailable" message={error} actionLabel="Retry" onAction={loadData} />;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Students</h2>
            <p className="mt-1 text-sm text-slate-500">See enrolled learners, filter by course, and track completion progress.</p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500">
              <Search className="h-4 w-4" />
              <input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search students..." className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400" />
            </label>
            <select value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); setCurrentPage(1); }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <option value="all">All courses</option>
              {courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
            </select>
          </div>
        </div>
      </div>

      {filteredStudents.length ? (
        <>
          <StudentTable students={paginatedStudents} />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : (
        <EmptyState title="No students found" description="Wait for new enrollments or adjust the current filters." />
      )}
    </div>
  );
}
