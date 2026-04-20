import { redirect } from "next/navigation";

export default async function LegacyStudentCoursePage({ params }) {
  const resolvedParams = await params;

  redirect(`/student/course/${resolvedParams?.courseId || ""}/learn`);
}
