import StudentCourseWorkspace from "@/components/student/courses/StudentCourseWorkspace";

export default async function StudentCoursePage({ params }) {
  const resolvedParams = await params;

  return <StudentCourseWorkspace courseId={resolvedParams?.courseId || ""} />;
}
