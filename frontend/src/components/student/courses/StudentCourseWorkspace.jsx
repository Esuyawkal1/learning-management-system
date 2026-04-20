"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import { CheckCircle2, FileText, PlayCircle } from "@/components/common/icons";
import CourseProgressBar from "@/components/student/courses/CourseProgressBar";
import TrackedLessonVideo from "@/components/student/learning/TrackedLessonVideo";
import { getStudentCourseById } from "@/services/student/student.course.service";
import { saveLessonProgress } from "@/services/student/student.learning.service";
import { notify } from "@/store/notification.store";
import { formatDate } from "@/utils/helpers";

const getBookmarkKey = (courseId) => `student-course-bookmarks:${courseId}`;
const isDirectVideoUrl = (url = "") => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
const EMPTY_LESSONS = [];
const getLessonKey = (lessonId) => String(lessonId || "");

function CourseLearningSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-40 animate-pulse rounded-[2rem] bg-slate-200" />
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <div className="h-[780px] animate-pulse rounded-[2rem] bg-slate-200" />
        <div className="h-[780px] animate-pulse rounded-[2rem] bg-slate-200" />
        <div className="h-[780px] animate-pulse rounded-[2rem] bg-slate-200" />
      </div>
    </div>
  );
}

const buildCourseModules = (lessons = []) => [
  {
    id: "module-1",
    title: "Module 1",
    description: "Published lessons ready to learn",
    lessons,
  },
];

const mergeLearningSnapshotIntoCourse = (currentCourse, snapshot) => {
  if (!currentCourse || !snapshot) {
    return currentCourse;
  }

  const lastTouchedLesson = (snapshot.lessons || []).find(
    (lesson) => String(lesson._id) === String(snapshot.lastLessonId || snapshot.currentLessonId || "")
  );

  return {
    ...currentCourse,
    ...(snapshot.course || {}),
    assignments: currentCourse.assignments || [],
    lessons: snapshot.lessons || currentCourse.lessons || [],
    totalLessons: snapshot.progress?.totalLessons ?? currentCourse.totalLessons,
    completedLessons: snapshot.progress?.completedLessons ?? currentCourse.completedLessons,
    progressPercentage: snapshot.progress?.progressPercentage ?? currentCourse.progressPercentage,
    currentLessonId: snapshot.currentLessonId ?? currentCourse.currentLessonId,
    lastAccessedAt:
      lastTouchedLesson?.lastAccessedAt ||
      currentCourse.lastAccessedAt ||
      currentCourse.updatedAt,
  };
};

export default function StudentCourseWorkspace({ courseId }) {
  const trackedLessonRef = useRef("");
  const syncStateRef = useRef({
    requestInFlight: false,
    queuedPayloads: {},
  });
  const [course, setCourse] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!courseId) {
      setBookmarks([]);
      return;
    }

    const storedBookmarks = window.localStorage.getItem(getBookmarkKey(courseId));

    if (!storedBookmarks) {
      setBookmarks([]);
      return;
    }

    try {
      setBookmarks(JSON.parse(storedBookmarks).map((lessonId) => getLessonKey(lessonId)));
    } catch (_error) {
      setBookmarks([]);
    }
  }, [courseId]);

  useEffect(() => {
    trackedLessonRef.current = "";
    syncStateRef.current = {
      requestInFlight: false,
      queuedPayloads: {},
    };
  }, [courseId]);

  const syncLessonProgress = useCallback(
    async ({
      lessonId,
      secondsSpent = 0,
      durationSeconds,
      completed = false,
      notifyOnError = false,
    } = {}) => {
      const resolvedLessonId = getLessonKey(lessonId);

      if (!courseId || !resolvedLessonId) {
        return;
      }

      const normalizedSecondsSpent =
        Number.isFinite(Number(secondsSpent)) && Number(secondsSpent) > 0
          ? Number(Number(secondsSpent).toFixed(2))
          : 0;
      const normalizedDurationSeconds =
        Number.isFinite(Number(durationSeconds)) && Number(durationSeconds) > 0
          ? Math.round(Number(durationSeconds))
          : 0;
      const syncState = syncStateRef.current;

      if (syncState.requestInFlight) {
        const queuedPayload = syncState.queuedPayloads[resolvedLessonId] || {
          lessonId: resolvedLessonId,
          secondsSpent: 0,
          durationSeconds: 0,
          completed: false,
          notifyOnError: false,
        };

        queuedPayload.secondsSpent = Number(
          (Number(queuedPayload.secondsSpent || 0) + normalizedSecondsSpent).toFixed(2)
        );
        queuedPayload.durationSeconds = Math.max(
          Number(queuedPayload.durationSeconds || 0),
          normalizedDurationSeconds
        );
        queuedPayload.completed = queuedPayload.completed || Boolean(completed);
        queuedPayload.notifyOnError = queuedPayload.notifyOnError || Boolean(notifyOnError);
        syncState.queuedPayloads[resolvedLessonId] = queuedPayload;
        return;
      }

      syncState.requestInFlight = true;

      try {
        const snapshot = await saveLessonProgress({
          courseId,
          lessonId: resolvedLessonId,
          secondsSpent: normalizedSecondsSpent,
          durationSeconds: normalizedDurationSeconds,
          completed,
        });

        if (trackedLessonRef.current === `${courseId}:${resolvedLessonId}`) {
          setCourse((currentCourse) =>
            mergeLearningSnapshotIntoCourse(currentCourse, snapshot)
          );
        }
      } catch (requestError) {
        if (notifyOnError) {
          notify({
            type: "error",
            title: "Unable to sync lesson progress",
            message: requestError.message || "Please try again in a moment.",
          });
        }
      } finally {
        syncState.requestInFlight = false;

        const [nextQueuedLessonId] = Object.keys(syncState.queuedPayloads);

        if (nextQueuedLessonId) {
          const queuedPayload = syncState.queuedPayloads[nextQueuedLessonId];
          delete syncState.queuedPayloads[nextQueuedLessonId];
          void syncLessonProgress(queuedPayload);
        }
      }
    },
    [courseId]
  );

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) {
        setCourse(null);
        setError("We could not determine which course to open.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getStudentCourseById(courseId);
        setCourse(response);
        setSelectedLessonId((current) =>
          current &&
          response?.lessons?.some(
            (lesson) => getLessonKey(lesson._id) === getLessonKey(current)
          )
            ? current
            : getLessonKey(response?.currentLessonId || response?.lessons?.[0]?._id || "")
        );
        setError("");
      } catch (requestError) {
        setCourse(null);
        setError(requestError.message || "Failed to load course workspace.");
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId, retryKey]);

  const lessons = course?.lessons || EMPTY_LESSONS;
  const modules = useMemo(() => buildCourseModules(lessons), [lessons]);
  const selectedLesson =
    lessons.find((lesson) => getLessonKey(lesson._id) === getLessonKey(selectedLessonId)) ||
    lessons[0] ||
    null;
  const selectedLessonIndex = lessons.findIndex(
    (lesson) => getLessonKey(lesson._id) === getLessonKey(selectedLesson?._id)
  );
  const previousLesson = selectedLessonIndex > 0 ? lessons[selectedLessonIndex - 1] : null;
  const nextLesson = selectedLessonIndex >= 0 ? lessons[selectedLessonIndex + 1] : null;
  const bookmarkedLessons = useMemo(
    () => new Set(bookmarks.map((lessonId) => getLessonKey(lessonId))),
    [bookmarks]
  );

  useEffect(() => {
    if (!courseId || !selectedLessonId) {
      return;
    }

    const trackingKey = `${courseId}:${selectedLessonId}`;
    trackedLessonRef.current = trackingKey;
    void syncLessonProgress({
      lessonId: selectedLessonId,
      notifyOnError: true,
    });

    return () => {
      if (trackedLessonRef.current === trackingKey) {
        trackedLessonRef.current = "";
      }
    };
  }, [courseId, selectedLessonId, syncLessonProgress]);

  const handleVideoProgress = useCallback(
    ({ lessonId, secondsSpent = 0, durationSeconds, completed = false } = {}) => {
      void syncLessonProgress({
        lessonId,
        secondsSpent,
        durationSeconds,
        completed,
      });
    },
    [syncLessonProgress]
  );

  const saveBookmarks = (nextBookmarks) => {
    setBookmarks(nextBookmarks);

    if (!courseId) {
      return;
    }

    window.localStorage.setItem(
      getBookmarkKey(courseId),
      JSON.stringify(nextBookmarks.map((lessonId) => getLessonKey(lessonId)))
    );
  };

  if (loading) {
    return <CourseLearningSkeleton />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Course unavailable"
        message={error}
        actionLabel="Retry"
        onAction={() => setRetryKey((current) => current + 1)}
      />
    );
  }

  if (!course) {
    return (
      <EmptyState
        title="Course not found"
        description="We could not find this learning workspace in your enrollments."
      />
    );
  }

  if (!lessons.length) {
    return (
      <EmptyState
        title="No published lessons yet"
        description="This course is enrolled, but the instructor has not published any lessons yet."
        actionLabel="Retry"
        onAction={() => setRetryKey((current) => current + 1)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-600">Course Learning</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">{course.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">{course.description}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-4 py-2">Instructor: {course.instructor?.name || "Instructor"}</span>
              <span className="rounded-full bg-sky-50 px-4 py-2 text-sky-700">Enrolled {formatDate(course.enrolledAt)}</span>
              <span className="rounded-full bg-emerald-50 px-4 py-2 text-emerald-700">
                {course.completedLessons || 0}/{course.totalLessons || 0} lessons complete
              </span>
            </div>
          </div>

          <div className="w-full max-w-sm rounded-[2rem] bg-slate-50 p-5">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Course Progress</span>
              <span className="font-semibold text-slate-900">{course.progressPercentage || 0}%</span>
            </div>
            <div className="mt-4">
              <CourseProgressBar value={course.progressPercentage} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <aside className="rounded-[2rem] border border-sky-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-2 pb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Curriculum</h3>
              <p className="text-sm text-slate-500">Move lesson by lesson from the course roadmap.</p>
            </div>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              {lessons.length}
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {modules.map((module) => (
              <section key={module.id} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="border-b border-slate-200 pb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">{module.title}</p>
                  <p className="mt-2 text-sm text-slate-500">{module.description}</p>
                </div>

                <div className="mt-4 space-y-2">
                  {module.lessons.map((lesson) => {
                    const lessonKey = getLessonKey(lesson._id);
                    const isSelected =
                      getLessonKey(selectedLesson?._id) === lessonKey;
                    const isSaved = bookmarkedLessons.has(lessonKey);

                    return (
                      <div
                        key={lessonKey}
                        className={`rounded-3xl border px-4 py-4 transition ${
                          isSelected
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-100 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/50"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedLessonId(lessonKey)}
                          className="w-full text-left"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold">{lesson.title}</p>
                            {lesson.completed ? <CheckCircle2 className="h-4 w-4" /> : null}
                          </div>
                          <p className={`mt-2 text-xs ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                            Lesson {lesson.order || 0}
                          </p>
                        </button>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className={`text-xs font-medium ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                            {lesson.completed
                              ? "Completed"
                              : `${lesson.lessonProgressPercentage || 0}% watched`}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextBookmarks = isSaved
                                ? bookmarks.filter((item) => getLessonKey(item) !== lessonKey)
                                : [...bookmarks, lessonKey];
                              saveBookmarks(nextBookmarks);
                            }}
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                              isSelected
                                ? "border border-white/20 bg-white/10 text-white"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {isSaved ? "Saved" : "Save"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </aside>

        <section className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm">
          {selectedLesson ? (
            <>
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Current Lesson</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">{selectedLesson.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Lesson {selectedLesson.order || 0} of {course.totalLessons || lessons.length}
                  </p>
                </div>

                <div className="rounded-full bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600">
                  Progress updates automatically as you spend time in this lesson.
                </div>
              </div>

              <div className="mt-6 space-y-6">
                <div id="student-course-video" className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950">
                  {selectedLesson.videoUrl ? (
                    isDirectVideoUrl(selectedLesson.videoUrl) ? (
                      <TrackedLessonVideo
                        lessonId={selectedLesson._id}
                        className="aspect-video w-full"
                        src={selectedLesson.videoUrl}
                        onProgress={handleVideoProgress}
                      />
                    ) : (
                      <iframe
                        className="aspect-video w-full"
                        src={selectedLesson.videoUrl}
                        title={selectedLesson.title}
                        allowFullScreen
                      />
                    )
                  ) : (
                    <div className="flex aspect-video items-center justify-center px-8 text-center text-white/80">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Lesson Media</p>
                        <p className="mt-4 text-xl font-semibold">Video content will appear here when the instructor adds it.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-[2rem] border border-slate-100 bg-slate-50/70 p-5">
                  <h4 className="text-lg font-semibold text-slate-900">Lesson Overview</h4>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {selectedLesson.content ||
                      "Lesson content will appear here when the instructor adds notes, prompts, or recap guidance for this lesson."}
                  </p>
                </div>

                <div className="rounded-[2rem] border border-slate-100 bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900">Resources</h4>
                      <p className="mt-1 text-sm text-slate-500">Downloads and supporting material for this lesson.</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {selectedLesson.pdfUrl ? (
                      <a
                        href={selectedLesson.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-sky-200 hover:bg-sky-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Lesson PDF</p>
                            <p className="mt-1 text-sm text-slate-500">Open or download the lesson resource.</p>
                          </div>
                        </div>
                      </a>
                    ) : null}

                    {selectedLesson.videoUrl ? (
                      <button
                        type="button"
                        onClick={() => {
                          const videoSection = document.getElementById("student-course-video");
                          videoSection?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-sky-200 hover:bg-sky-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm">
                            <PlayCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Replay Lesson Video</p>
                            <p className="mt-1 text-sm text-slate-500">Jump back to the main player instantly.</p>
                          </div>
                        </div>
                      </button>
                    ) : null}

                    {!selectedLesson.pdfUrl && !selectedLesson.videoUrl ? (
                      <p className="rounded-3xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500 md:col-span-2">
                        No additional lesson resources have been attached yet.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  disabled={!previousLesson}
                  onClick={() =>
                    previousLesson && setSelectedLessonId(getLessonKey(previousLesson._id))
                  }
                  className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Previous Lesson
                </button>

                <button
                  type="button"
                  disabled={!nextLesson}
                  onClick={() =>
                    nextLesson && setSelectedLessonId(getLessonKey(nextLesson._id))
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <PlayCircle className="h-4 w-4" />
                  Next Lesson
                </button>
              </div>
            </>
          ) : (
            <EmptyState title="Pick a lesson" description="Select any lesson from the sidebar to begin learning." />
          )}
        </section>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-sky-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Instructor</h3>
            <div className="mt-4 rounded-3xl bg-slate-50 px-4 py-4">
              <p className="font-semibold text-slate-900">{course.instructor?.name || "Instructor"}</p>
              <p className="mt-2 text-sm text-slate-500">{course.instructor?.email || "Instructor contact unavailable."}</p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-sky-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Progress Tracker</h3>
            <div className="mt-4">
              <CourseProgressBar value={course.progressPercentage} />
            </div>

            <div className="mt-6 grid gap-3">
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Completed Lessons</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">{course.completedLessons || 0}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Saved Lessons</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">{bookmarks.length}</p>
              </div>
              <div className="rounded-3xl bg-emerald-50 px-4 py-4 text-emerald-700">
                <p className="text-xs uppercase tracking-[0.2em]">Certificate Status</p>
                <p className="mt-3 text-sm font-semibold">
                  {Number(course.progressPercentage || 0) >= 100
                    ? "Certificate ready in your workspace."
                    : "Complete every published lesson to unlock your certificate."}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-sky-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Course Assignments</h3>
            <div className="mt-4 space-y-3">
              {(course.assignments || []).length ? (
                course.assignments.map((assignment) => (
                  <article key={assignment._id} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
                    <h4 className="font-semibold text-slate-900">{assignment.title}</h4>
                    <p className="mt-2 text-sm text-slate-500">Due {formatDate(assignment.dueDate)}</p>
                    <span className="mt-3 inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                      {assignment.status}
                    </span>
                  </article>
                ))
              ) : (
                <p className="rounded-3xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
                  This course does not have assignments yet.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
