import {
  BarChart3,
  BookOpen,
  BookOpenCheck,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  UserCircle,
  Users,
} from "@/components/common/icons";

export const INSTRUCTOR_NAV_ITEMS = [
  { label: "Dashboard", href: "/instructor/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/instructor/courses", icon: BookOpen },
  { label: "Create Course", href: "/instructor/courses/create", icon: Plus },
  { label: "Students", href: "/instructor/students", icon: Users },
  { label: "Lessons", href: "/instructor/lessons", icon: BookOpenCheck },
  { label: "Analytics", href: "/instructor/analytics", icon: BarChart3 },
  { label: "Messages", href: "/instructor/messages", icon: MessageSquare },
  { label: "Profile", href: "/instructor/profile", icon: UserCircle },
];

export const INSTRUCTOR_LOGOUT_ICON = LogOut;

export const INSTRUCTOR_PAGE_TITLES = {
  "/instructor/dashboard": "Instructor Overview",
  "/instructor/courses": "My Courses",
  "/instructor/students": "Students",
  "/instructor/lessons": "Lessons",
  "/instructor/analytics": "Analytics",
  "/instructor/messages": "Messages",
  "/instructor/profile": "Profile",
};

export const getInstructorPageTitle = (pathname = "") => {
  const matchedEntry = Object.entries(INSTRUCTOR_PAGE_TITLES)
    .sort((left, right) => right[0].length - left[0].length)
    .find(([route]) => pathname.startsWith(route));

  return matchedEntry?.[1] || "Instructor Dashboard";
};
