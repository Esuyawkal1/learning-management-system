// src/components/admin/ProtectedAdminRoute.jsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/components/common/Loader";
import useAuthStore from "@/store/auth.store";

const ProtectedAdminRoute = ({ children }) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (loading || !user || user.role !== "admin") {
    return <Loader fullScreen label="Checking admin access..." />;
  }

  return children;
};

export default ProtectedAdminRoute;
