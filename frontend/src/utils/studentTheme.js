export const STUDENT_THEME_STORAGE_KEY = "student-workspace-theme";
export const STUDENT_SETTINGS_STORAGE_KEY = "student-workspace-settings";

export const STUDENT_THEME_OPTIONS = [
  { value: "system", label: "System" },
  { value: "light", label: "White" },
  { value: "dark", label: "Dark" },
];

export function normalizeStudentThemePreference(value) {
  return STUDENT_THEME_OPTIONS.some((option) => option.value === value) ? value : "system";
}

function readStudentSettings() {
  if (typeof window === "undefined") {
    return {};
  }

  const rawSettings = window.localStorage.getItem(STUDENT_SETTINGS_STORAGE_KEY);

  if (!rawSettings) {
    return {};
  }

  try {
    const parsedSettings = JSON.parse(rawSettings);
    return parsedSettings && typeof parsedSettings === "object" ? parsedSettings : {};
  } catch (_error) {
    return {};
  }
}

export function resolveStudentTheme(themePreference) {
  const normalizedPreference = normalizeStudentThemePreference(themePreference);

  if (normalizedPreference === "system") {
    const mediaQuery =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

    if (mediaQuery?.matches) {
      return "dark";
    }

    return "light";
  }

  return normalizedPreference;
}

export function getStoredStudentThemePreference() {
  if (typeof window === "undefined") {
    return "system";
  }

  const storedTheme = window.localStorage.getItem(STUDENT_THEME_STORAGE_KEY);

  if (storedTheme) {
    return normalizeStudentThemePreference(storedTheme);
  }

  const settings = readStudentSettings();

  if (typeof settings.themePreference === "string") {
    return normalizeStudentThemePreference(settings.themePreference);
  }

  if (typeof settings.darkMode === "boolean") {
    return settings.darkMode ? "dark" : "light";
  }

  return "system";
}

export function persistStudentThemePreference(themePreference) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedPreference = normalizeStudentThemePreference(themePreference);
  const settings = readStudentSettings();

  window.localStorage.setItem(STUDENT_THEME_STORAGE_KEY, normalizedPreference);
  window.localStorage.setItem(
    STUDENT_SETTINGS_STORAGE_KEY,
    JSON.stringify({
      ...settings,
      themePreference: normalizedPreference,
      darkMode: normalizedPreference === "dark",
    })
  );
}

export function applyStudentThemeToDocument(resolvedTheme, themePreference) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.studentTheme = resolvedTheme;
  document.documentElement.dataset.studentThemePreference = normalizeStudentThemePreference(themePreference);
  document.documentElement.style.colorScheme = resolvedTheme;
}

export function clearStudentThemeFromDocument() {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.removeAttribute("data-student-theme");
  document.documentElement.removeAttribute("data-student-theme-preference");
  document.documentElement.style.removeProperty("color-scheme");
}
