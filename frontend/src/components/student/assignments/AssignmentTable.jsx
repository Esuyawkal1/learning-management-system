"use client";

import { FileText, UploadCloud } from "@/components/common/icons";
import { formatDate } from "@/utils/helpers";

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  Missing: "bg-rose-50 text-rose-700",
  Submitted: "bg-sky-50 text-sky-700",
  Late: "bg-orange-50 text-orange-700",
  Graded: "bg-emerald-50 text-emerald-700",
};

export default function AssignmentTable({ assignments = [], onSubmitAction }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/80">
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
              <th className="px-6 py-4 font-semibold">Assignment Title</th>
              <th className="px-6 py-4 font-semibold">Course</th>
              <th className="px-6 py-4 font-semibold">Due Date</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Submit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assignments.map((assignment) => (
              <tr key={assignment._id} className="text-sm text-slate-600">
                <td className="px-6 py-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-sky-50 p-2 text-sky-700">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{assignment.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{assignment.description || "Assignment submission and grading workspace."}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 font-medium text-slate-700">{assignment.course?.title || "Course"}</td>
                <td className="px-6 py-5">{formatDate(assignment.dueDate)}</td>
                <td className="px-6 py-5">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[assignment.status] || "bg-slate-100 text-slate-700"}`}>
                    {assignment.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <button
                    type="button"
                    onClick={() => onSubmitAction?.(assignment)}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                  >
                    <UploadCloud className="h-4 w-4" />
                    {assignment.submission ? "Resubmit" : "Submit"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
