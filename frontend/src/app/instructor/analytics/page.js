"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import ErrorMessage from "@/components/common/ErrorMessage";
import CoursePerformanceChart from "@/components/instructor/analytics/CoursePerformanceChart";
import StudentProgressChart from "@/components/instructor/analytics/StudentProgressChart";
import RevenueChart from "@/components/instructor/analytics/RevenueChart";
import { formatCurrency } from "@/utils/helpers";
import { getInstructorAnalytics } from "@/services/instructor/instructor.analytics.service";

export default function InstructorAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const response = await getInstructorAnalytics();
        setAnalytics(response);
        setError("");
      } catch (requestError) {
        setError(requestError.message || "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) return <Loader label="Loading analytics..." />;
  if (error) return <ErrorMessage title="Analytics unavailable" message={error} actionLabel="Retry" onAction={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total enrollments</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{analytics?.totalEnrollments || 0}</p>
        </div>
        <div className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Average progress</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{analytics?.averageProgress || 0}%</p>
        </div>
        <div className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Most popular course</p>
          <p className="mt-3 text-xl font-semibold text-slate-900">{analytics?.mostPopularCourse || "No courses yet"}</p>
        </div>
        <div className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Revenue</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{formatCurrency(analytics?.totalRevenue || 0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <RevenueChart data={analytics?.revenueSeries || []} totalRevenue={analytics?.totalRevenue || 0} />
        <CoursePerformanceChart data={analytics?.coursePerformance || []} />
      </div>

      <StudentProgressChart data={analytics?.studentProgress || []} />
    </div>
  );
}
