"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuthStore from "@/store/auth.store";
import LandingNavbar from "@/components/landing/Navbar";

export default function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const shouldUseLandingNavbar =
    pathname === "/" ||
    pathname?.startsWith("/courses") ||
    pathname === "/contact" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/instructor") || pathname?.startsWith("/student")) {
    return null;
  }

  if (shouldUseLandingNavbar) {
    return <LandingNavbar />;
  }

  return (
    <nav style={{ padding: "15px", borderBottom: "1px solid #ddd" }}>

      <Link href="/">Home</Link> |{" "}
      <Link href="/courses">Courses</Link> |{" "}

      {!user && (
        <>
          <Link href="/login">Login</Link> |{" "}
          <Link href="/register">Register</Link>
        </>
      )}

      {user && (
        <>
          <Link href="/student/courses">My Courses</Link> |{" "}
          <button onClick={logout}>Logout</button>
        </>
      )}

    </nav>
  );
}
