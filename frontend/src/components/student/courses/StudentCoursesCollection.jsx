"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import CourseGrid from "@/components/student/courses/CourseGrid";
import { getStudentCourses } from "@/services/student/student.course.service";
import { matchesSearch } from "@/utils/helpers";

function CoursesSkeleton() {
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

const PAGE_COPY = {
  eyebrow: "My Courses",
  title: "All enrolled courses, progress, and resume shortcuts in one place.",
  description:
    "Track every enrolled course, monitor live progress, and jump back into any lesson without losing your place.",
  emptyTitle: "No courses match this view",
  emptyDescription:
    "Try a different search term or browse the full catalog to discover your next course.",
};

export default function StudentCoursesCollection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await getStudentCourses();
      setData(response);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Failed to load your courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    const baseCourses = data?.courses || [];
    return baseCourses
      .filter((course) =>
        matchesSearch(
          [course.title, course.instructor?.name, course.category, String(course.progressPercentage || 0)],
          searchQuery
        )
      )
      .sort(
        (left, right) => Number(right.progressPercentage || 0) - Number(left.progressPercentage || 0)
      );
  }, [data?.courses, searchQuery]);

  if (loading) {
    return <CoursesSkeleton />;
  }

  if (error) {
    return <ErrorMessage title="Courses unavailable" message={error} actionLabel="Retry" onAction={loadCourses} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-600">{PAGE_COPY.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">{PAGE_COPY.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">{PAGE_COPY.description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-sky-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-sky-700">Courses</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{data?.stats?.totalCourses || 0}</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Completed</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{data?.stats?.completedCourses || 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-100 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Overall Progress</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{data?.stats?.progressPercentage || 0}%</p>
            </div>
          </div>
        </div>
      </section>

      {filteredCourses.length ? (
        <CourseGrid courses={filteredCourses} />
      ) : (
        <EmptyState
          title={PAGE_COPY.emptyTitle}
          description={PAGE_COPY.emptyDescription}
          actionLabel="Browse All Courses"
          onAction={() => router.push("/student/all-courses")}
        />
      )}
    </div>
  );
}
