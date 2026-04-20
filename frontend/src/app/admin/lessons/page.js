"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "@/components/common/icons";
import LessonTable from "@/components/admin/lessons/LessonTable";
import LessonModal from "@/components/admin/lessons/LessonModal";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import Pagination from "@/components/common/Pagination";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { getAdminCourses } from "@/services/admin/course.service";
import {
  createAdminLesson,
  deleteAdminLesson,
  getAdminLessons,
  updateAdminLesson,
} from "@/services/admin/lesson.service";
import { notify } from "@/store/notification.store";
import { matchesSearch, paginateItems } from "@/utils/helpers";

const PAGE_SIZE = 7;

export default function AdminLessonsPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadLessonsData = async () => {
    try {
      setLoading(true);
      const [coursesResponse, lessonsResponse] = await Promise.all([
        getAdminCourses(),
        getAdminLessons(),
      ]);

      setCourses(coursesResponse || []);
      setLessons(lessonsResponse || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Failed to load lessons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessonsData();
  }, []);

  const filteredLessons = lessons.filter((lesson) => {
    const matchesCourse = courseFilter === "all" ? true : lesson.course?._id === courseFilter;
    const matchesQuery = matchesSearch([lesson.title, lesson.course?.title, lesson.content], searchQuery);
    return matchesCourse && matchesQuery;
  });

  const totalPages = Math.max(Math.ceil(filteredLessons.length / PAGE_SIZE), 1);
  const paginatedLessons = paginateItems(filteredLessons, currentPage, PAGE_SIZE);

  const handleSaveLesson = async (formData) => {
    try {
      setIsSubmitting(true);

      if (selectedLesson) {
        await updateAdminLesson(selectedLesson._id, formData);
        notify({
          type: "success",
          title: "Lesson updated",
          message: "The lesson has been saved successfully.",
        });
      } else {
        await createAdminLesson(formData);
        notify({
          type: "success",
          title: "Lesson created",
          message: "The lesson was added to the selected course.",
        });
      }

      setSelectedLesson(null);
      setIsLessonModalOpen(false);
      await loadLessonsData();
    } catch (requestError) {
      notify({
        type: "error",
        title: "Unable to save lesson",
        message: requestError.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAdminLesson(lessonToDelete._id);
      notify({
        type: "success",
        title: "Lesson deleted",
        message: "The lesson was removed successfully.",
      });
      setLessonToDelete(null);
      await loadLessonsData();
    } catch (requestError) {
      notify({
        type: "error",
        title: "Unable to delete lesson",
        message: requestError.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <Loader label="Loading lessons..." />;
  }

  if (error) {
    return <ErrorMessage title="Lessons unavailable" message={error} actionLabel="Retry" onAction={loadLessonsData} />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Lessons</h2>
            <p className="mt-1 text-sm text-slate-500">Create, edit, delete, and assign lessons to the right course.</p>
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
                placeholder="Search lessons..."
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

          <button
  type="button"
  onClick={() => router.push("/admin/lessons/create")}
  className="flex items-center justify-center gap-3 rounded-2xl bg-[#0c1421] px-7 py-4 text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95"
>
  <Plus className="h-5 w-5" />
  <span className="text-left text-[13px] font-bold leading-tight tracking-wide">
    Add<br />Lesson
  </span>
</button>

          </div>
        </div>
      </div>

      {filteredLessons.length ? (
        <>
          <LessonTable
            lessons={paginatedLessons}
            onEdit={(lesson) => {
              setSelectedLesson(lesson);
              setIsLessonModalOpen(true);
            }}
            onDelete={setLessonToDelete}
          />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : (
        <EmptyState
          title="No lessons found"
          description="Try changing the course filter or create the first lesson for one of your courses."
          actionLabel="Create Lesson"
          onAction={() => router.push("/admin/lessons/create")}
        />
      )}

      <LessonModal
        isOpen={isLessonModalOpen}
        lesson={selectedLesson}
        courses={courses}
        onClose={() => {
          setSelectedLesson(null);
          setIsLessonModalOpen(false);
        }}
        onSubmit={handleSaveLesson}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        isOpen={Boolean(lessonToDelete)}
        title="Delete lesson"
        description={`This will permanently remove "${lessonToDelete?.title || "this lesson"}".`}
        confirmLabel="Delete Lesson"
        onClose={() => setLessonToDelete(null)}
        onConfirm={handleDeleteLesson}
        isLoading={isDeleting}
      />
    </div>
  );
}
