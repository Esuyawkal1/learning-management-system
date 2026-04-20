"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TechFoldersHomeLink from "@/components/branding/TechFoldersHomeLink";
import { PanelLeftClose, PanelLeftOpen } from "@/components/common/icons";
import useAuthStore from "@/store/auth.store";
import useUiStore from "@/store/ui.store";
import { ADMIN_LOGOUT_ICON, ADMIN_NAV_ITEMS } from "@/constants/admin";
import { getInitials } from "@/utils/helpers";

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const closeSidebar = useUiStore((state) => state.closeSidebar);
  const LogoutIcon = ADMIN_LOGOUT_ICON;

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm transition lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeSidebar}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-slate-950 text-white shadow-2xl transition-all duration-300 ${
          sidebarOpen ? "translate-x-0 w-72" : "-translate-x-full w-72 lg:translate-x-0 lg:w-24"
        }`}
      >
        <div
          className={`border-b border-white/10 ${
            sidebarOpen
              ? "flex items-center justify-between px-4 py-5"
              : "flex flex-col items-center gap-3 px-3 py-5"
          }`}
        >
          <TechFoldersHomeLink
            className={
              sidebarOpen
                ? "min-w-0 border border-white/10 bg-white/5 px-3 py-3 hover:bg-white/10 focus-visible:ring-slate-500 focus-visible:ring-offset-slate-950"
                : "border border-white/10 bg-white/5 p-2 hover:bg-white/10 focus-visible:ring-slate-500 focus-visible:ring-offset-slate-950"
            }
            markClassName="h-11 w-11 shrink-0"
            textWrapperClassName={sidebarOpen ? "min-w-0" : "hidden"}
            labelClassName="text-white"
            subtitle="Admin Panel"
            subtitleClassName="text-slate-400"
          />

          <button
            type="button"
            onClick={toggleSidebar}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
            aria-label="Collapse sidebar"
          >
            {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </button>
        </div>

        <div className="px-4 py-5">
          <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sm font-semibold text-sky-100">
              {getInitials(user?.name)}
            </div>
            <div className={sidebarOpen ? "block" : "hidden lg:hidden"}>
              <p className="text-sm font-semibold text-white">{user?.name || "Admin User"}</p>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{user?.role || "admin"}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
          {ADMIN_NAV_ITEMS.map((item) => {
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
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                    : "text-slate-300 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={sidebarOpen ? "block" : "hidden lg:hidden"}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-rose-500/15 hover:text-white"
          >
            <LogoutIcon className="h-5 w-5 shrink-0" />
            <span className={sidebarOpen ? "block" : "hidden lg:hidden"}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
