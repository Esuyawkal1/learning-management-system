"use client";

import { Bell, Menu, Search } from "@/components/common/icons";
import { usePathname } from "next/navigation";
import useAuthStore from "@/store/auth.store";
import useUiStore from "@/store/ui.store";
import { getAdminPageTitle } from "@/constants/admin";
import { getInitials } from "@/utils/helpers";

export default function TopNavbar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const title = getAdminPageTitle(pathname);
  const hideSearch = pathname === "/admin/courses/create";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Admin Panel</p>
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {!hideSearch ? (
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-500 transition focus-within:border-slate-300 focus-within:bg-white sm:min-w-[280px]">
              <Search className="h-4 w-4" />
              <input
                type="search"
                placeholder="Search dashboard..."
                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400"
              />
            </label>
          ) : null}

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
              {getInitials(user?.name)}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold text-slate-900">{user?.name || "Admin User"}</p>
              <p className="truncate text-xs uppercase tracking-[0.2em] text-slate-500">
                {user?.role || "admin"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
