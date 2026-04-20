"use client";

import { Pencil, Trash2 } from "@/components/common/icons";
import Table from "@/components/common/Table";
import { formatDate } from "@/utils/helpers";

export default function LessonTable({ lessons, onEdit, onDelete }) {
  return (
    <Table columns={["Lesson", "Course", "Order", "Status", "Updated", "Actions"]}>
      {lessons.map((lesson) => (
        <tr key={lesson._id} className="text-sm text-slate-600">
          <td className="px-5 py-4">
            <div>
              <p className="font-semibold text-slate-900">{lesson.title}</p>
              <p className="mt-1 max-w-xs truncate text-xs text-slate-500">{lesson.content || "No lesson summary yet."}</p>
            </div>
          </td>
          <td className="px-5 py-4">{lesson.course?.title || "Unassigned"}</td>
          <td className="px-5 py-4">{lesson.order}</td>
          <td className="px-5 py-4">
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  lesson.published ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {lesson.published ? "Published" : "Draft"}
              </span>
              {lesson.isPreview ? (
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                  Preview
                </span>
              ) : null}
            </div>
          </td>
          <td className="px-5 py-4">{formatDate(lesson.updatedAt)}</td>
          <td className="px-5 py-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(lesson)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(lesson)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </Table>
  );
}
