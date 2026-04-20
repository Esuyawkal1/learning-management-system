"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "@/components/common/icons";
import Loader from "@/components/common/Loader";
import ErrorMessage from "@/components/common/ErrorMessage";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import LessonTable from "@/components/instructor/lessons/LessonTable";
import { getInstructorCourses } from "@/services/instructor/instructor.course.service";
import { deleteInstructorLesson, getInstructorLessons, reorderInstructorLessons } from "@/services/instructor/instructor.lesson.service";
import { notify } from "@/store/notification.store";
import { matchesSearch, paginateItems } from "@/utils/helpers";

const PAGE_SIZE = 7;

export default function InstructorLessonsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesResponse, lessonsResponse] = await Promise.all([getInstructorCourses(), getInstructorLessons()]);
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
    loadData();
  }, []);

  useEffect(() => {
    const presetCourseId = searchParams.get("course");

    if (presetCourseId) {
      setCourseFilter(presetCourseId);
    }
  }, [searchParams]);

  const filteredLessons = useMemo(() => lessons.filter((lesson) => (courseFilter === "all" ? true : lesson.course?._id === courseFilter) && matchesSearch([lesson.title, lesson.course?.title, lesson.content], searchQuery)), [courseFilter, lessons, searchQuery]);
  const totalPages = Math.max(Math.ceil(filteredLessons.length / PAGE_SIZE), 1);
  const paginatedLessons = paginateItems(filteredLessons, currentPage, PAGE_SIZE);
  const createCourseId = courseFilter !== "all" ? courseFilter : courses[0]?._id;
  const emptyStateActionLabel = createCourseId ? "Create Lesson" : "Create Course";

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return;
    try {
      setIsDeleting(true);
      await deleteInstructorLesson(lessonToDelete._id);
      notify({ type: "success", title: "Lesson deleted", message: "The lesson was removed." });
      setLessonToDelete(null);
      await loadData();
    } catch (requestError) {
      notify({ type: "error", title: "Unable to delete lesson", message: requestError.message });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMoveLesson = async (lesson, direction) => {
    const courseLessons = lessons.filter((item) => item.course?._id === lesson.course?._id).sort((a, b) => a.order - b.order);
    const currentIndex = courseLessons.findIndex((item) => item._id === lesson._id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= courseLessons.length) return;

    const reordered = [...courseLessons];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    try {
      await reorderInstructorLessons(lesson.course?._id, reordered.map((item) => item._id));
      notify({ type: "success", title: "Lesson order updated", message: "Lesson order was saved." });
      await loadData();
    } catch (requestError) {
      notify({ type: "error", title: "Unable to reorder lessons", message: requestError.message });
    }
  };

  if (loading) return <Loader label="Loading lessons..." />;
  if (error) return <ErrorMessage title="Lessons unavailable" message={error} actionLabel="Retry" onAction={loadData} />;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Lessons</h2>
            <p className="mt-1 text-sm text-slate-500">Create lesson content, upload materials, and reorder delivery.</p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500">
              <Search className="h-4 w-4" />
              <input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search lessons..." className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400" />
            </label>
            <select value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); setCurrentPage(1); }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <option value="all">All courses</option>
              {courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
            </select>
            <button type="button" onClick={() => { if (createCourseId) { router.push(`/instructor/courses/${createCourseId}/lessons`); } }} disabled={!createCourseId} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
              <Plus className="h-4 w-4" />
              Create Lesson
            </button>
          </div>
        </div>
      </div>

      {filteredLessons.length ? (
        <>
          <LessonTable
            lessons={paginatedLessons}
            onMove={handleMoveLesson}
            onEdit={(lesson) => {
              const nextCourseId = lesson.course?._id || lesson.course || "";
              const destination = nextCourseId
                ? `/instructor/lessons/${lesson._id}/edit?course=${encodeURIComponent(nextCourseId)}`
                : `/instructor/lessons/${lesson._id}/edit`;
              router.push(destination);
            }}
            onDelete={setLessonToDelete}
          />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : (
        <EmptyState title="No lessons found" description="Create your first lesson or adjust the current filters." actionLabel={emptyStateActionLabel} onAction={() => { if (createCourseId) { router.push(`/instructor/courses/${createCourseId}/lessons`); return; } router.push("/instructor/courses"); }} />
      )}

      <ConfirmDialog isOpen={Boolean(lessonToDelete)} title="Delete lesson" description={`This will permanently delete "${lessonToDelete?.title || "this lesson"}".`} confirmLabel="Delete Lesson" onClose={() => setLessonToDelete(null)} onConfirm={handleDeleteLesson} isLoading={isDeleting} />
    </div>
  );
}
