"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CourseFilters from "@/components/admin/courses/CourseFilters";
import CourseTable from "@/components/admin/courses/CourseTable";
import CourseModal from "@/components/admin/courses/CourseModal";
import Loader from "@/components/common/Loader";
import ErrorMessage from "@/components/common/ErrorMessage";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import Modal from "@/components/common/Modal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { getAdminCourses, createCourse, updateCourse, deleteCourse } from "@/services/admin/course.service";
import { getAdminEnrollments } from "@/services/admin/enrollment.service";
import { notify } from "@/store/notification.store";
import { matchesSearch, paginateItems, formatDate } from "@/utils/helpers";

const PAGE_SIZE = 6;

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [studentsCourse, setStudentsCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCoursesData = async () => {
    try {
      setLoading(true);
      const [coursesResponse, enrollmentsResponse] = await Promise.all([
        getAdminCourses(),
        getAdminEnrollments(),
      ]);

      setCourses(coursesResponse || []);
      setEnrollments(enrollmentsResponse || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoursesData();
  }, []);

  const filteredCourses = courses.filter((course) =>
    matchesSearch([course.title, course.category, course.instructor?.name], searchQuery)
  );

  const totalPages = Math.max(Math.ceil(filteredCourses.length / PAGE_SIZE), 1);
  const paginatedCourses = paginateItems(filteredCourses, currentPage, PAGE_SIZE);

  const studentCounts = enrollments.reduce((accumulator, enrollment) => {
    const courseId = enrollment.course?._id;

    if (courseId) {
      accumulator[courseId] = (accumulator[courseId] || 0) + 1;
    }

    return accumulator;
  }, {});

  const selectedCourseStudents = studentsCourse
    ? enrollments.filter((enrollment) => enrollment.course?._id === studentsCourse._id)
    : [];

  const handleSaveCourse = async (formData) => {
    try {
      setIsSubmitting(true);

      if (selectedCourse) {
        await updateCourse(selectedCourse._id, formData);
        notify({
          type: "success",
          title: "Course updated",
          message: "The course details were saved successfully.",
        });
      } else {
        await createCourse(formData);
        notify({
          type: "success",
          title: "Course created",
          message: "A new course has been added to the catalog.",
        });
      }

      setIsCourseModalOpen(false);
      setSelectedCourse(null);
      await loadCoursesData();
    } catch (requestError) {
      notify({
        type: "error",
        title: "Unable to save course",
        message: requestError.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteCourse(courseToDelete._id);
      notify({
        type: "success",
        title: "Course deleted",
        message: "The course was removed successfully.",
      });
      setCourseToDelete(null);
      await loadCoursesData();
    } catch (requestError) {
      notify({
        type: "error",
        title: "Unable to delete course",
        message: requestError.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <Loader label="Loading courses..." />;
  }

  if (error) {
    return <ErrorMessage title="Courses unavailable" message={error} actionLabel="Retry" onAction={loadCoursesData} />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Courses</h2>
            <p className="mt-1 text-sm text-slate-500">Search, create, publish, update, and review student participation across your course catalog.</p>
          </div>
          <CourseFilters
            searchValue={searchQuery}
            onSearchChange={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            onCreate={() => router.push("/admin/courses/create")}
          />
        </div>
      </div>

      {filteredCourses.length ? (
        <>
          <CourseTable
            courses={paginatedCourses}
            studentCounts={studentCounts}
            onViewStudents={setStudentsCourse}
            onEdit={(course) => {
              setSelectedCourse(course);
              setIsCourseModalOpen(true);
            }}
            onDelete={setCourseToDelete}
          />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : (
        <EmptyState
          title="No courses found"
          description="Try adjusting your search or create a new course to populate this section."
          actionLabel="Create Course"
          onAction={() => router.push("/admin/courses/create")}
        />
      )}

      <CourseModal
        isOpen={isCourseModalOpen}
        course={selectedCourse}
        onClose={() => {
          setSelectedCourse(null);
          setIsCourseModalOpen(false);
        }}
        onSubmit={handleSaveCourse}
        isSubmitting={isSubmitting}
      />

      <Modal
        isOpen={Boolean(studentsCourse)}
        onClose={() => setStudentsCourse(null)}
        title={studentsCourse ? `${studentsCourse.title} students` : "Course students"}
        description="Review the learners currently enrolled in this course."
        maxWidth="max-w-3xl"
      >
        {selectedCourseStudents.length ? (
          <div className="space-y-3">
            {selectedCourseStudents.map((enrollment) => (
              <div key={enrollment._id} className="rounded-2xl border border-slate-100 px-4 py-3">
                <p className="font-semibold text-slate-900">{enrollment.student?.name || "Learner"}</p>
                <p className="mt-1 text-sm text-slate-500">{enrollment.student?.email || "No email available"}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                  Enrolled {formatDate(enrollment.createdAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No enrolled students"
            description="This course does not have any student enrollments yet."
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(courseToDelete)}
        title="Delete course"
        description={`This will permanently delete "${courseToDelete?.title || "this course"}".`}
        confirmLabel="Delete Course"
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleDeleteCourse}
        isLoading={isDeleting}
      />
    </div>
  );
}
