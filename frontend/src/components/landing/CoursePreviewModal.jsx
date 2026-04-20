"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "@/components/common/icons";
import useAuthStore from "@/store/auth.store";
import { getStudentLearningPath } from "@/services/student/student.learning.service";
import CourseThumbnailPreview from "@/components/courses/CourseThumbnailPreview";
import { getRedirectPathForRole } from "@/utils/auth";
import { buildLoginPath, getCourseCheckoutPath, getCoursePriceLabel, isStudentUser } from "@/utils/courseEnrollment";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

const DESKTOP_BREAKPOINT = 1024;
const VIEWPORT_PADDING = 24;
const PANEL_GAP = 18;
const PANEL_WIDTH = 430;
const PANEL_MAX_HEIGHT = 720;

export default function CoursePreviewModal({ course, onClose, isEnrolled = false, anchorElement = null }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isMounted, setIsMounted] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [floatingLayout, setFloatingLayout] = useState(false);
  const [panelStyle, setPanelStyle] = useState(null);
  const [arrowSide, setArrowSide] = useState("left");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!course) {
      return undefined;
    }

    let isMounted = true;

    const loadPreview = async () => {
      try {
        if (isMounted) {
          setPreviewData(null);
          setRequestError("");
        }
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/courses/${course._id}/preview`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load course preview.");
        }

        const payload = await response.json();

        if (isMounted) {
          setPreviewData(payload.data);
          setRequestError("");
        }
      } catch (error) {
        if (isMounted) {
          setRequestError(error.message || "Failed to load course preview.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      isMounted = false;
    };
  }, [course]);

  useEffect(() => {
    if (!course) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [course, onClose]);

  useLayoutEffect(() => {
    if (!course) {
      return undefined;
    }

    const updatePosition = () => {
      const canFloat = Boolean(anchorElement?.isConnected) && window.innerWidth >= DESKTOP_BREAKPOINT;
      setFloatingLayout(canFloat);

      if (!canFloat) {
        setPanelStyle(null);
        setArrowSide("left");
        return;
      }

      const rect = anchorElement.getBoundingClientRect();
      const width = Math.min(PANEL_WIDTH, window.innerWidth - VIEWPORT_PADDING * 2);
      const maxHeight = Math.min(PANEL_MAX_HEIGHT, window.innerHeight - VIEWPORT_PADDING * 2);
      const fitsRight = rect.right + PANEL_GAP + width <= window.innerWidth - VIEWPORT_PADDING;
      const fitsLeft = rect.left - PANEL_GAP - width >= VIEWPORT_PADDING;
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      let left = rect.right + PANEL_GAP;
      let nextArrowSide = "left";

      if (fitsRight) {
        left = rect.right + PANEL_GAP;
        nextArrowSide = "left";
      } else if (fitsLeft) {
        left = rect.left - PANEL_GAP - width;
        nextArrowSide = "right";
      } else {
        left = Math.min(Math.max(rect.left, VIEWPORT_PADDING), window.innerWidth - VIEWPORT_PADDING - width);
        nextArrowSide = "none";
      }

      const top = Math.min(
        Math.max(rect.top, VIEWPORT_PADDING),
        Math.max(VIEWPORT_PADDING, window.innerHeight - VIEWPORT_PADDING - maxHeight),
      );

      setArrowSide(nextArrowSide);
      setPanelStyle({
        top: `${scrollY + top}px`,
        left: `${scrollX + left}px`,
        width: `${width}px`,
        maxHeight: `${maxHeight}px`,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorElement, course]);

  if (!course) {
    return null;
  }

  const activeCourse = previewData || course;
  const thumbnailSrc = activeCourse.thumbnailUrl || activeCourse.thumbnail || "";
  const previewLesson = activeCourse.previewLesson || activeCourse.previewLessons?.[0] || null;
  const previewLessons = activeCourse.previewLessons?.length
    ? activeCourse.previewLessons
    : previewLesson
      ? [previewLesson]
      : [];
  const checkoutPath = getCourseCheckoutPath(course._id);
  const priceLabel = getCoursePriceLabel(activeCourse.price);
  const isStudent = isStudentUser(user);
  const primaryLabel = isEnrolled
    ? "Continue Learning"
    : !isAuthenticated
      ? "Login To Enroll"
      : isStudent
        ? activeCourse.price > 0
          ? `Continue To Pay ${priceLabel}`
          : "Complete Free Enrollment"
        : "Student Account Required";

  const handlePrimaryAction = () => {
    onClose();

    if (isEnrolled) {
      router.push(getStudentLearningPath(course._id));
      return;
    }

    if (!isAuthenticated) {
      router.push(buildLoginPath(checkoutPath));
      return;
    }

    if (!isStudent) {
      router.push(getRedirectPathForRole(user));
      return;
    }

    router.push(checkoutPath);
  };

  const panelClasses = floatingLayout
    ? "pointer-events-auto absolute overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
    : "pointer-events-auto relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-950/30";
  const overlayClasses = floatingLayout
    ? "fixed inset-0 z-[80] bg-slate-950/12 backdrop-blur-[1px]"
    : "fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm";
  const closeButtonClasses = floatingLayout
    ? "inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
    : "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-slate-900/70 text-white transition hover:bg-slate-900";

  if (!isMounted) {
    return null;
  }

  const modalContent = (
    <div className={overlayClasses}>
      <button type="button" onClick={onClose} aria-label="Close course preview" className="absolute inset-0 cursor-default" />

      <div className={panelClasses} style={floatingLayout ? panelStyle || undefined : undefined}>
        {floatingLayout && arrowSide !== "none" ? (
          <span
            aria-hidden="true"
            className={`absolute top-10 h-4 w-4 rotate-45 border border-slate-200 bg-white ${
              arrowSide === "right" ? "-right-2 border-l-0 border-b-0" : "-left-2 border-r-0 border-t-0"
            }`}
          />
        ) : null}

        <div className="relative bg-slate-950">
          <div className="relative aspect-video">
            <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-300">
                  {activeCourse.category || "Featured Course"}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white sm:text-xl">{activeCourse.title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={closeButtonClasses}
                aria-label="Close course preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {loading ? (
              <div className="flex h-full items-center justify-center text-white">
                <div className="flex flex-col items-center gap-3">
                  <span className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
                  <p className="text-sm font-medium text-white/80">Loading preview...</p>
                </div>
              </div>
            ) : previewLesson?.videoUrl ? (
              <video
                className="h-full w-full object-cover"
                src={previewLesson.videoUrl}
                poster={thumbnailSrc || undefined}
                autoPlay
                muted
                playsInline
                controls
              />
            ) : (
              <CourseThumbnailPreview
                src={thumbnailSrc}
                alt={activeCourse.title}
                className="object-cover"
              />
            )}

            {!isAuthenticated ? (
              <div className="absolute inset-x-4 bottom-4 rounded-[1.25rem] border border-white/15 bg-slate-950/78 p-4 text-white shadow-xl backdrop-blur-md">
                <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300">Full access locked</p>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Guests can preview selected lessons. Login to unlock enrollment and the full learning flow.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={buildLoginPath(checkoutPath)} className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                    Login
                  </Link>
                  <Link href="/register" className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15">
                    Register
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="max-h-[min(30rem,calc(100vh-14rem))] overflow-y-auto p-5 sm:p-6">
          <p className="text-sm leading-7 text-slate-600">{activeCourse.description}</p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Instructor</p>
              <p className="mt-2 font-semibold text-slate-900">{activeCourse.instructor?.name || "Expert Instructor"}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{isEnrolled ? "Status" : "Price"}</p>
              <p className="mt-2 font-semibold text-slate-900">{isEnrolled ? "Already enrolled" : priceLabel}</p>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-amber-100 bg-amber-50 px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-amber-700">Enrollment</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-amber-950">
              {isEnrolled
                ? "You already have full access to this course."
                : !isAuthenticated
                  ? "Login with a student account to continue to enrollment."
                  : isStudent
                    ? "Use the Chapa demo checkout to confirm enrollment and unlock the course."
                    : "Only student accounts can enroll in courses."}
            </p>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">Preview Lessons</h3>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {previewLessons.length} available
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {previewLessons.map((lesson, index) => (
                <div key={lesson._id || `${lesson.title}-${index}`} className="rounded-3xl border border-slate-200 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                    Preview lesson {index + 1}
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">{lesson.title}</p>
                </div>
              ))}

              {!loading && !previewLessons.length ? (
                <div className="rounded-3xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  This course does not have a public preview lesson yet.
                </div>
              ) : null}
            </div>
          </div>

          {requestError ? (
            <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {requestError}
            </div>
          ) : null}

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {primaryLabel}
            </button>
            <Link
              href="/courses"
              className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Browse More Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
