import { formatDate } from "@/utils/helpers";

function SummaryMetric({ label, value, helper }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{helper}</p>
    </div>
  );
}

export default function AdminSettingsSummaryPanel({
  user,
  settings,
  dirty,
  enabledAlertsCount,
  safeguardsCount,
}) {
  const readinessItems = [
    {
      title: "Moderation rules",
      value: safeguardsCount,
      helper: "Active publishing and review controls",
    },
    {
      title: "Live alerts",
      value: enabledAlertsCount,
      helper: "Notification rules currently switched on",
    },
    {
      title: "Workspace mode",
      value: settings.compactTables ? "Compact" : "Comfort",
      helper: "Admin list density and overview layout preference",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">Admin owner</p>
        <div className="mt-5 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 text-lg font-semibold text-white">
            {user?.name?.slice(0, 1)?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold">{user?.name || "Admin User"}</h2>
            <p className="mt-1 truncate text-sm text-slate-300">{user?.email || "admin@platform.local"}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400">{user?.role || "admin"}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-medium text-slate-200">{dirty ? "Unsaved changes" : "Settings synced"}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {dirty
              ? "Review your changes and save them to keep this admin workspace consistent."
              : settings.lastSavedAt
                ? `Last saved on ${formatDate(settings.lastSavedAt, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}.`
                : "You are using the default control center configuration."}
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Control summary</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">System readiness</h2>

        <div className="mt-6 space-y-3">
          {readinessItems.map((item) => (
            <SummaryMetric
              key={item.title}
              label={item.title}
              value={item.value}
              helper={item.helper}
            />
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Current profile</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">Platform configuration snapshot</h2>

        <div className="mt-6 space-y-3">
          <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Platform</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{settings.platformName}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Support</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{settings.supportEmail}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Timezone</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{settings.timezone}</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Currency</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{settings.currency}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
