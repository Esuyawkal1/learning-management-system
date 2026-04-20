"use client";

import Table from "@/components/common/Table";
import { formatDate } from "@/utils/helpers";

export default function StudentTable({ students = [] }) {
  return (
    <Table columns={["Student", "Course", "Progress", "Completed", "Lessons", "Enrolled"]}>
      {students.map((student) => (
        <tr key={student._id} className="text-sm text-slate-600">
          <td className="px-5 py-4">
            <div>
              <p className="font-semibold text-slate-900">{student.student?.name || "Student"}</p>
              <p className="text-xs text-slate-500">{student.student?.email || "--"}</p>
            </div>
          </td>
          <td className="px-5 py-4">{student.course?.title || "Course"}</td>
          <td className="px-5 py-4">{student.progressRate || 0}%</td>
          <td className="px-5 py-4">{student.completedLessons || 0}</td>
          <td className="px-5 py-4">{student.totalLessons || 0}</td>
          <td className="px-5 py-4">{formatDate(student.createdAt)}</td>
        </tr>
      ))}
    </Table>
  );
}
