import { redirect } from "next/navigation";

export default async function LegacyLearnPage({ params }) {
  const resolvedParams = await params;

  redirect(`/student/course/${resolvedParams?.courseId || ""}/learn`);
}
