"use client";

import { useEffect, useMemo, useState } from "react";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import AssignmentTable from "@/components/student/assignments/AssignmentTable";
import { getStudentAssignments, submitStudentAssignment } from "@/services/student/student.assignment.service";
import { notify } from "@/store/notification.store";
import { formatDate } from "@/utils/helpers";

function AssignmentsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-44 animate-pulse rounded-[2rem] bg-slate-200" />
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="h-[460px] animate-pulse rounded-[2rem] bg-slate-200" />
        <div className="h-[460px] animate-pulse rounded-[2rem] bg-slate-200" />
      </div>
    </div>
  );
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadAssignments = async () => {
    try {
      const response = await getStudentAssignments();
      setAssignments(response);
      setSelectedAssignment((current) => response.find((assignment) => assignment._id === current?._id) || response[0] || null);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    if (!selectedAssignment) {
      setSubmissionText("");
      setAttachmentUrl("");
      return;
    }

    setSubmissionText(selectedAssignment.submission?.submissionText || "");
    setAttachmentUrl(selectedAssignment.submission?.attachmentUrl || "");
  }, [selectedAssignment]);

  const summary = useMemo(() => {
    return {
      total: assignments.length,
      pending: assignments.filter((assignment) => assignment.status === "Pending" || assignment.status === "Missing").length,
      submitted: assignments.filter((assignment) => assignment.status === "Submitted" || assignment.status === "Late").length,
      graded: assignments.filter((assignment) => assignment.status === "Graded").length,
    };
  }, [assignments]);

  if (loading) {
    return <AssignmentsSkeleton />;
  }

  if (error) {
    return <ErrorMessage title="Assignments unavailable" message={error} actionLabel="Retry" onAction={loadAssignments} />;
  }

  if (!assignments.length) {
    return <EmptyState title="No assignments yet" description="New course assignments and graded work will appear here as instructors publish them." />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-600">Assignments</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Track deadlines, submit work, and monitor grading status.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Select any assignment to review instructions, upload your submission URL, and send updated work without leaving the workspace.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { label: "Total", value: summary.total, tone: "bg-slate-100 text-slate-900" },
              { label: "Pending", value: summary.pending, tone: "bg-amber-50 text-amber-700" },
              { label: "Submitted", value: summary.submitted, tone: "bg-sky-50 text-sky-700" },
              { label: "Graded", value: summary.graded, tone: "bg-emerald-50 text-emerald-700" },
            ].map((item) => (
              <div key={item.label} className={`rounded-3xl px-4 py-4 ${item.tone}`}>
                <p className="text-xs uppercase tracking-[0.2em] opacity-80">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AssignmentTable assignments={assignments} onSubmitAction={setSelectedAssignment} />

        <section className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm">
          {selectedAssignment ? (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Selected Assignment</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-900">{selectedAssignment.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{selectedAssignment.course?.title || "Course assignment"}</p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Due Date</p>
                  <p className="mt-3 font-semibold text-slate-900">{formatDate(selectedAssignment.dueDate)}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Current Status</p>
                  <p className="mt-3 font-semibold text-slate-900">{selectedAssignment.status}</p>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Instructions</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {selectedAssignment.instructions || selectedAssignment.description || "Review your course materials and submit the required work for instructor review."}
                </p>
              </div>

              <form
                className="mt-6 space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();

                  try {
                    setSaving(true);
                    await submitStudentAssignment({
                      assignmentId: selectedAssignment._id,
                      submissionText,
                      attachmentUrl,
                    });
                    notify({
                      type: "success",
                      title: "Assignment submitted",
                      message: "Your work has been sent to the instructor workspace.",
                    });
                    await loadAssignments();
                  } catch (requestError) {
                    notify({
                      type: "error",
                      title: "Unable to submit assignment",
                      message: requestError.message,
                    });
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Submission notes</span>
                  <textarea
                    value={submissionText}
                    onChange={(event) => setSubmissionText(event.target.value)}
                    rows={6}
                    placeholder="Summarize your work, approach, or include any notes for the instructor..."
                    className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Attachment URL</span>
                  <input
                    value={attachmentUrl}
                    onChange={(event) => setAttachmentUrl(event.target.value)}
                    placeholder="https://example.com/submission"
                    className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
                  />
                </label>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-70"
                  >
                    {saving ? "Submitting..." : selectedAssignment.submission ? "Update Submission" : "Submit Assignment"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <EmptyState title="Select an assignment" description="Choose an assignment from the table to review it and submit your work." />
          )}
        </section>
      </div>
    </div>
  );
}
