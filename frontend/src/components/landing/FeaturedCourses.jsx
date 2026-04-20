"use client";

import { useEffect, useState } from "react";
import CourseCard from "@/components/landing/CourseCard";
import CoursePreviewModal from "@/components/landing/CoursePreviewModal";
import { getStudentCourses } from "@/services/student/student.course.service";
import useAuthStore from "@/store/auth.store";
import { isStudentUser } from "@/utils/courseEnrollment";

export default function FeaturedCourses({ courses = [] }) {
  const user = useAuthStore((state) => state.user);
  const [previewState, setPreviewState] = useState(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadEnrollments = async () => {
      if (!isStudentUser(user)) {
        if (isMounted) {
          setEnrolledCourseIds([]);
        }
        return;
      }

      try {
        const response = await getStudentCourses();

        if (isMounted) {
          setEnrolledCourseIds((response?.courses || []).map((course) => course._id));
        }
      } catch (_error) {
        if (isMounted) {
          setEnrolledCourseIds([]);
        }
      }
    };

    loadEnrollments();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <section id="featured" className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-500">Featured catalog</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
            Preview what students are learning right now.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Browse featured and trending courses from the live database. Every card opens a preview-first experience before the full enrollment step.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <CourseCard
            key={course._id}
            course={course}
            isEnrolled={enrolledCourseIds.includes(course._id)}
            onPreview={(selectedCourse, anchorElement) => setPreviewState({ course: selectedCourse, anchorElement })}
          />
        ))}
      </div>

      {!courses.length ? (
        <div className="mt-10 rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
          Featured courses will appear here as soon as published content is available.
        </div>
      ) : null}

      <CoursePreviewModal
        course={previewState?.course}
        anchorElement={previewState?.anchorElement}
        isEnrolled={previewState?.course ? enrolledCourseIds.includes(previewState.course._id) : false}
        onClose={() => setPreviewState(null)}
      />
    </section>
  );
}
