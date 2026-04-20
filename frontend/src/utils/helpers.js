export const formatNumber = (value) => {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
};

export const formatCurrency = (value, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

export const formatDate = (value, options = {}) => {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(new Date(value));
};

export const getInitials = (name = "Admin User") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
};

export const getRelativeTime = (value) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  const differenceInMs = Date.now() - date.getTime();
  const differenceInMinutes = Math.floor(differenceInMs / 60000);

  if (differenceInMinutes < 1) {
    return "Just now";
  }

  if (differenceInMinutes < 60) {
    return `${differenceInMinutes}m ago`;
  }

  const differenceInHours = Math.floor(differenceInMinutes / 60);

  if (differenceInHours < 24) {
    return `${differenceInHours}h ago`;
  }

  const differenceInDays = Math.floor(differenceInHours / 24);

  if (differenceInDays < 7) {
    return `${differenceInDays}d ago`;
  }

  return formatDate(value);
};

export const matchesSearch = (values, query) => {
  if (!query) {
    return true;
  }

  const normalizedQuery = query.trim().toLowerCase();

  return values.some((value) => String(value || "").toLowerCase().includes(normalizedQuery));
};

export const paginateItems = (items, currentPage, pageSize) => {
  const startIndex = (currentPage - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
};
