"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/common/Loader";
import useAuthStore from "@/store/auth.store";

export default function ProtectedStudentRoute({ children }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    if (!loading && (!user || user.role !== "student")) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (loading || !user || user.role !== "student") {
    return <Loader fullScreen label="Checking student access..." />;
  }

  return children;
}
