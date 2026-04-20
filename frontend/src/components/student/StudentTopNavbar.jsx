"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bell, ChevronDown, Menu, Search } from "@/components/common/icons";
import UserAvatar from "@/components/common/UserAvatar";
import useAuthStore from "@/store/auth.store";
import useStudentThemeStore from "@/store/student.theme.store";
import useStudentUiStore from "@/store/student.ui.store";
import { getStudentPageTitle } from "@/constants/student";
import { getStudentDashboard } from "@/services/student/student.course.service";
import { STUDENT_THEME_OPTIONS } from "@/utils/studentTheme";

export default function StudentTopNavbar({ menuButtonRef }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const sidebarOpen = useStudentUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useStudentUiStore((state) => state.toggleSidebar);
  const themePreference = useStudentThemeStore((state) => state.themePreference);
  const setThemePreference = useStudentThemeStore((state) => state.setThemePreference);
  const [notificationCount, setNotificationCount] = useState(0);
  const [openMenuPath, setOpenMenuPath] = useState("");
  const profileMenuRef = useRef(null);
  const currentQuery = searchParams.get("q") || "";
  const menuOpen = openMenuPath === pathname;

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const dashboard = await getStudentDashboard();

        if (isMounted) {
          setNotificationCount(dashboard?.notifications?.length || 0);
        }
      } catch (_error) {
        if (isMounted) {
          setNotificationCount(0);
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (profileMenuRef.current?.contains(target)) {
        return;
      }

      setOpenMenuPath("");
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenMenuPath("");
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/90 backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={toggleSidebar}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 text-sky-700 transition hover:bg-sky-50"
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen}
            aria-controls="student-sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">Student Space</p>
            <h1 className="text-xl font-semibold text-slate-900">{getStudentPageTitle(pathname)}</h1>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form
            className="flex items-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-2.5 text-slate-500 transition focus-within:border-sky-200 focus-within:bg-white sm:min-w-[280px]"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const nextQuery = String(formData.get("q") || "").trim();
              const destination = nextQuery
                ? `/student/all-courses?q=${encodeURIComponent(nextQuery)}`
                : "/student/all-courses";

              router.push(destination);
            }}
          >
            <Search className="h-4 w-4" />
            <input
              type="search"
              name="q"
              key={currentQuery}
              defaultValue={currentQuery}
              placeholder="Search courses..."
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400"
            />
          </form>

          <Link
            href="/student/notifications"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 text-slate-700 transition hover:bg-sky-50"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {notificationCount ? (
              <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {notificationCount}
              </span>
            ) : null}
          </Link>

          <div className="relative">
            <label htmlFor="student-theme-preference" className="sr-only">
              Workspace appearance
            </label>
            <select
              id="student-theme-preference"
              value={themePreference}
              onChange={(event) => setThemePreference(event.target.value)}
              className="h-11 appearance-none rounded-2xl border border-sky-100 bg-white pl-4 pr-10 text-sm font-medium text-slate-700 transition hover:bg-sky-50 focus:border-sky-200 focus:bg-white"
              aria-label="Workspace appearance"
            >
              {STUDENT_THEME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setOpenMenuPath((current) => (current === pathname ? "" : pathname))}
              className="rounded-full border border-sky-100 bg-sky-50 p-2 text-left"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="Open profile menu"
            >
              <UserAvatar
                name={user?.name || "Student"}
                src={user?.profileImage || ""}
                className="h-10 w-10 rounded-full text-sm font-semibold"
                fallbackClassName="text-sm font-semibold"
                fallback="first-letter"
              />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 mt-3 w-56 rounded-3xl border border-sky-100 bg-white p-2 shadow-xl shadow-slate-900/10">
                <Link
                  href="/student/profile"
                  onClick={() => setOpenMenuPath("")}
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-sky-50"
                >
                  Profile
                </Link>
                <Link
                  href="/student/settings"
                  onClick={() => setOpenMenuPath("")}
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-sky-50"
                >
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenuPath("");
                    logout();
                  }}
                  className="mt-1 block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
