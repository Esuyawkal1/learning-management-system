import {
  BarChart3,
  BookOpen,
  BookOpenCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "@/components/common/icons";

export const ADMIN_NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Courses",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    label: "Lessons",
    href: "/admin/lessons",
    icon: BookOpenCheck,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Enrollments",
    href: "/admin/enrollments",
    icon: GraduationCap,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export const ADMIN_PAGE_TITLES = {
  "/admin/dashboard": "Dashboard Overview",
  "/admin/courses": "Course Management",
  "/admin/lessons": "Lesson Management",
  "/admin/users": "User Management",
  "/admin/enrollments": "Enrollment Management",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Settings",
};

export const ADMIN_LOGOUT_ICON = LogOut;

export const getAdminPageTitle = (pathname = "") => {
  const matchedEntry = Object.entries(ADMIN_PAGE_TITLES)
    .sort((left, right) => right[0].length - left[0].length)
    .find(([route]) => pathname.startsWith(route));

  return matchedEntry?.[1] || "Admin Dashboard";
};
