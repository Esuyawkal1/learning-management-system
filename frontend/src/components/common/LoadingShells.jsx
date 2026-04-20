"use client";

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

function SkeletonBlock({ className = "" }) {
  return <div aria-hidden="true" className={joinClasses("animate-pulse rounded-3xl bg-slate-100", className)} />;
}

function LoadingNotice({ eyebrow, label, accentTextClass, accentDotClass }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className={joinClasses("text-xs font-semibold uppercase tracking-[0.32em]", accentTextClass)}>
          {eyebrow}
        </p>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className={joinClasses("h-2.5 w-2.5 animate-pulse rounded-full", accentDotClass)} />
          <span>{label}</span>
        </div>
      </div>

      <div className="space-y-3">
        <SkeletonBlock className="h-10 max-w-2xl rounded-2xl" />
        <SkeletonBlock className="h-4 max-w-3xl rounded-full" />
        <SkeletonBlock className="h-4 max-w-2xl rounded-full" />
      </div>
    </div>
  );
}

const ACCENTS = {
  sky: {
    text: "text-sky-600",
    dot: "bg-sky-500",
    soft: "bg-sky-50",
  },
  amber: {
    text: "text-amber-500",
    dot: "bg-amber-400",
    soft: "bg-amber-50",
  },
  slate: {
    text: "text-slate-500",
    dot: "bg-slate-500",
    soft: "bg-slate-100",
  },
};

function WorkspaceStats({ accent }) {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className={joinClasses("rounded-3xl px-4 py-4", accent.soft)}
        >
          <SkeletonBlock className="h-3 w-20 rounded-full" />
          <SkeletonBlock className="mt-4 h-8 w-16 rounded-2xl" />
        </div>
      ))}
    </div>
  );
}

function WorkspaceCards({ count = 4 }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <section
          key={index}
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <SkeletonBlock className="h-5 w-40 rounded-2xl" />
          <div className="mt-5 space-y-3">
            <SkeletonBlock className="h-20 rounded-[1.75rem]" />
            <SkeletonBlock className="h-20 rounded-[1.75rem]" />
            <SkeletonBlock className="h-20 rounded-[1.75rem]" />
          </div>
        </section>
      ))}
    </div>
  );
}

export function WorkspaceRouteLoading({
  eyebrow = "Workspace",
  label = "Loading page...",
  accent = "sky",
}) {
  const styles = ACCENTS[accent] || ACCENTS.sky;

  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <LoadingNotice
              eyebrow={eyebrow}
              label={label}
              accentTextClass={styles.text}
              accentDotClass={styles.dot}
            />
          </div>

          <WorkspaceStats accent={styles} />
        </div>
      </section>

      <WorkspaceCards />
    </div>
  );
}

export function PublicRouteLoading({ label = "Loading page..." }) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-live="polite">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <LoadingNotice
          eyebrow="Loading"
          label={label}
          accentTextClass="text-slate-500"
          accentDotClass="bg-slate-500"
        />
      </section>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <section
            key={index}
            className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <SkeletonBlock className="aspect-[16/10] rounded-[1.75rem]" />
            <div className="mt-5 space-y-3">
              <SkeletonBlock className="h-4 w-24 rounded-full" />
              <SkeletonBlock className="h-7 w-4/5 rounded-2xl" />
              <SkeletonBlock className="h-4 w-full rounded-full" />
              <SkeletonBlock className="h-4 w-2/3 rounded-full" />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function PublicCatalogRouteLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-live="polite">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <LoadingNotice
              eyebrow="Course Catalog"
              label="Loading courses..."
              accentTextClass="text-amber-500"
              accentDotClass="bg-amber-400"
            />
          </div>

          <div className="grid w-full max-w-xl gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-3xl bg-slate-50 px-4 py-4">
                <SkeletonBlock className="h-3 w-20 rounded-full" />
                <SkeletonBlock className="mt-4 h-8 w-14 rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <section
            key={index}
            className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <SkeletonBlock className="aspect-[16/10] rounded-[1.75rem]" />
            <div className="mt-5 space-y-3">
              <SkeletonBlock className="h-4 w-24 rounded-full" />
              <SkeletonBlock className="h-7 w-4/5 rounded-2xl" />
              <SkeletonBlock className="h-4 w-full rounded-full" />
              <SkeletonBlock className="h-4 w-2/3 rounded-full" />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function PublicCourseRouteLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-live="polite">
      <SkeletonBlock className="h-48 rounded-[2rem]" />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_300px]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <SkeletonBlock className="h-6 w-40 rounded-2xl" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-20 rounded-[1.75rem]" />
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <SkeletonBlock className="aspect-video rounded-[1.75rem]" />
          <div className="mt-6 space-y-3">
            <SkeletonBlock className="h-7 w-2/3 rounded-2xl" />
            <SkeletonBlock className="h-4 w-full rounded-full" />
            <SkeletonBlock className="h-4 w-5/6 rounded-full" />
            <SkeletonBlock className="h-40 rounded-[1.75rem]" />
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <SkeletonBlock className="h-6 w-28 rounded-2xl" />
            <div className="mt-5 space-y-3">
              <SkeletonBlock className="h-20 rounded-[1.75rem]" />
              <SkeletonBlock className="h-20 rounded-[1.75rem]" />
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <SkeletonBlock className="h-6 w-36 rounded-2xl" />
            <div className="mt-5 space-y-3">
              <SkeletonBlock className="h-20 rounded-[1.75rem]" />
              <SkeletonBlock className="h-20 rounded-[1.75rem]" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function StudentSettingsLoadingState() {
  return (
    <div className="mx-auto max-w-4xl rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm" aria-busy="true" aria-live="polite">
      <LoadingNotice
        eyebrow="Settings"
        label="Loading your workspace preferences..."
        accentTextClass="text-sky-600"
        accentDotClass="bg-sky-500"
      />

      <div className="mt-8 space-y-6">
        <section className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5">
          <SkeletonBlock className="h-6 w-36 rounded-2xl" />
          <SkeletonBlock className="mt-3 h-4 w-52 rounded-full" />
          <div className="mt-5 flex flex-wrap gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-10 w-28 rounded-full" />
            ))}
          </div>
          <SkeletonBlock className="mt-5 h-4 w-48 rounded-full" />
        </section>

        <section className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5">
          <SkeletonBlock className="h-6 w-56 rounded-2xl" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white px-4 py-4"
              >
                <div className="space-y-3">
                  <SkeletonBlock className="h-4 w-44 rounded-full" />
                  <SkeletonBlock className="h-4 w-56 rounded-full" />
                </div>
                <SkeletonBlock className="h-6 w-6 rounded-md" />
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end">
          <SkeletonBlock className="h-11 w-36 rounded-full" />
        </div>
      </div>
    </div>
  );
}
