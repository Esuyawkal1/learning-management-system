import CourseLearningLayout from "@/components/student/learning/CourseLearningLayout";

export default async function StudentCourseLearningPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <CourseLearningLayout
      courseId={resolvedParams?.courseId || ""}
      initialLessonId={resolvedSearchParams?.lessonId || ""}
    />
  );
}
