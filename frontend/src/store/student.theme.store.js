import { create } from "zustand";
import {
  applyStudentThemeToDocument,
  clearStudentThemeFromDocument,
  getStoredStudentThemePreference,
  normalizeStudentThemePreference,
  persistStudentThemePreference,
  resolveStudentTheme,
} from "@/utils/studentTheme";

const useStudentThemeStore = create((set, get) => ({
  themePreference: "system",
  resolvedTheme: "light",
  hydrated: false,
  initializeTheme: () => {
    const themePreference = getStoredStudentThemePreference();
    const resolvedTheme = resolveStudentTheme(themePreference);

    applyStudentThemeToDocument(resolvedTheme, themePreference);
    set({
      themePreference,
      resolvedTheme,
      hydrated: true,
    });
  },
  setThemePreference: (nextThemePreference) => {
    const themePreference = normalizeStudentThemePreference(nextThemePreference);
    const resolvedTheme = resolveStudentTheme(themePreference);

    persistStudentThemePreference(themePreference);
    applyStudentThemeToDocument(resolvedTheme, themePreference);
    set({
      themePreference,
      resolvedTheme,
      hydrated: true,
    });
  },
  syncSystemTheme: () => {
    const { themePreference } = get();
    const resolvedTheme = resolveStudentTheme(themePreference);

    applyStudentThemeToDocument(resolvedTheme, themePreference);
    set({ resolvedTheme });
  },
  syncThemeFromStorage: () => {
    const themePreference = getStoredStudentThemePreference();
    const resolvedTheme = resolveStudentTheme(themePreference);

    applyStudentThemeToDocument(resolvedTheme, themePreference);
    set({
      themePreference,
      resolvedTheme,
      hydrated: true,
    });
  },
  clearTheme: () => {
    clearStudentThemeFromDocument();
  },
}));

export default useStudentThemeStore;
