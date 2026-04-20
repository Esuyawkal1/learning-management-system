"use client";

import { useEffect } from "react";
import useAuthStore from "@/store/auth.store";

export default function AuthProvider({ children }) {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return children;
}
