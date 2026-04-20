"use client";

import { useEffect, useState } from "react";
import { Search } from "@/components/common/icons";
import EnrollmentTable from "@/components/admin/enrollments/EnrollmentTable";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import Pagination from "@/components/common/Pagination";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { getAdminCourses } from "@/services/admin/course.service";
import { getAdminUsers } from "@/services/admin/user.service";
import {
  deleteAdminEnrollment,
  getAdminEnrollments,
} from "@/services/admin/enrollment.service";
import { notify } from "@/store/notification.store";
import { matchesSearch, paginateItems } from "@/utils/helpers";

const PAGE_SIZE = 8;

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadEnrollmentData = async () => {
    try {
      setLoading(true);
      const [enrollmentsResponse, coursesResponse, usersResponse] = await Promise.all([
        getAdminEnrollments(),
        getAdminCourses(),
        getAdminUsers(),
      ]);

      setEnrollments(enrollmentsResponse || []);
      setCourses(coursesResponse || []);
      setUsers(usersResponse || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Failed to load enrollments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollmentData();
  }, []);

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesCourse = courseFilter === "all" ? true : enrollment.course?._id === courseFilter;
    const matchesUser = userFilter === "all" ? true : enrollment.student?._id === userFilter;
    const matchesQuery = matchesSearch(
      [enrollment.student?.name, enrollment.student?.email, enrollment.course?.title],
      searchQuery
    );

    return matchesCourse && matchesUser && matchesQuery;
  });

  const totalPages = Math.max(Math.ceil(filteredEnrollments.length / PAGE_SIZE), 1);
  const paginatedEnrollments = paginateItems(filteredEnrollments, currentPage, PAGE_SIZE);

  const handleDeleteEnrollment = async () => {
    if (!enrollmentToDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAdminEnrollment(enrollmentToDelete._id);
      notify({
        type: "success",
        title: "Enrollment deleted",
        message: "The enrollment record was removed successfully.",
      });
      setEnrollmentToDelete(null);
      await loadEnrollmentData();
    } catch (requestError) {
      notify({
        type: "error",
        title: "Unable to delete enrollment",
        message: requestError.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <Loader label="Loading enrollments..." />;
  }

  if (error) {
    return <ErrorMessage title="Enrollments unavailable" message={error} actionLabel="Retry" onAction={loadEnrollmentData} />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Enrollments</h2>
            <p className="mt-1 text-sm text-slate-500">Filter by learner or course and clean up stale enrollment records.</p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500">
              <Search className="h-4 w-4" />
              <input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                }}
                type="search"
                placeholder="Search enrollments..."
                className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400"
              />
            </label>

            <select
              value={courseFilter}
              onChange={(event) => {
                setCourseFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
            >
              <option value="all">All courses</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>

            <select
              value={userFilter}
              onChange={(event) => {
                setUserFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
            >
              <option value="all">All users</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredEnrollments.length ? (
        <>
          <EnrollmentTable enrollments={paginatedEnrollments} onDelete={setEnrollmentToDelete} />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : (
        <EmptyState
          title="No enrollments found"
          description="Adjust the filters or wait for new learner enrollments to appear."
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(enrollmentToDelete)}
        title="Delete enrollment"
        description={`Remove ${enrollmentToDelete?.student?.name || "this learner"} from ${enrollmentToDelete?.course?.title || "the course"}?`}
        confirmLabel="Delete Enrollment"
        onClose={() => setEnrollmentToDelete(null)}
        onConfirm={handleDeleteEnrollment}
        isLoading={isDeleting}
      />
    </div>
  );
}
