"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useState,
} from "react";
import Loader from "@/components/common/Loader";
import ErrorMessage from "@/components/common/ErrorMessage";
import AdminAnalyticsSummaryCards from "@/components/admin/analytics/AdminAnalyticsSummaryCards";
import RevenueTrendPanel from "@/components/admin/analytics/RevenueTrendPanel";
import RoleDistributionPanel from "@/components/admin/analytics/RoleDistributionPanel";
import CoursePerformancePanel from "@/components/admin/analytics/CoursePerformancePanel";
import AnalyticsSidePanels from "@/components/admin/analytics/AnalyticsSidePanels";
import { getAdminAnalytics } from "@/services/admin/analytics.service";
import { formatCurrency, formatNumber, matchesSearch } from "@/utils/helpers";

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseQuery, setCourseQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const deferredCourseQuery = useDeferredValue(courseQuery);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const response = await getAdminAnalytics();
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

  if (loading) {
    return <Loader label="Loading admin analytics..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Analytics unavailable"
        message={error}
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  const filteredCourses = (analytics?.coursePerformance || []).filter((course) => {
    const matchesStatus =
      courseFilter === "all" ||
      (courseFilter === "published" && course.published) ||
      (courseFilter === "draft" && !course.published);

    const matchesQuery = matchesSearch(
      [course.title, course.instructor, course.category],
      deferredCourseQuery
    );

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.08),_transparent_22%),linear-gradient(135deg,_#020617,_#0f172a_55%,_#082f49)] px-6 py-8 text-white">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-200">
                Admin analytics workspace
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
                Platform performance, revenue clarity, and teaching insights in one view.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                This section now runs on live admin data and gives the team a practical overview of learner growth, catalog health, instructor performance, and monetization trends without changing your existing dashboard structure.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-300">Revenue</p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatCurrency(analytics?.summary?.totalRevenue || 0)}
                </p>
                <p className="mt-2 text-sm text-slate-300">Tracked from enrollments</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-300">Enrollments</p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatNumber(analytics?.summary?.totalEnrollments || 0)}
                </p>
                <p className="mt-2 text-sm text-slate-300">Across the current catalog</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-300">Completion</p>
                <p className="mt-2 text-2xl font-semibold">
                  {analytics?.summary?.averageCompletionRate || 0}%
                </p>
                <p className="mt-2 text-sm text-slate-300">Average learner progress</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AdminAnalyticsSummaryCards summary={analytics?.summary} />

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        <RevenueTrendPanel data={analytics?.revenueSeries || []} summary={analytics?.summary} />
        <RoleDistributionPanel
          data={analytics?.roleDistribution || []}
          summary={analytics?.summary}
        />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.5fr_0.9fr]">
        <CoursePerformancePanel
          courses={filteredCourses}
          query={courseQuery}
          filter={courseFilter}
          onQueryChange={(event) => {
            const nextValue = event.target.value;
            startTransition(() => {
              setCourseQuery(nextValue);
            });
          }}
          onFilterChange={(nextFilter) => {
            startTransition(() => {
              setCourseFilter(nextFilter);
            });
          }}
        />

        <AnalyticsSidePanels
          instructors={analytics?.instructorPerformance || []}
          categories={analytics?.categoryBreakdown || []}
          metrics={analytics?.platformHealth || []}
          insights={analytics?.insights || []}
        />
      </div>
    </div>
  );
}
