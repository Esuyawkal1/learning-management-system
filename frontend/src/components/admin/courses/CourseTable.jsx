"use client";

import Table from "@/components/common/Table";
import CourseActions from "@/components/admin/courses/CourseActions";
import { formatCurrency, formatDate } from "@/utils/helpers";

export default function CourseTable({
  courses,
  studentCounts,
  onViewStudents,
  onEdit,
  onDelete,
}) {
  return (
    <Table columns={["Course", "Instructor", "Category", "Price", "Students", "Status", "Updated", "Actions"]}>
      {courses.map((course) => (
        <tr key={course._id} className="text-sm text-slate-600">
          <td className="px-5 py-4">
            <div>
              <p className="font-semibold text-slate-900">{course.title}</p>
              <p className="mt-1 max-w-xs truncate text-xs text-slate-500">{course.description}</p>
            </div>
          </td>
          <td className="px-5 py-4">{course.instructor?.name || "Unassigned"}</td>
          <td className="px-5 py-4">{course.category || "General"}</td>
          <td className="px-5 py-4 font-semibold text-slate-900">{formatCurrency(course.price || 0)}</td>
          <td className="px-5 py-4">{studentCounts[course._id] || 0}</td>
          <td className="px-5 py-4">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${course.published ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {course.published ? "Published" : "Draft"}
            </span>
          </td>
          <td className="px-5 py-4">{formatDate(course.updatedAt)}</td>
          <td className="px-5 py-4">
            <CourseActions
              onViewStudents={() => onViewStudents(course)}
              onEdit={() => onEdit(course)}
              onDelete={() => onDelete(course)}
            />
          </td>
        </tr>
      ))}
    </Table>
  );
}
