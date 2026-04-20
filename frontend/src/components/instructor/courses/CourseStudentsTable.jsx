"use client";

import Table from "@/components/common/Table";

export default function CourseStudentsTable({ students = [] }) {
  return (
    <Table columns={["Student", "Email", "Progress", "Completed", "Lessons"]}>
      {students.map((student) => (
        <tr key={student._id} className="text-sm text-slate-600">
          <td className="px-5 py-4 font-semibold text-slate-900">{student.student?.name || "Student"}</td>
          <td className="px-5 py-4">{student.student?.email || "--"}</td>
          <td className="px-5 py-4">{student.progressRate || 0}%</td>
          <td className="px-5 py-4">{student.completedLessons || 0}</td>
          <td className="px-5 py-4">{student.totalLessons || 0}</td>
        </tr>
      ))}
    </Table>
  );
}
