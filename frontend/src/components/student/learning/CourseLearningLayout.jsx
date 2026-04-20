"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import LessonHeader from "@/components/student/learning/LessonHeader";
import LessonNavigation from "@/components/student/learning/LessonNavigation";
import LessonPlayer from "@/components/student/learning/LessonPlayer";
import LessonSidebar from "@/components/student/learning/LessonSidebar";
import {
  getCourseLessons,
  saveLessonProgress,
} from "@/services/student/student.learning.service";
import { notify } from "@/store/notification.store";

const getLessonKey = (lessonId) => String(lessonId || "");

const resolveActiveLessonId = (lessons, preferredIds = []) => {
  for (const lessonId of preferredIds) {
    if (!lessonId) {
      continue;
    }

    const lesson = lessons.find((item) => String(item._id) === String(lessonId));

    if (lesson && !lesson.isLocked) {
      return getLessonKey(lesson._id);
    }
  }

  return getLessonKey(
    lessons.find((lesson) => !lesson.isLocked)?._id || lessons[0]?._id || ""
  );
};

function CourseLearningSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-40 animate-pulse rounded-[2rem] bg-slate-200" />
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="h-[760px] animate-pulse rounded-[2rem] bg-slate-200" />
        <div className="space-y-6">
          <div className="h-[620px] animate-pulse rounded-[2rem] bg-slate-200" />
          <div className="h-24 animate-pulse rounded-[2rem] bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function CourseLearningLayout({ courseId, initialLessonId = "" }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedLessonId = searchParams.get("lessonId") || initialLessonId || "";
  const trackedLessonRef = useRef("");
  const syncStateRef = useRef({
    requestInFlight: false,
    queuedPayloads: {},
  });
  const [snapshot, setSnapshot] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const lessons = snapshot?.lessons || [];
  const lessonIdSignature = lessons.map((lesson) => getLessonKey(lesson._id)).join("|");
  const normalizedRequestedLessonId = getLessonKey(requestedLessonId);
  const searchParamsKey = searchParams.toString();

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
        const response = await saveLessonProgress({
          courseId,
          lessonId: resolvedLessonId,
          secondsSpent: normalizedSecondsSpent,
          durationSeconds: normalizedDurationSeconds,
          completed,
        });

        if (trackedLessonRef.current === `${courseId}:${resolvedLessonId}`) {
          setSnapshot(response);
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
    let isMounted = true;

    const loadLearningPage = async () => {
      if (!courseId) {
        if (isMounted) {
          setSnapshot(null);
          setError("We could not determine which course to open.");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const response = await getCourseLessons(courseId);

        if (!isMounted) {
          return;
        }

        setSnapshot(response);
        setSelectedLessonId(
          resolveActiveLessonId(response?.lessons || [], [
            requestedLessonId,
            response?.lastLessonId,
            response?.currentLessonId,
          ])
        );
        setError("");
      } catch (requestError) {
        if (isMounted) {
          setSnapshot(null);
          setError(requestError.message || "Failed to load this course.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadLearningPage();

    return () => {
      isMounted = false;
    };
  }, [courseId, retryKey]);

  useEffect(() => {
    if (!lessons.length || !normalizedRequestedLessonId) {
      return;
    }

    const nextLessonId = resolveActiveLessonId(lessons, [normalizedRequestedLessonId]);

    if (nextLessonId) {
      setSelectedLessonId((current) =>
        getLessonKey(current) === getLessonKey(nextLessonId) ? current : nextLessonId
      );
    }
  }, [lessonIdSignature, normalizedRequestedLessonId]);

  useEffect(() => {
    if (!courseId || !selectedLessonId) {
      return;
    }

    const params = new URLSearchParams(searchParamsKey);

    if (params.get("lessonId") !== String(selectedLessonId)) {
      params.set("lessonId", String(selectedLessonId));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [courseId, pathname, router, searchParamsKey, selectedLessonId]);

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

  const activeLesson =
    lessons.find((lesson) => String(lesson._id) === String(selectedLessonId)) || lessons[0] || null;
  const activeLessonIndex = activeLesson
    ? lessons.findIndex((lesson) => String(lesson._id) === String(activeLesson._id))
    : -1;
  const previousLesson = activeLessonIndex > 0 ? lessons[activeLessonIndex - 1] : null;
  const nextCandidate = activeLessonIndex >= 0 ? lessons[activeLessonIndex + 1] : null;
  const nextLesson = nextCandidate && !nextCandidate.isLocked ? nextCandidate : null;

  const handleSelectLesson = (lesson) => {
    if (!lesson) {
      return;
    }

    setSelectedLessonId(getLessonKey(lesson._id));
  };

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

  if (loading) {
    return <CourseLearningSkeleton />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Learning page unavailable"
        message={error}
        actionLabel="Retry"
        onAction={() => setRetryKey((current) => current + 1)}
      />
    );
  }

  if (!snapshot?.course) {
    return (
      <EmptyState
        title="Course not found"
        description="This learning page is no longer available in your workspace."
      />
    );
  }

  if (!lessons.length) {
    return (
      <EmptyState
        title="No lessons available"
        description="This course does not have any published lessons yet."
        actionLabel="Retry"
        onAction={() => setRetryKey((current) => current + 1)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <LessonHeader
        course={snapshot.course}
        progress={snapshot.progress}
        activeLesson={activeLesson}
        documents={snapshot.course?.documents || []}
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <LessonSidebar
          lessons={lessons}
          activeLessonId={activeLesson?._id || ""}
          onSelectLesson={handleSelectLesson}
        />

        <div className="space-y-6">
          <LessonPlayer lesson={activeLesson} onVideoProgress={handleVideoProgress} />
          <LessonNavigation
            previousLesson={previousLesson}
            nextLesson={nextLesson}
            onPrevious={() =>
              previousLesson && setSelectedLessonId(getLessonKey(previousLesson._id))
            }
            onNext={() =>
              nextLesson && setSelectedLessonId(getLessonKey(nextLesson._id))
            }
          />
        </div>
      </div>
    </div>
  );
}
