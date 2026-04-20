"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, PlayCircle } from "@/components/common/icons";

const getLessonKey = (lessonId) => String(lessonId || "");

export default function LessonSidebar({
  lessons = [],
  activeLessonId = "",
  onSelectLesson,
}) {
  const itemRefs = useRef({});

  useEffect(() => {
    const activeItem = itemRefs.current[getLessonKey(activeLessonId)];
    activeItem?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeLessonId]);

  return (
    <aside className="rounded-[2rem] border border-sky-100 bg-white p-4 shadow-sm">
      <div className="border-b border-slate-100 px-2 pb-4">
        <h2 className="text-lg font-semibold text-slate-900">Lessons</h2>
        <p className="mt-1 text-sm text-slate-500">
          Work through the course step by step and resume from where you left off.
        </p>
      </div>

      <div className="mt-4 max-h-[70vh] space-y-2 overflow-y-auto pr-1">
        {lessons.map((lesson, index) => {
          const lessonKey = getLessonKey(lesson._id);
          const isActive = lessonKey === getLessonKey(activeLessonId);

          return (
            <button
              key={lessonKey}
              type="button"
              ref={(node) => {
                itemRefs.current[lessonKey] = node;
              }}
              onClick={() => onSelectLesson?.(lesson)}
              className={`w-full rounded-[1.5rem] border px-4 py-4 text-left transition ${
                isActive
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-100 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em]">
                    Lesson {lesson.order || index + 1}
                  </p>
                  <p className="mt-2 truncate font-semibold">{lesson.title}</p>
                </div>

                {lesson.completed ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                ) : (
                  <PlayCircle className="mt-0.5 h-5 w-5 shrink-0" />
                )}
              </div>

              <p className={`mt-3 text-xs ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                {lesson.completed
                  ? "Completed"
                  : `${lesson.lessonProgressPercentage || 0}% watched`}
              </p>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
