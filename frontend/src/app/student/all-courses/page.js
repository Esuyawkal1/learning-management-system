"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import CoursePreviewModal from "@/components/landing/CoursePreviewModal";
import StudentCatalogCourseCard from "@/components/student/catalog/StudentCatalogCourseCard";
import { getCourses } from "@/services/course.service";
import { getStudentCourses } from "@/services/student/student.course.service";
import { getCourseCheckoutPath } from "@/utils/courseEnrollment";
import { matchesSearch } from "@/utils/helpers";

function CatalogSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-48 animate-pulse rounded-[2rem] bg-slate-200" />
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-80 animate-pulse rounded-[2rem] bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

export default function StudentAllCoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [previewFilter, setPreviewFilter] = useState("all");
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [previewState, setPreviewState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setSearchQuery(queryFromUrl);
  }, [queryFromUrl]);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const [coursesResponse, enrolledResponse] = await Promise.all([getCourses(), getStudentCourses()]);
      setCourses(coursesResponse || []);
      setEnrolledCourseIds((enrolledResponse?.courses || []).map((course) => course._id));
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Failed to load course catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const categories = useMemo(() => {
    const values = Array.from(new Set(courses.map((course) => course.category).filter(Boolean)));
    return values.sort((left, right) => left.localeCompare(right));
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesCategory = categoryFilter === "all" ? true : course.category === categoryFilter;
      const matchesPreview =
        previewFilter === "all"
          ? true
          : previewFilter === "preview"
            ? Boolean(course.previewLesson)
            : !course.previewLesson;

      return (
        matchesCategory &&
        matchesPreview &&
        matchesSearch([course.title, course.description, course.instructor?.name, course.category], searchQuery)
      );
    });
  }, [categoryFilter, courses, previewFilter, searchQuery]);

  const handleEnroll = async (course) => {
    if (enrolledCourseIds.includes(course._id)) {
      setPreviewState({ course, anchorElement: null });
      return;
    }

    router.push(getCourseCheckoutPath(course._id));
  };

  if (loading) {
    return <CatalogSkeleton />;
  }

  if (error) {
    return <ErrorMessage title="Catalog unavailable" message={error} actionLabel="Retry" onAction={loadCatalog} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-600">All Courses</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Explore the full course catalog without leaving your workspace.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Search the catalog, filter by category, preview selected lessons, and enroll in new learning paths with one click.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-sky-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-sky-700">Available</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{courses.length}</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Preview Ready</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {courses.filter((course) => course.previewLesson).length}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-100 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Enrolled</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{enrolledCourseIds.length}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search courses, instructors, or categories..."
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
          />
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={previewFilter}
            onChange={(event) => setPreviewFilter(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
          >
            <option value="all">All access types</option>
            <option value="preview">Preview available</option>
            <option value="locked">No preview yet</option>
          </select>
        </div>
      </section>

      {filteredCourses.length ? (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <StudentCatalogCourseCard
              key={course._id}
              course={course}
              isEnrolled={enrolledCourseIds.includes(course._id)}
              onEnroll={handleEnroll}
              onPreview={(selectedCourse, anchorElement) => setPreviewState({ course: selectedCourse, anchorElement })}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No courses match these filters"
          description="Try a broader search or clear one of the filters to see more available courses."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearchQuery("");
            setCategoryFilter("all");
            setPreviewFilter("all");
          }}
        />
      )}

      <CoursePreviewModal
        course={previewState?.course}
        anchorElement={previewState?.anchorElement}
        isEnrolled={previewState?.course ? enrolledCourseIds.includes(previewState.course._id) : false}
        onClose={() => setPreviewState(null)}
      />
    </div>
  );
}
