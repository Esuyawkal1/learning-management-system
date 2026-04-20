import { formatCurrency, formatNumber } from "@/utils/helpers";

const insightToneClasses = {
  positive: "border-emerald-100 bg-emerald-50 text-emerald-800",
  attention: "border-amber-100 bg-amber-50 text-amber-800",
  neutral: "border-sky-100 bg-sky-50 text-sky-800",
};

export default function AnalyticsSidePanels({
  instructors = [],
  categories = [],
  metrics = [],
  insights = [],
}) {
  const maxCategoryRevenue = Math.max(...categories.map((item) => item.revenue || 0), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Instructor leaderboard
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Top teaching partners</h2>
        </div>

        <div className="mt-6 space-y-3">
          {instructors.length ? (
            instructors.map((instructor, index) => (
              <article
                key={instructor.id}
                className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{instructor.name}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatNumber(instructor.courses)} courses - {formatNumber(instructor.publishedCourses)} live
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(instructor.revenue)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatNumber(instructor.enrollments)} enrollments
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-slate-400">
                    <span>Completion</span>
                    <span>{instructor.completionRate}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-400"
                      style={{ width: `${Math.max(instructor.completionRate || 0, instructor.enrollments ? 6 : 0)}%` }}
                    />
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
              Instructor analytics will appear here once courses and enrollments are available.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Category mix</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Revenue by learning area</h2>
        </div>

        <div className="mt-6 space-y-4">
          {categories.length ? (
            categories.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{category.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatNumber(category.courses)} courses - {formatNumber(category.enrollments)} enrollments
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(category.revenue)}</p>
                    <p className="text-xs text-slate-500">{category.share}% of tracked revenue</p>
                  </div>
                </div>

                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-slate-900 via-sky-600 to-cyan-400"
                    style={{ width: `${Math.max(((category.revenue || 0) / maxCategoryRevenue) * 100, 10)}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
              Category revenue insights will populate after courses begin generating enrollments.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Operations pulse</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Health metrics and next actions</h2>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {metrics.map((metric) => (
            <div key={metric.key} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">{metric.label}</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{metric.value}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{metric.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {insights.map((insight) => (
            <article
              key={insight.title}
              className={`rounded-2xl border p-4 ${insightToneClasses[insight.tone] || insightToneClasses.neutral}`}
            >
              <h3 className="text-sm font-semibold">{insight.title}</h3>
              <p className="mt-2 text-sm leading-6">{insight.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
