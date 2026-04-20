"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import TechFoldersHomeLink from "@/components/branding/TechFoldersHomeLink";
import { PanelLeftClose, PanelLeftOpen } from "@/components/common/icons";
import useAuthStore from "@/store/auth.store";
import useInstructorUiStore from "@/store/instructor.ui.store";
import { INSTRUCTOR_LOGOUT_ICON, INSTRUCTOR_NAV_ITEMS } from "@/constants/instructor";
import { getInitials } from "@/utils/helpers";

export default function InstructorSidebar() {
  const pathname = usePathname();
  const isActiveRoute = (path) => pathname === path;
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const sidebarOpen = useInstructorUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useInstructorUiStore((state) => state.toggleSidebar);
  const closeSidebar = useInstructorUiStore((state) => state.closeSidebar);
  const LogoutIcon = INSTRUCTOR_LOGOUT_ICON;

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm transition lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeSidebar}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-amber-100 bg-white text-slate-900 shadow-xl transition-all duration-300 ${
          sidebarOpen ? "translate-x-0 w-72" : "-translate-x-full w-72 lg:translate-x-0 lg:w-24"
        }`}
      >
        <div
          className={`border-b border-amber-100 ${
            sidebarOpen
              ? "flex items-center justify-between px-4 py-5"
              : "flex flex-col items-center gap-3 px-3 py-5"
          }`}
        >
          <TechFoldersHomeLink
            className={
              sidebarOpen
                ? "min-w-0 border border-amber-100 bg-amber-50 px-3 py-3 hover:bg-amber-100/80 focus-visible:ring-amber-200"
                : "border border-amber-100 bg-amber-50 p-2 hover:bg-amber-100/80 focus-visible:ring-amber-200"
            }
            markClassName="h-11 w-11 shrink-0"
            textWrapperClassName={sidebarOpen ? "min-w-0" : "hidden"}
            labelClassName="text-slate-900"
            subtitle="Instructor Workspace"
            subtitleClassName="text-amber-500"
          />

          <button
            type="button"
            onClick={toggleSidebar}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-slate-700 transition hover:bg-amber-100"
          >
            {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </button>
        </div>

        <div className="px-4 py-5">
          <div className="flex items-center gap-3 rounded-3xl border border-amber-100 bg-amber-50 p-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-sm font-semibold text-amber-700">
              {getInitials(user?.name)}
            </div>
            <div className={sidebarOpen ? "block" : "hidden lg:hidden"}>
              <p className="text-sm font-semibold text-slate-900">{user?.name || "Instructor"}</p>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{user?.role || "instructor"}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
          {INSTRUCTOR_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);

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
                    : "text-slate-600 hover:bg-amber-50 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={sidebarOpen ? "block" : "hidden lg:hidden"}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-amber-100 p-4">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700"
          >
            <LogoutIcon className="h-5 w-5 shrink-0" />
            <span className={sidebarOpen ? "block" : "hidden lg:hidden"}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
