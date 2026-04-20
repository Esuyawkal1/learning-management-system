"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Plus } from "@/components/common/icons";
import StatsCards from "@/components/admin/dashboard/StatsCards";
import RecentCourses from "@/components/admin/dashboard/RecentCourses";
import RecentUsers from "@/components/admin/dashboard/RecentUsers";
import ActivityFeed from "@/components/admin/dashboard/ActivityFeed";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import Loader from "@/components/common/Loader";
import ErrorMessage from "@/components/common/ErrorMessage";
import { getDashboardStats } from "@/services/admin/dashboard.service";

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDashboardStats();
        setDashboard(response);
        setError("");
      } catch (requestError) {
        setError(requestError.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Loader label="Loading admin dashboard..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Dashboard unavailable"
        message={error}
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-slate-900 px-6 py-8 text-white shadow-2xl shadow-slate-900/10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-200">Learning Management System</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Manage courses, learners, and teaching operations in one place.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Your admin dashboard now gives you course health, user growth, lesson activity, and enrollment trends without changing the existing route structure.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/courses"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <Plus className="h-4 w-4" />
              New Course
            </Link>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Manage Users
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <StatsCards
        stats={{
          users: dashboard?.totalUsers,
          courses: dashboard?.totalCourses,
          lessons: dashboard?.totalLessons,
          enrollments: dashboard?.totalEnrollments,
        }}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr] xl:items-stretch">
        <RevenueChart data={dashboard?.revenueSeries || []} totalRevenue={dashboard?.totalRevenue || 0} />
        <ActivityFeed items={dashboard?.activityFeed || []} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecentCourses courses={dashboard?.recentCourses || []} />
        <RecentUsers users={dashboard?.recentUsers || []} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Recent Enrollment Snapshot</h2>
          <p className="mt-1 text-sm text-slate-500">A compact list of the most recent learner enrollments.</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(dashboard?.recentEnrollments || []).map((enrollment) => (
            <article key={enrollment._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{enrollment.student?.name || "Learner"}</p>
              <p className="mt-1 text-sm text-slate-500">{enrollment.course?.title || "Course"}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                {new Date(enrollment.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
