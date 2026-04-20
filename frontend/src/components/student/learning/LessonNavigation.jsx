"use client";

import { ArrowRight } from "@/components/common/icons";

export default function LessonNavigation({
  previousLesson,
  nextLesson,
  onPrevious,
  onNext,
}) {
  return (
    <section className="rounded-[2rem] border border-sky-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!previousLesson}
          onClick={onPrevious}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Previous
        </button>

        <button
          type="button"
          disabled={!nextLesson}
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
