"use client";

import { Plus, Search } from "@/components/common/icons";

export default function CourseFilters({ searchValue, onSearchChange, onCreate }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-500 shadow-sm lg:min-w-[340px]">
        <Search className="h-4 w-4" />
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          type="search"
          placeholder="Search by course title, category, or instructor..."
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400"
        />
      </label>

      <button
        type="button"
        onClick={onCreate}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        <Plus className="h-4 w-4" />
        Create Course
      </button>
    </div>
  );
}
