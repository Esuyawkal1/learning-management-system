"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Plus } from "@/components/common/icons";
import StatsCards from "@/components/instructor/dashboard/StatsCards";
import RecentCourses from "@/components/instructor/dashboard/RecentCourses";
import RecentStudents from "@/components/instructor/dashboard/RecentStudents";
import RecentLessons from "@/components/instructor/dashboard/RecentLessons";
import ActivityFeed from "@/components/instructor/dashboard/ActivityFeed";
import Loader from "@/components/common/Loader";
import ErrorMessage from "@/components/common/ErrorMessage";
import { getInstructorDashboard } from "@/services/instructor/instructor.analytics.service";

export default function InstructorDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await getInstructorDashboard();
        setDashboard(response);
        setError("");
      } catch (requestError) {
        setError(requestError.message || "Failed to load instructor dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <Loader label="Loading instructor dashboard..." />;
  if (error) return <ErrorMessage title="Dashboard unavailable" message={error} actionLabel="Retry" onAction={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-slate-850 px-6 py-8 text-black shadow-2xl shadow-slate-900/10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-200">Instructor Dashboard</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Run your teaching operation with one focused workspace.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-900">Manage courses, publish lessons, monitor enrollments, track completion, and stay close to students without leaving the instructor portal.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/instructor/courses" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100">
              <Plus className="h-4 w-4" />
              New Course
            </Link>
            <Link href="/instructor/messages" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-black hover:bg-black/10">
              Open Messages
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <StatsCards stats={dashboard} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecentCourses courses={dashboard?.recentCourses || []} />
        <RecentStudents students={dashboard?.recentStudents || []} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecentLessons lessons={dashboard?.recentLessons || []} />
        <ActivityFeed items={dashboard?.activityFeed || []} />
      </div>
    </div>
  );
}
