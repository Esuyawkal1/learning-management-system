import {
  Bell,
  BookOpen,
  BookOpenCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquare,
} from "@/components/common/icons";

export const STUDENT_NAV_ITEMS = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/student/courses", icon: BookOpen },
  { label: "All Courses", href: "/student/all-courses", icon: BookOpenCheck },
  { label: "Assignments", href: "/student/assignments", icon: FileText },
  { label: "Certificates", href: "/student/certificates", icon: GraduationCap },
  { label: "Messages", href: "/student/messages", icon: MessageSquare },
  { label: "Notifications", href: "/student/notifications", icon: Bell },
];

export const STUDENT_LOGOUT_ICON = LogOut;

export const STUDENT_PAGE_TITLES = {
  "/student/dashboard": "Student Workspace",
  "/student/course/": "Course Learning",
  "/student/courses/": "Course Learning",
  "/student/courses": "My Courses",
  "/student/all-courses": "All Courses",
  "/student/assignments": "Assignments",
  "/student/certificates": "Certificates",
  "/student/messages": "Messages",
  "/student/notifications": "Notifications",
  "/student/profile": "Profile",
  "/student/settings": "Settings",
};

export const getStudentPageTitle = (pathname = "") => {
  const matchedEntry = Object.entries(STUDENT_PAGE_TITLES)
    .sort((left, right) => right[0].length - left[0].length)
    .find(([route]) => pathname.startsWith(route));

  return matchedEntry?.[1] || "Student Workspace";
};
