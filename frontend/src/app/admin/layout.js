"use client";
import Sidebar from "@/components/admin/Sidebar";
import TopNavbar from "@/components/admin/TopNavbar";
import ProtectedAdminRoute from "@/components/admin/ProtectedAdminRoute";
import useUiStore from "@/store/ui.store";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const closeSidebar = useUiStore((state) => state.closeSidebar);

  useEffect(() => {
    const syncSidebar = () => {
      if (window.innerWidth < 1024) {
        closeSidebar();
      }
    };

    syncSidebar();
    window.addEventListener("resize", syncSidebar);

    return () => {
      window.removeEventListener("resize", syncSidebar);
    };
  }, [closeSidebar]);

  return (
    <ProtectedAdminRoute>
      <div className="h-screen overflow-hidden bg-slate-250">
        <Sidebar />
        <div className={`h-screen overflow-hidden transition-[padding] duration-300 ${sidebarOpen ? "lg:pl-72" : "lg:pl-24"}`}>
          <div className="flex h-full min-h-0 flex-col">
            <TopNavbar />
            <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          </div>
        </div>
      </div>
    </ProtectedAdminRoute>
  );
}
