"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import TechFoldersMark from "@/components/branding/TechFoldersMark";
import useAuthStore from "@/store/auth.store";

const getPrimaryHref = (user, isAuthenticated) => {
  if (!isAuthenticated) {
    return "/login";
  }

  if (user?.role === "admin") {
    return "/admin/dashboard";
  }

  if (user?.role === "instructor") {
    return "/instructor/dashboard";
  }

  return "/student/dashboard";
};

export default function LandingNavbar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const isCourseRoute = pathname?.startsWith("/courses");
  const isContactRoute = pathname === "/contact";
  const navLinks = [
    {
      label: "Featured",
      href: pathname === "/" ? "#featured" : "/#featured",
    },
    {
      label: "Categories",
      href: pathname === "/" ? "#categories" : "/#categories",
    },
    {
      label: "Outcomes",
      href: pathname === "/" ? "#stats" : "/#stats",
    },
    {
      label: "Courses",
      href: "/courses",
      active: isCourseRoute,
    },
    {
      label: "Contact",
      href: "/contact",
      active: isContactRoute,
    },
  ];

 return (
  <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
      
      <Link href="/" className="flex items-center gap-3">
        <TechFoldersMark className="h-12 w-12 shrink-0" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">
           Tech-Folders
          </p>
          <p className="text-lg font-bold text-white">
            Learning Platform
          </p>
        </div>
      </Link>

     <nav className="hidden items-center gap-8 text-lg font-medium text-slate-200 lg:flex">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={`transition-colors duration-200 hover:text-white ${
              link.active ? "text-white" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/contact"
          className={`rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-100 transition-colors duration-200 hover:bg-white/10 lg:hidden ${
            isContactRoute ? "bg-white/10" : ""
          }`}
        >
          Contact
        </Link>

        {isAuthenticated ? (
          <>
            <Link
              href={getPrimaryHref(user, isAuthenticated)}
              className="hidden rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-100 transition-colors duration-200 hover:bg-white/10 sm:inline-flex"
            >
              Open Workspace
            </Link>

            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="hidden rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-slate-100 transition-colors duration-200 hover:bg-white/10 sm:inline-flex"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

    </div>
  </header>
);
}
