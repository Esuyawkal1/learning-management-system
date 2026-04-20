"use client";

import { Eye, Pencil, Trash2 } from "@/components/common/icons";
import Table from "@/components/common/Table";
import { formatCurrency, formatDate } from "@/utils/helpers";

export default function InstructorCourseTable({ courses, studentCounts, onEdit, onDelete, onViewStudents }) {
  return (
    <Table columns={["Course", "Category", "Price", "Students", "Status", "Updated", "Actions"]}>
      {courses.map((course) => (
        <tr key={course._id} className="text-sm text-slate-600">
          <td className="px-5 py-4">
            <div>
              <p className="font-semibold text-slate-900">{course.title}</p>
              <p className="mt-1 max-w-xs truncate text-xs text-slate-500">{course.description}</p>
            </div>
          </td>
          <td className="px-5 py-4">{course.category || "General"}</td>
          <td className="px-5 py-4 font-semibold text-slate-900">{formatCurrency(course.price || 0)}</td>
          <td className="px-5 py-4">{studentCounts[course._id] || 0}</td>
          <td className="px-5 py-4">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${course.published ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {course.published ? "Published" : "pending"}
            </span>
          </td>
          <td className="px-5 py-4">{formatDate(course.updatedAt)}</td>
          <td className="px-5 py-4">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => onViewStudents(course)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <Eye className="h-4 w-4" />
                Students
              </button>
              <button type="button" onClick={() => onEdit(course)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50">
                <Pencil className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => onDelete(course)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </Table>
  );
}
