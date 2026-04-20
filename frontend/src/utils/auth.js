export const getRedirectPathForRole = (user) => {
  const role = (user?.role || "").toLowerCase();

  if (role === "admin") {
    return "/admin/dashboard";
  }

  if (role === "instructor") {
    return "/instructor/dashboard";
  }

  if (role === "student") {
    return "/student/dashboard";
  }

  return "/dashboard";
};

export const isSafeRedirectPath = (value = "") => {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//");
};

export const resolvePostLoginPath = (user, nextPath = "") => {
  const role = (user?.role || "").toLowerCase();

  if (role === "student" && isSafeRedirectPath(nextPath)) {
    return nextPath;
  }

  return getRedirectPathForRole(user);
};

export const extractAuthUser = (payload) => {
  return (
    payload?.data?.user ||
    payload?.user ||
    payload?.data?.data?.user ||
    payload?.data?.data ||
    payload?.data ||
    null
  );
};

export const getAuthErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || fallbackMessage;
};

export const reportAuthError = (label, error) => {
  const status = error?.response?.status;

  if (!status || status >= 500) {
    console.error(label, error);
  }
};
