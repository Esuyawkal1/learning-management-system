export default function SettingsSectionCard({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-5">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{eyebrow}</p>
        ) : null}
        <h2 className="mt-2 text-xl font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>

      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}
