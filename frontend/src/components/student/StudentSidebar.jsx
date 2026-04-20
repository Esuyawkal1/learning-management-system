"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import TechFoldersHomeLink from "@/components/branding/TechFoldersHomeLink";
import useAuthStore from "@/store/auth.store";
import useStudentUiStore from "@/store/student.ui.store";
import { STUDENT_LOGOUT_ICON, STUDENT_NAV_ITEMS } from "@/constants/student";

export default function StudentSidebar({ sidebarRef }) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const sidebarOpen = useStudentUiStore((state) => state.sidebarOpen);
  const closeSidebar = useStudentUiStore((state) => state.closeSidebar);
  const LogoutIcon = STUDENT_LOGOUT_ICON;

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm transition lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeSidebar}
      />

      <aside
        id="student-sidebar"
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 flex-col border-r border-sky-100 bg-white text-slate-900 shadow-xl transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-sky-100 px-4 py-5">
          <TechFoldersHomeLink
            className="w-full border border-sky-100 bg-sky-50 px-3 py-3 hover:bg-sky-100/70 focus-visible:ring-sky-200"
            markClassName="h-11 w-11 shrink-0"
            labelClassName="text-slate-900"
            subtitle="Student Space"
            subtitleClassName="text-sky-600"
          />
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
          {STUDENT_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    closeSidebar();
                  }
                }}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                    : "text-slate-600 hover:bg-sky-50 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={sidebarOpen ? "block" : "hidden"}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sky-100 p-4">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700"
          >
            <LogoutIcon className="h-5 w-5 shrink-0" />
            <span className={sidebarOpen ? "block" : "hidden"}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
