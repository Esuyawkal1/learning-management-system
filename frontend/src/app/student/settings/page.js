"use client";

import { useEffect, useState } from "react";
import { StudentSettingsLoadingState } from "@/components/common/LoadingShells";
import { notify } from "@/store/notification.store";
import useStudentThemeStore from "@/store/student.theme.store";
import { STUDENT_SETTINGS_STORAGE_KEY, STUDENT_THEME_OPTIONS } from "@/utils/studentTheme";

export default function StudentSettingsPage() {
  const themePreference = useStudentThemeStore((state) => state.themePreference);
  const resolvedTheme = useStudentThemeStore((state) => state.resolvedTheme);
  const setThemePreference = useStudentThemeStore((state) => state.setThemePreference);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    deadlineReminders: true,
    language: "English",
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedSettings = window.localStorage.getItem(STUDENT_SETTINGS_STORAGE_KEY);
    const frame = window.requestAnimationFrame(() => {
      if (storedSettings) {
        try {
          const parsed = JSON.parse(storedSettings);
          setSettings((state) => ({
            ...state,
            emailNotifications:
              typeof parsed.emailNotifications === "boolean" ? parsed.emailNotifications : state.emailNotifications,
            deadlineReminders:
              typeof parsed.deadlineReminders === "boolean" ? parsed.deadlineReminders : state.deadlineReminders,
            language: typeof parsed.language === "string" ? parsed.language : state.language,
          }));
        } catch (_error) {
          // Ignore malformed local settings and keep defaults.
        }
      }

      setHydrated(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  if (!hydrated) {
    return <StudentSettingsLoadingState />;
  }

  return (
    <div className="mx-auto max-w-4xl rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-600">Settings</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">Customize your student workspace preferences.</h2>
      </div>

      <form
        className="mt-8 space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          window.localStorage.setItem(
            STUDENT_SETTINGS_STORAGE_KEY,
            JSON.stringify({
              ...settings,
              themePreference,
              darkMode: themePreference === "dark",
            })
          );
          notify({
            type: "success",
            title: "Settings saved",
            message: "Your workspace preferences were updated successfully.",
          });
        }}
      >
        <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Appearance</h3>
              <p className="mt-1 text-sm text-slate-500">
                Choose how the your workspace should look.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {STUDENT_THEME_OPTIONS.map((option) => {
                const isActive = themePreference === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setThemePreference(option.value)}
                    className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <p className="text-sm text-slate-500">
              Current view: <span className="font-semibold text-slate-700">{resolvedTheme === "dark" ? "Dark" : "White"}</span>
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5">
          <h3 className="text-lg font-semibold text-slate-900">Notification Preferences</h3>
          <div className="mt-4 space-y-4">
            <label className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900">Email notifications</p>
                <p className="text-sm text-slate-500">Receive instructor and grading updates by email.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(event) =>
                  setSettings((state) => ({ ...state, emailNotifications: event.target.checked }))
                }
                className="h-5 w-5 rounded border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900">Deadline reminders</p>
                <p className="text-sm text-slate-500">Show reminders for pending assignments and due dates.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.deadlineReminders}
                onChange={(event) =>
                  setSettings((state) => ({ ...state, deadlineReminders: event.target.checked }))
                }
                className="h-5 w-5 rounded border-slate-300"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
