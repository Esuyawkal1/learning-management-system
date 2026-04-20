"use client";

import { useEffect, useState } from "react";
import { getCourses } from "@/services/course.service";
import CourseCard from "@/components/landing/CourseCard";
import CoursePreviewModal from "@/components/landing/CoursePreviewModal";
import Footer from "@/components/landing/Footer";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import { getStudentCourses } from "@/services/student/student.course.service";
import useAuthStore from "@/store/auth.store";
import { isStudentUser } from "@/utils/courseEnrollment";

export default function CoursesPage() {
  const user = useAuthStore((state) => state.user);
  const [previewState, setPreviewState] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

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

  let content = (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">Loading courses...</div>
  );

  if (error) {
    content = (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorMessage title="Courses unavailable" message={error} actionLabel="Retry" onAction={loadCourses} />
      </div>
    );
  } else if (!loading) {
    content = (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-500">Course Catalog</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Browse published courses and preview selected lessons.</h1>
        </div>

        {courses.length ? (
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
        ) : (
          <div className="mt-10">
            <EmptyState title="No courses published yet" description="Check back soon for new learning paths." />
          </div>
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

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/70">
      <div className="flex-1">{content}</div>
      <Footer />
    </div>
  );
}
