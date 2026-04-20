"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuthStore from "@/store/auth.store";

const getWorkspaceHref = (user, isAuthenticated) => {
  if (!isAuthenticated) return "/login";
  if (user?.role === "admin") return "/admin/dashboard";
  if (user?.role === "instructor") return "/instructor/dashboard";
  return "/student/dashboard";
};

const getHomeSectionHref = (pathname, sectionId) =>
  pathname === "/" ? `#${sectionId}` : `/#${sectionId}`;

export default function Footer({ className = "" }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const year = new Date().getFullYear();
  const workspaceHref = getWorkspaceHref(user, isAuthenticated);

  const exploreLinks = [
    { label: "Featured", href: getHomeSectionHref(pathname, "featured") },
    { label: "Categories", href: getHomeSectionHref(pathname, "categories") },
    { label: "Outcomes", href: getHomeSectionHref(pathname, "stats") },
    { label: "Courses", href: "/courses" },
  ];

  const platformLinks = [
    { label: "How it works", href: "#" },
    { label: "Learning paths", href: "#" },
    { label: "Instructors", href: "#" },
  ];

  const accessLinks = isAuthenticated
    ? [
        { label: "Workspace", href: workspaceHref },
        { label: "Browse courses", href: "/courses" },
      ]
    : [
        { label: "Login", href: "/login" },
        { label: "Register", href: "/register" },
        { label: "Forgot password", href: "/forgot-password" },
      ];

  return (
   <footer className={`mt-20 border-t border-slate-800 bg-slate-900 text-slate-300 ${className}`}>
      <div className="mx-auto w-full max-w-7xl px-6 py-12">
        
        {/* Top Grid */}
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold text-slate-500">
              Tech Folders
            </h3>
            <p className="mt-3 text-sm text-slate-500">
              Structured, video-first learning platform designed to help you
              build real-world skills.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-semibold text-slate-500 mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-slate-500">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-slate-100">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-slate-500 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-500">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-slate-100">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Access */}
          <div>
            <h4 className="text-sm font-semibold text-slate-500 mb-3">
              Access
            </h4>
            <ul className="space-y-2 text-sm text-slate-500">
              {accessLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-slate-100">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          
          <p className="text-xs">
            © {year} Tech Folders
          </p>

          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-slate-100">
              Home
            </Link>
            <Link href="/courses" className="hover:text-slate-100">
              Courses
            </Link>
            <Link
              href={isAuthenticated ? workspaceHref : "/login"}
              className="hover:text-slate-100"
            >
              {isAuthenticated ? "Workspace" : "Login"}
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
}