"use client";

import { useEffect, useMemo, useState } from "react";
import Loader from "@/components/common/Loader";
import ErrorMessage from "@/components/common/ErrorMessage";
import EmptyState from "@/components/common/EmptyState";
import { getInstructorMessages, sendInstructorMessage } from "@/services/instructor/instructor.analytics.service";
import { notify } from "@/store/notification.store";
import { formatDate, getInitials } from "@/utils/helpers";

export default function InstructorMessagesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [composeTarget, setComposeTarget] = useState("");

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await getInstructorMessages();
      setData(response);
      setSelectedThreadId((current) => current || response?.threads?.[0]?.id || "");
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const selectedThread = useMemo(() => data?.threads?.find((thread) => thread.id === selectedThreadId), [data?.threads, selectedThreadId]);

  const threadMessages = useMemo(() => {
    if (!selectedThread) return [];
    return (data?.messages || [])
      .filter((message) => {
        const counterpartId = selectedThread.student?._id;
        const hasCounterpart = String(message.sender?._id) === String(counterpartId) || String(message.recipient?._id) === String(counterpartId);
        return hasCounterpart && String(message.course?._id || "") === String(selectedThread.course?._id || "");
      })
      .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));
  }, [data?.messages, selectedThread]);

  const availableStudents = data?.availableStudents || [];
  const selectedComposeTarget = availableStudents.find(
    (student) => `${student.student?._id}-${student.course?._id}` === composeTarget
  );

  if (loading) return <Loader label="Loading messages..." />;
  if (error) return <ErrorMessage title="Messages unavailable" message={error} actionLabel="Retry" onAction={loadMessages} />;

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
      <section className="rounded-3xl border border-amber-100 bg-white p-4 shadow-sm">
        <h2 className="px-2 pt-2 text-lg font-semibold text-slate-900">Threads</h2>
        <p className="px-2 text-sm text-slate-500">Unread notifications and recent conversations with your students.</p>
        <div className="mt-4 space-y-2">
          {(data?.threads || []).map((thread) => (
            <button key={thread.id} type="button" onClick={() => setSelectedThreadId(thread.id)} className={`w-full rounded-2xl px-4 py-3 text-left transition ${selectedThreadId === thread.id ? "bg-slate-900 text-white" : "bg-amber-50 text-slate-700 hover:bg-amber-100"}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="truncate font-semibold">{thread.student?.name || "Student"}</p>
                {thread.unreadCount ? <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">{thread.unreadCount}</span> : null}
              </div>
              <p className={`mt-1 truncate text-sm ${selectedThreadId === thread.id ? "text-slate-200" : "text-slate-500"}`}>{thread.course?.title || "Course conversation"}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
        {selectedThread ? (
          <>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                {getInitials(selectedThread.student?.name)}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{selectedThread.student?.name || "Student"}</p>
                <p className="text-sm text-slate-500">{selectedThread.course?.title || "Course thread"}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {threadMessages.length ? (
                threadMessages.map((message) => {
                  const isInstructor = String(message.sender?.role || "").toLowerCase() === "instructor";
                  return (
                    <div key={message._id} className={`flex ${isInstructor ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xl rounded-3xl px-4 py-3 ${isInstructor ? "bg-slate-900 text-white" : "bg-amber-50 text-slate-800"}`}>
                        <p className="text-sm leading-6">{message.content}</p>
                        <p className={`mt-2 text-xs ${isInstructor ? "text-slate-300" : "text-slate-400"}`}>{formatDate(message.createdAt, { month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState title="No messages yet" description="Start the conversation with this student." />
              )}
            </div>

            <form
              className="mt-6 space-y-3"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!messageText.trim()) return;
                try {
                  setSending(true);
                  await sendInstructorMessage({ recipientId: selectedThread.student?._id, courseId: selectedThread.course?._id, content: messageText });
                  setMessageText("");
                  await loadMessages();
                } catch (requestError) {
                  notify({ type: "error", title: "Unable to send message", message: requestError.message });
                } finally {
                  setSending(false);
                }
              }}
            >
              <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} rows={4} placeholder="Send guidance, feedback, or answer a question..." className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              <div className="flex justify-end">
                <button type="submit" disabled={sending} className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-70">
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="space-y-6">
            <EmptyState title="No message threads" description="Start a conversation with one of your enrolled students." />
            {availableStudents.length ? (
              <form
                className="rounded-3xl border border-slate-100 bg-amber-50/50 p-5"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!selectedComposeTarget || !messageText.trim()) return;

                  try {
                    setSending(true);
                    await sendInstructorMessage({
                      recipientId: selectedComposeTarget.student?._id,
                      courseId: selectedComposeTarget.course?._id,
                      content: messageText,
                    });
                    setMessageText("");
                    setComposeTarget("");
                    await loadMessages();
                  } catch (requestError) {
                    notify({ type: "error", title: "Unable to send message", message: requestError.message });
                  } finally {
                    setSending(false);
                  }
                }}
              >
                <h3 className="text-lg font-semibold text-slate-900">Start New Conversation</h3>
                <p className="mt-1 text-sm text-slate-500">Choose a student-course pair and send the first message.</p>

                <select
                  value={composeTarget}
                  onChange={(event) => setComposeTarget(event.target.value)}
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                >
                  <option value="">Select student and course</option>
                  {availableStudents.map((student) => (
                    <option key={`${student._id}-${student.course?._id}`} value={`${student.student?._id}-${student.course?._id}`}>
                      {student.student?.name} • {student.course?.title}
                    </option>
                  ))}
                </select>

                <textarea
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  rows={4}
                  placeholder="Send a welcome message, reminder, or personalized note..."
                  className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                />

                <div className="mt-4 flex justify-end">
                  <button type="submit" disabled={sending} className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-70">
                    {sending ? "Sending..." : "Start Conversation"}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
