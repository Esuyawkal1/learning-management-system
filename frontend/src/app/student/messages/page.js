"use client";

import { useEffect, useMemo, useState } from "react";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import { getStudentMessages, sendStudentMessage } from "@/services/student/student.message.service";
import { notify } from "@/store/notification.store";
import { formatDate, getInitials } from "@/utils/helpers";

function MessagesSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
      <div className="h-[620px] animate-pulse rounded-[2rem] bg-slate-200" />
      <div className="h-[620px] animate-pulse rounded-[2rem] bg-slate-200" />
    </div>
  );
}

export default function StudentMessagesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const loadMessages = async () => {
    try {
      const response = await getStudentMessages();
      setData(response);
      setSelectedThreadId((current) => current || response?.threads?.[0]?.id || "");
      setSelectedCourseId((current) => current || response?.availableCourses?.[0]?.courseId || "");
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

  const selectedThread = useMemo(
    () => data?.threads?.find((thread) => thread.id === selectedThreadId),
    [data?.threads, selectedThreadId]
  );

  const threadMessages = useMemo(() => {
    if (!selectedThread) {
      return [];
    }

    return (data?.messages || [])
      .filter((message) => {
        const sameCourse = String(message.course?._id || "") === String(selectedThread.course?._id || "");
        const sameInstructor =
          String(message.sender?._id || "") === String(selectedThread.instructor?._id || "") ||
          String(message.recipient?._id || "") === String(selectedThread.instructor?._id || "");

        return sameCourse && sameInstructor;
      })
      .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));
  }, [data?.messages, selectedThread]);

  if (loading) {
    return <MessagesSkeleton />;
  }

  if (error) {
    return <ErrorMessage title="Messages unavailable" message={error} actionLabel="Retry" onAction={loadMessages} />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
      <section className="rounded-[2rem] border border-sky-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3 px-2 pt-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Inbox</h2>
            <p className="text-sm text-slate-500">Unread notifications and course conversations with instructors.</p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedThreadId("")}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            New Message
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {(data?.threads || []).map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => setSelectedThreadId(thread.id)}
              className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                selectedThreadId === thread.id ? "bg-slate-900 text-white" : "bg-sky-50 text-slate-700 hover:bg-sky-100"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="truncate font-semibold">{thread.instructor?.name || "Instructor"}</p>
                {thread.unreadCount ? (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">
                    {thread.unreadCount}
                  </span>
                ) : null}
              </div>
              <p className={`mt-1 truncate text-sm ${selectedThreadId === thread.id ? "text-slate-200" : "text-slate-500"}`}>
                {thread.course?.title || "Course conversation"}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm">
        {selectedThread ? (
          <>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                {getInitials(selectedThread.instructor?.name || "Instructor")}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{selectedThread.instructor?.name || "Instructor"}</p>
                <p className="text-sm text-slate-500">{selectedThread.course?.title || "Course thread"}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {threadMessages.length ? (
                threadMessages.map((message) => {
                  const isStudent = String(message.sender?.role || "").toLowerCase() === "student";

                  return (
                    <div key={message._id} className={`flex ${isStudent ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xl rounded-3xl px-4 py-3 ${isStudent ? "bg-slate-900 text-white" : "bg-sky-50 text-slate-800"}`}>
                        <p className="text-sm leading-6">{message.content}</p>
                        <p className={`mt-2 text-xs ${isStudent ? "text-slate-300" : "text-slate-400"}`}>
                          {formatDate(message.createdAt, { month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState title="No messages yet" description="Start the conversation with your instructor for this course." />
              )}
            </div>

            <form
              className="mt-6 space-y-3"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!messageText.trim()) {
                  return;
                }

                try {
                  setSending(true);
                  await sendStudentMessage({
                    courseId: selectedThread.course?._id,
                    content: messageText,
                  });
                  setMessageText("");
                  await loadMessages();
                } catch (requestError) {
                  notify({
                    type: "error",
                    title: "Unable to send message",
                    message: requestError.message,
                  });
                } finally {
                  setSending(false);
                }
              }}
            >
              <textarea
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                rows={4}
                placeholder="Ask a question, request clarification, or share an update..."
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-70"
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="space-y-6">
            <EmptyState title="No message threads yet" description="Pick a course to start a conversation with the instructor." />

            <form
              className="rounded-3xl border border-slate-100 bg-sky-50/60 p-5"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!selectedCourseId || !messageText.trim()) {
                  return;
                }

                try {
                  setSending(true);
                  await sendStudentMessage({
                    courseId: selectedCourseId,
                    content: messageText,
                  });
                  setMessageText("");
                  await loadMessages();
                } catch (requestError) {
                  notify({
                    type: "error",
                    title: "Unable to send message",
                    message: requestError.message,
                  });
                } finally {
                  setSending(false);
                }
              }}
            >
              <h3 className="text-lg font-semibold text-slate-900">Send New Message</h3>
              <p className="mt-1 text-sm text-slate-500">Choose one of your courses and message the instructor directly.</p>

              <select
                value={selectedCourseId}
                onChange={(event) => setSelectedCourseId(event.target.value)}
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
              >
                <option value="">Select course</option>
                {(data?.availableCourses || []).map((course) => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.title} - {course.instructor?.name || "Instructor"}
                  </option>
                ))}
              </select>

              <textarea
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                rows={5}
                placeholder="Write your message here..."
                className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-70"
                >
                  {sending ? "Sending..." : "Start Conversation"}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
