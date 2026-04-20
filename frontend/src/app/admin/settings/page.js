"use client";

import { useEffect, useState } from "react";
import SettingsSectionCard from "@/components/admin/settings/SettingsSectionCard";
import SettingsToggleRow from "@/components/admin/settings/SettingsToggleRow";
import { WorkspaceRouteLoading } from "@/components/common/LoadingShells";
import { notify } from "@/store/notification.store";
import {
  ADMIN_SETTINGS_DEFAULTS,
  ADMIN_TIMEZONE_OPTIONS,
  ADMIN_CURRENCY_OPTIONS,
  persistAdminSettings,
  readStoredAdminSettings,
} from "@/utils/adminSettings";

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-slate-300 focus:bg-white";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(ADMIN_SETTINGS_DEFAULTS);
  const [savedSettings, setSavedSettings] = useState(ADMIN_SETTINGS_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = readStoredAdminSettings();
    setSettings(stored);
    setSavedSettings(stored);
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <WorkspaceRouteLoading
        eyebrow="Admin Settings"
        label="Loading settings..."
        accent="slate"
      />
    );
  }

  const dirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  return (
    <div className="max-w-4xl space-y-6">
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            setSaving(true);
            const updated = persistAdminSettings(settings);
            setSettings(updated);
            setSavedSettings(updated);

            notify({
              type: "success",
              title: "Saved",
              message: "Settings updated successfully.",
            });
          } finally {
            setSaving(false);
          }
        }}
      >
        {/* PLATFORM */}
        <SettingsSectionCard
          title="Platform"
          description="Basic platform identity and defaults."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={settings.platformName}
              onChange={(e) =>
                setSettings((s) => ({ ...s, platformName: e.target.value }))
              }
              placeholder="Platform name"
              className={inputClassName}
            />

            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) =>
                setSettings((s) => ({ ...s, supportEmail: e.target.value }))
              }
              placeholder="Support email"
              className={inputClassName}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={settings.timezone}
              onChange={(e) =>
                setSettings((s) => ({ ...s, timezone: e.target.value }))
              }
              className={inputClassName}
            >
              {ADMIN_TIMEZONE_OPTIONS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>

            <select
              value={settings.currency}
              onChange={(e) =>
                setSettings((s) => ({ ...s, currency: e.target.value }))
              }
              className={inputClassName}
            >
              {ADMIN_CURRENCY_OPTIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </SettingsSectionCard>

        {/* NOTIFICATIONS */}
        <SettingsSectionCard
          title="Notifications"
          description="Important alerts only."
        >
          <SettingsToggleRow
            label="Enrollment alerts"
            checked={settings.enrollmentAlerts}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                enrollmentAlerts: e.target.checked,
              }))
            }
          />

          <SettingsToggleRow
            label="Security alerts"
            checked={settings.securityAlerts}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                securityAlerts: e.target.checked,
              }))
            }
          />
        </SettingsSectionCard>

        {/* MODERATION */}
        <SettingsSectionCard
          title="Moderation"
          description="Control content approval."
        >
          <SettingsToggleRow
            label="Require course approval"
            checked={settings.requireCourseApproval}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                requireCourseApproval: e.target.checked,
              }))
            }
          />
        </SettingsSectionCard>

        {/* ACTIONS */}
        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={() => setSettings(savedSettings)}
            disabled={!dirty}
            className="text-sm text-slate-500 disabled:opacity-40"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={!dirty || saving}
            className="rounded-full bg-slate-900 px-6 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}