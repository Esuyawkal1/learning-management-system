export const DEFAULT_LESSON_PROGRESS_TARGET_SECONDS = 120;

export const normalizeLessonDurationSeconds = (durationSeconds) => {
  const parsedDuration = Number(durationSeconds);

  if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
    return 0;
  }

  return Math.max(1, Math.round(parsedDuration));
};

export const normalizeTrackedSeconds = (secondsSpent) => {
  const parsedSeconds = Number(secondsSpent);

  if (!Number.isFinite(parsedSeconds) || parsedSeconds <= 0) {
    return 0;
  }

  return Number(parsedSeconds.toFixed(2));
};

export const resolveLessonProgressTargetSeconds = (lessonProgressEntry) =>
  normalizeLessonDurationSeconds(lessonProgressEntry?.mediaDurationSeconds) ||
  DEFAULT_LESSON_PROGRESS_TARGET_SECONDS;

export const getNextTrackedTimeSpentSeconds = ({
  currentTimeSpent = 0,
  secondsSpent = 0,
  durationSeconds = 0,
}) => {
  const normalizedCurrentTimeSpent = Math.max(
    0,
    Number.isFinite(Number(currentTimeSpent)) ? Number(currentTimeSpent) : 0
  );
  const normalizedSecondsSpent = normalizeTrackedSeconds(secondsSpent);
  const normalizedDurationSeconds = normalizeLessonDurationSeconds(durationSeconds);
  const nextTimeSpentSeconds = normalizedCurrentTimeSpent + normalizedSecondsSpent;

  if (!normalizedDurationSeconds) {
    return Number(nextTimeSpentSeconds.toFixed(2));
  }

  return Number(Math.min(nextTimeSpentSeconds, normalizedDurationSeconds).toFixed(2));
};

export const getLessonProgressRatio = (lessonProgressEntry, legacyProgressEntry) => {
  if (lessonProgressEntry?.completed || legacyProgressEntry?.completed) {
    return 1;
  }

  const targetSeconds = resolveLessonProgressTargetSeconds(lessonProgressEntry);

  if (!targetSeconds) {
    return 0;
  }

  return Math.min(Number(lessonProgressEntry?.timeSpentSeconds || 0) / targetSeconds, 1);
};

export const isLessonProgressCompleted = (lessonProgressEntry, legacyProgressEntry) =>
  Boolean(legacyProgressEntry?.completed) ||
  getLessonProgressRatio(lessonProgressEntry, legacyProgressEntry) >= 1;
