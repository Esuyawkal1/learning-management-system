import { formatCurrency } from "@/utils/helpers";

export const getCourseCheckoutPath = (courseId) => {
  if (!courseId) {
    return "/courses";
  }

  return `/courses/${courseId}/checkout`;
};

export const buildLoginPath = (nextPath = "/courses") => {
  const safeNextPath =
    typeof nextPath === "string" && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/courses";

  return `/login?next=${encodeURIComponent(safeNextPath)}`;
};

export const isStudentUser = (user) => (user?.role || "").toLowerCase() === "student";

export const getCoursePriceLabel = (price) => {
  const numericPrice = Number(price || 0);

  if (numericPrice <= 0) {
    return "Free";
  }

  return formatCurrency(numericPrice);
};
