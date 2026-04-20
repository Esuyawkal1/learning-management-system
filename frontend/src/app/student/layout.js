"use client";

import { useEffect, useRef } from "react";
import ProtectedStudentRoute from "@/components/student/ProtectedStudentRoute";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentTopNavbar from "@/components/student/StudentTopNavbar";
import useStudentThemeStore from "@/store/student.theme.store";
import useStudentUiStore from "@/store/student.ui.store";
import { STUDENT_SETTINGS_STORAGE_KEY, STUDENT_THEME_STORAGE_KEY } from "@/utils/studentTheme";

const DESKTOP_BREAKPOINT = 1024;

export default function StudentLayout({ children }) {
  const sidebarOpen = useStudentUiStore((state) => state.sidebarOpen);
  const closeSidebar = useStudentUiStore((state) => state.closeSidebar);
  const openSidebar = useStudentUiStore((state) => state.openSidebar);
  const themePreference = useStudentThemeStore((state) => state.themePreference);
  const resolvedTheme = useStudentThemeStore((state) => state.resolvedTheme);
  const initializeTheme = useStudentThemeStore((state) => state.initializeTheme);
  const syncSystemTheme = useStudentThemeStore((state) => state.syncSystemTheme);
  const syncThemeFromStorage = useStudentThemeStore((state) => state.syncThemeFromStorage);
  const clearTheme = useStudentThemeStore((state) => state.clearTheme);
  const sidebarRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    const syncSidebar = () => {
      if (window.innerWidth < DESKTOP_BREAKPOINT) {
        closeSidebar();
        return;
      }

      openSidebar();
    };

    syncSidebar();
    window.addEventListener("resize", syncSidebar);

    return () => window.removeEventListener("resize", syncSidebar);
  }, [closeSidebar, openSidebar]);

  useEffect(() => {
    if (!sidebarOpen || window.innerWidth >= DESKTOP_BREAKPOINT) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (sidebarRef.current?.contains(target) || menuButtonRef.current?.contains(target)) {
        return;
      }

      closeSidebar();
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeSidebar();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sidebarOpen, closeSidebar]);

  useEffect(() => {
    initializeTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = () => {
      syncSystemTheme();
    };

    const handleStorage = (event) => {
      if (!event.key || event.key === STUDENT_THEME_STORAGE_KEY || event.key === STUDENT_SETTINGS_STORAGE_KEY) {
        syncThemeFromStorage();
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
      window.removeEventListener("storage", handleStorage);
      clearTheme();
    };
  }, [clearTheme, initializeTheme, syncSystemTheme, syncThemeFromStorage]);

  return (
    <ProtectedStudentRoute>
      <div
        className="student-workspace h-screen overflow-hidden bg-sky-50/40"
        data-theme={resolvedTheme}
        data-theme-preference={themePreference}
        style={{ colorScheme: resolvedTheme }}
      >
        <StudentSidebar sidebarRef={sidebarRef} />
        <div className={`h-screen overflow-hidden transition-[padding] duration-300 ${sidebarOpen ? "lg:pl-72" : "lg:pl-0"}`}>
          <div className="flex h-full min-h-0 flex-col">
            <StudentTopNavbar menuButtonRef={menuButtonRef} />
            <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          </div>
        </div>
      </div>
    </ProtectedStudentRoute>
  );
}
