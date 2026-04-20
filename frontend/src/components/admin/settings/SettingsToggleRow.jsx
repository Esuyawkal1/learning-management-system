export default function SettingsToggleRow({
  label,
  description,
  checked,
  onChange,
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-[1.5rem] border border-slate-100 bg-slate-50/80 px-4 py-4 transition hover:border-slate-200 hover:bg-white">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>

      <span
        className={`relative mt-1 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
          checked ? "bg-slate-900" : "bg-slate-200"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </label>
  );
}
