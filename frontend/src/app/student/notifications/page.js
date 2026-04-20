"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import { getStudentDashboard } from "@/services/student/student.course.service";

function NotificationsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-28 rounded-[2rem] bg-slate-200" />
      ))}
    </div>
  );
}

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await getStudentDashboard();
        setNotifications(response?.notifications || []);
        setError("");
      } catch (requestError) {
        setError(requestError.message || "Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  if (loading) {
    return <NotificationsSkeleton />;
  }

  if (error) {
    return <ErrorMessage title="Notifications unavailable" message={error} actionLabel="Retry" onAction={() => window.location.reload()} />;
  }

  if (!notifications.length) {
    return <EmptyState title="No notifications" description="You are all caught up right now." />;
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <article key={notification.id} className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Student Notification</p>
          <h2 className="mt-3 text-xl font-semibold text-slate-900">{notification.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{notification.message}</p>
          <Link href={notification.href} className="mt-5 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
            Open
          </Link>
        </article>
      ))}
    </div>
  );
}
