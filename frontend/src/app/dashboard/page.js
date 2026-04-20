"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/auth.store";
import Loader from "@/components/Loader";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if ((user.role || "").toLowerCase() === "admin") {
      router.push("/admin/dashboard");
      return;
    }
    if ((user.role || "").toLowerCase() === "instructor") {
      router.push("/instructor/dashboard");
      return;
    }
    if ((user.role || "").toLowerCase() === "student") {
      router.push("/student/dashboard");
      return;
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <Loader />;
  }

  return <Loader label={`Opening workspace for ${user.name || user.email}...`} />;
}
