"use client";

import { useEffect } from "react";
import InstructorSidebar from "@/components/instructor/InstructorSidebar";
import InstructorTopNavbar from "@/components/instructor/InstructorTopNavbar";
import ProtectedInstructorRoute from "@/components/instructor/ProtectedInstructorRoute";
import useInstructorUiStore from "@/store/instructor.ui.store";

export default function InstructorLayout({ children }) {
  const sidebarOpen = useInstructorUiStore((state) => state.sidebarOpen);
  const closeSidebar = useInstructorUiStore((state) => state.closeSidebar);
  const openSidebar = useInstructorUiStore((state) => state.openSidebar);

  useEffect(() => {
    const syncSidebar = () => {
      if (window.innerWidth < 1024) {
        closeSidebar();
        return;
      }

      openSidebar();
    };

    syncSidebar();
    window.addEventListener("resize", syncSidebar);

    return () => window.removeEventListener("resize", syncSidebar);
  }, [closeSidebar, openSidebar]);

  return (
    <ProtectedInstructorRoute>
      <div className="h-screen overflow-hidden bg-amber-50/40">
        <InstructorSidebar />
        <div className={`h-screen overflow-hidden transition-[padding] duration-300 ${sidebarOpen ? "lg:pl-72" : "lg:pl-24"}`}>
          <div className="flex h-full min-h-0 flex-col">
            <InstructorTopNavbar />
            <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          </div>
        </div>
      </div>
    </ProtectedInstructorRoute>
  );
}
