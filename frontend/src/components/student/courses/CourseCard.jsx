"use client";

import { useEffect, useState } from "react";
import { PlayCircle } from "@/components/common/icons";
import CourseLikeControl from "@/components/courses/CourseLikeControl";
import CourseThumbnailPreview from "@/components/courses/CourseThumbnailPreview";
import LearningLaunchButton from "@/components/student/learning/LearningLaunchButton";
import CourseProgressBar from "@/components/student/courses/CourseProgressBar";
import { toggleStudentCourseLike } from "@/services/student/student.course.service";
import { notify } from "@/store/notification.store";

export default function CourseCard({ course }) {
  const thumbnailSrc = course.thumbnail || course.thumbnailUrl || "";
  const isCourseComplete = Number(course.progressPercentage || 0) >= 100;
  const [likesCount, setLikesCount] = useState(Number(course.likesCount || 0));
  const [isLiked, setIsLiked] = useState(Boolean(course.isLiked));
  const [isUpdatingLike, setIsUpdatingLike] = useState(false);

  useEffect(() => {
    setLikesCount(Number(course.likesCount || 0));
    setIsLiked(Boolean(course.isLiked));
  }, [course.isLiked, course.likesCount]);

  const thumbnailContent = (
    <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-slate-100">
      <CourseThumbnailPreview src={thumbnailSrc} alt={course.title} />
    </div>
  );

  const handleToggleLike = async () => {
    try {
      setIsUpdatingLike(true);
      const response = await toggleStudentCourseLike(course._id);
      setLikesCount(Number(response?.likesCount || 0));
      setIsLiked(Boolean(response?.isLiked));
    } catch (error) {
      notify({
        type: "error",
        title: "Unable to update like",
        message: error.message || "Please try again in a moment.",
      });
    } finally {
      setIsUpdatingLike(false);
    }
  };

  return (
    <article className="flex h-full flex-col rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
      <div className="flex h-full flex-col gap-5">
        <LearningLaunchButton
          courseId={course._id}
          mode="resume"
          fallbackLessonId={course.currentLessonId}
          className="block w-full cursor-pointer rounded-2xl text-left transition hover:opacity-95"
          loadingLabel="Opening..."
        >
          {thumbnailContent}
        </LearningLaunchButton>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-slate-900">{course.title}</h3>
            <p className="mt-2 text-sm text-slate-500">
              Instructor: {course.instructor?.name || "Assigned instructor"}
            </p>
          </div>

          <CourseLikeControl
            likesCount={likesCount}
            isLiked={isLiked}
            interactive
            disabled={isUpdatingLike}
            onClick={handleToggleLike}
            className="shrink-0"
          />
        </div>

        <div>
          <CourseProgressBar value={course.progressPercentage} />
        </div>

        <div className="mt-auto flex flex-wrap gap-3 pt-1">
          <LearningLaunchButton
            courseId={course._id}
            mode="resume"
            fallbackLessonId={course.currentLessonId}
            icon={PlayCircle}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            loadingLabel="Opening..."
          >
            {isCourseComplete ? "Review" : "Continue"}
          </LearningLaunchButton>
        </div>
      </div>
    </article>
  );
}
