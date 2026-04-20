"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import ContinueLearningCard from "@/components/student/dashboard/ContinueLearningCard";
import EnrolledCourses from "@/components/student/dashboard/EnrolledCourses";
import WelcomeBanner from "@/components/student/dashboard/WelcomeBanner";
import { getStudentDashboard } from "@/services/student/student.course.service";
import useAuthStore from "@/store/auth.store";

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-56 rounded-[2rem] bg-slate-200" />
      <div className="h-80 rounded-[2rem] bg-slate-200" />
    </div>
  );
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await getStudentDashboard();
        setDashboard(response);
        setError("");
      } catch (requestError) {
        setError(requestError.message || "Failed to load student dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorMessage title="Dashboard unavailable" message={error} actionLabel="Retry" onAction={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      <WelcomeBanner userName={user?.name} stats={dashboard} />

      {!dashboard?.totalEnrolledCourses ? (
        <EmptyState
          title="No enrolled courses yet"
          description="Browse the course catalog and enroll to unlock your new student workspace."
          actionLabel="Browse Courses"
          onAction={() => router.push("/courses")}
        />
      ) : (
        <>
          <ContinueLearningCard course={dashboard?.continueLearning} />
          <EnrolledCourses courses={dashboard?.enrolledCourses || []} />
        </>
      )}
    </div>
  );
}
