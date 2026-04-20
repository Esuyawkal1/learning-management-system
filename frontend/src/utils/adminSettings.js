export const ADMIN_SETTINGS_STORAGE_KEY = "admin-control-center-settings";

export const ADMIN_TIMEZONE_OPTIONS = [
  "Africa/Nairobi",
  "UTC",
  "Europe/London",
  "America/New_York",
  "Asia/Dubai",
];

export const ADMIN_CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "KES"];

export const ADMIN_REVIEW_WINDOWS = [
  { value: "4", label: "4 hours" },
  { value: "12", label: "12 hours" },
  { value: "24", label: "24 hours" },
  { value: "48", label: "48 hours" },
];

export const ADMIN_SETTINGS_DEFAULTS = {
  platformName: "Tech Learning Platform",
  supportEmail: "support@techlearningplatform.com",
  adminNotes:
    "Keep the learning experience consistent, safe, and measurable across the platform.",
  timezone: "Africa/Nairobi",
  currency: "USD",
  enrollmentAlerts: true,
  courseReviewAlerts: true,
  weeklyDigest: true,
  securityAlerts: true,
  requireCourseApproval: true,
  requireLessonReview: false,
  autoHideInactiveDrafts: true,
  flagEnrollmentSpikes: true,
  reviewWindowHours: "24",
  requireStepUpConfirmation: true,
  allowWeekendPublishing: false,
  compactTables: false,
  pinnedOverviewCards: true,
  lastSavedAt: "",
};

const booleanFields = [
  "enrollmentAlerts",
  "courseReviewAlerts",
  "weeklyDigest",
  "securityAlerts",
  "requireCourseApproval",
  "requireLessonReview",
  "autoHideInactiveDrafts",
  "flagEnrollmentSpikes",
  "requireStepUpConfirmation",
  "allowWeekendPublishing",
  "compactTables",
  "pinnedOverviewCards",
];

const stringFields = [
  "platformName",
  "supportEmail",
  "adminNotes",
  "timezone",
  "currency",
  "reviewWindowHours",
  "lastSavedAt",
];

export function normalizeAdminSettings(value) {
  const incoming = value && typeof value === "object" ? value : {};
  const normalized = { ...ADMIN_SETTINGS_DEFAULTS };

  booleanFields.forEach((field) => {
    if (typeof incoming[field] === "boolean") {
      normalized[field] = incoming[field];
    }
  });

  stringFields.forEach((field) => {
    if (typeof incoming[field] === "string" && incoming[field].trim()) {
      normalized[field] = incoming[field].trim();
    }
  });

  if (typeof incoming.adminNotes === "string") {
    normalized.adminNotes = incoming.adminNotes.trim() || ADMIN_SETTINGS_DEFAULTS.adminNotes;
  }

  return normalized;
}

export function readStoredAdminSettings() {
  if (typeof window === "undefined") {
    return ADMIN_SETTINGS_DEFAULTS;
  }

  try {
    const rawSettings = window.localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY);

    if (!rawSettings) {
      return ADMIN_SETTINGS_DEFAULTS;
    }

    return normalizeAdminSettings(JSON.parse(rawSettings));
  } catch (_error) {
    return ADMIN_SETTINGS_DEFAULTS;
  }
}

export function persistAdminSettings(settings) {
  if (typeof window === "undefined") {
    return normalizeAdminSettings(settings);
  }

  const nextSettings = {
    ...normalizeAdminSettings(settings),
    lastSavedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
  return nextSettings;
}
