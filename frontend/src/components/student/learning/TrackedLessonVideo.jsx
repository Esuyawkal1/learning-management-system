"use client";

import { useEffect, useRef } from "react";

const MIN_PROGRESS_SYNC_SECONDS = 3;

const normalizeDurationSeconds = (durationSeconds) => {
  const parsedDuration = Number(durationSeconds);

  if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
    return 0;
  }

  return Math.max(1, Math.round(parsedDuration));
};

export default function TrackedLessonVideo({
  lessonId,
  src,
  className = "",
  onProgress,
  onError,
}) {
  const pendingSecondsRef = useRef(0);
  const lastCurrentTimeRef = useRef(0);
  const lastObservedAtRef = useRef(0);
  const durationSecondsRef = useRef(0);
  const hasSyncedDurationRef = useRef(false);
  const isSeekingRef = useRef(false);

  const emitProgress = ({
    completed = false,
    includeDuration = false,
    durationSeconds,
  } = {}) => {
    if (!lessonId || !onProgress) {
      pendingSecondsRef.current = 0;
      return;
    }

    const resolvedDurationSeconds =
      normalizeDurationSeconds(durationSeconds) ||
      durationSecondsRef.current;
    const secondsSpent = Number(pendingSecondsRef.current.toFixed(2));

    if (!secondsSpent && !completed && !(includeDuration && resolvedDurationSeconds > 0)) {
      return;
    }

    pendingSecondsRef.current = 0;

    onProgress({
      lessonId,
      secondsSpent,
      completed,
      durationSeconds: resolvedDurationSeconds || undefined,
    });
  };

  const syncDuration = (videoElement) => {
    const nextDurationSeconds = normalizeDurationSeconds(videoElement?.duration);

    if (!nextDurationSeconds) {
      return;
    }

    durationSecondsRef.current = nextDurationSeconds;

    if (!hasSyncedDurationRef.current) {
      hasSyncedDurationRef.current = true;
      emitProgress({
        includeDuration: true,
        durationSeconds: nextDurationSeconds,
      });
    }
  };

  const trackWatchedSeconds = (videoElement, { allowWhenPaused = false } = {}) => {
    if (!videoElement) {
      return;
    }

    const currentTime = Number(videoElement.currentTime || 0);
    const now = performance.now();
    const previousCurrentTime = Number(lastCurrentTimeRef.current || 0);
    const previousObservedAt = Number(lastObservedAtRef.current || 0);

    lastCurrentTimeRef.current = currentTime;
    lastObservedAtRef.current = now;

    if (
      !previousObservedAt ||
      isSeekingRef.current ||
      document.visibilityState !== "visible" ||
      (!allowWhenPaused && videoElement.paused)
    ) {
      return;
    }

    const watchedSeconds = currentTime - previousCurrentTime;

    if (!Number.isFinite(watchedSeconds) || watchedSeconds <= 0) {
      return;
    }

    const elapsedWallSeconds = Math.max((now - previousObservedAt) / 1000, 0);
    const playbackRate = Math.max(Number(videoElement.playbackRate || 1), 0.25);
    const maxExpectedAdvance = Math.max(2, elapsedWallSeconds * playbackRate + 1.25);

    if (watchedSeconds > maxExpectedAdvance) {
      return;
    }

    pendingSecondsRef.current += watchedSeconds;
  };

  useEffect(() => {
    pendingSecondsRef.current = 0;
    lastCurrentTimeRef.current = 0;
    lastObservedAtRef.current = 0;
    durationSecondsRef.current = 0;
    hasSyncedDurationRef.current = false;
    isSeekingRef.current = false;

    return () => {
      emitProgress();
      pendingSecondsRef.current = 0;
      lastCurrentTimeRef.current = 0;
      lastObservedAtRef.current = 0;
      durationSecondsRef.current = 0;
      hasSyncedDurationRef.current = false;
      isSeekingRef.current = false;
    };
  }, [lessonId, src]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        emitProgress();
      }

      lastObservedAtRef.current = performance.now();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [lessonId, src]);

  return (
    <video
      className={className}
      controls
      src={src}
      onLoadedMetadata={(event) => {
        syncDuration(event.currentTarget);
        lastCurrentTimeRef.current = Number(event.currentTarget.currentTime || 0);
        lastObservedAtRef.current = performance.now();
      }}
      onPlay={(event) => {
        syncDuration(event.currentTarget);
        lastCurrentTimeRef.current = Number(event.currentTarget.currentTime || 0);
        lastObservedAtRef.current = performance.now();
      }}
      onTimeUpdate={(event) => {
        syncDuration(event.currentTarget);
        trackWatchedSeconds(event.currentTarget);

        if (pendingSecondsRef.current >= MIN_PROGRESS_SYNC_SECONDS) {
          emitProgress();
        }
      }}
      onPause={(event) => {
        syncDuration(event.currentTarget);
        trackWatchedSeconds(event.currentTarget, { allowWhenPaused: true });
        emitProgress();
      }}
      onSeeking={() => {
        isSeekingRef.current = true;
      }}
      onSeeked={(event) => {
        isSeekingRef.current = false;
        syncDuration(event.currentTarget);
        lastCurrentTimeRef.current = Number(event.currentTarget.currentTime || 0);
        lastObservedAtRef.current = performance.now();
      }}
      onEnded={(event) => {
        syncDuration(event.currentTarget);
        trackWatchedSeconds(event.currentTarget, { allowWhenPaused: true });
        emitProgress({ completed: true, includeDuration: true });
      }}
      onError={onError}
    />
  );
}
