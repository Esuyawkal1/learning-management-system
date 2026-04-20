"use client";

import { Search } from "@/components/common/icons";
import { formatCurrency, formatNumber } from "@/utils/helpers";

const filters = [
  { key: "all", label: "All courses" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
];

export default function CoursePerformancePanel({
  courses = [],
  query,
  filter,
  onQueryChange,
  onFilterChange,
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Course intelligence
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Searchable course performance</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Filter the live catalog by status and quickly compare enrollments, revenue, and completion.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Visible courses</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{formatNumber(courses.length)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <label className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 transition focus-within:border-slate-300 focus-within:bg-white xl:max-w-sm">
            <Search className="h-4 w-4" />
            <input
              type="search"
              value={query}
              onChange={onQueryChange}
              placeholder="Search by course, instructor, or category"
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => onFilterChange(item.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === item.key
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 max-h-[40rem] space-y-3 overflow-y-auto pr-1">
        {courses.length ? (
          courses.map((course) => (
            <article
              key={course.id}
              className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4 transition hover:border-slate-200 hover:bg-white"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-semibold text-slate-900">{course.title}</h3>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                        course.published
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {course.published ? "Live" : "Draft"}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-white px-3 py-1">Instructor: {course.instructor}</span>
                    <span className="rounded-full bg-white px-3 py-1">{course.category}</span>
                    <span className="rounded-full bg-white px-3 py-1">
                      {formatNumber(course.lessons)} lessons
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[24rem]">
                  <div className="rounded-2xl border border-white bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Enrollments</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {formatNumber(course.enrollments)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Revenue</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {formatCurrency(course.revenue)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Completion</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{course.completionRate}%</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  <span>Completion progress</span>
                  <span>{course.completionRate}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400"
                    style={{ width: `${Math.max(course.completionRate || 0, course.enrollments ? 6 : 0)}%` }}
                  />
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <h3 className="text-lg font-semibold text-slate-900">No matching courses</h3>
            <p className="mt-2 text-sm text-slate-500">
              Adjust the search or status filter to bring course analytics back into view.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
