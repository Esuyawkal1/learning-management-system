"use client";

import { Trash2 } from "@/components/common/icons";
import Table from "@/components/common/Table";
import { formatCurrency, formatDate } from "@/utils/helpers";

export default function EnrollmentTable({ enrollments, onDelete }) {
  return (
    <Table columns={["Student", "Course", "Revenue", "Enrolled", "Actions"]}>
      {enrollments.map((enrollment) => (
        <tr key={enrollment._id} className="text-sm text-slate-600">
          <td className="px-5 py-4">
            <div>
              <p className="font-semibold text-slate-900">{enrollment.student?.name || "Learner"}</p>
              <p className="text-xs text-slate-500">{enrollment.student?.email || "No email available"}</p>
            </div>
          </td>
          <td className="px-5 py-4 font-medium text-slate-900">{enrollment.course?.title || "Course not found"}</td>
          <td className="px-5 py-4">{formatCurrency(enrollment.course?.price || 0)}</td>
          <td className="px-5 py-4">{formatDate(enrollment.createdAt)}</td>
          <td className="px-5 py-4">
            <button
              type="button"
              onClick={() => onDelete(enrollment)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </td>
        </tr>
      ))}
    </Table>
  );
}
