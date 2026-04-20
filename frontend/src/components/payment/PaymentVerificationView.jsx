"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ErrorMessage from "@/components/common/ErrorMessage";
import Loader from "@/components/common/Loader";
import { verifyPayment } from "@/services/payment.service";
import { getStudentCourses } from "@/services/student/student.course.service";
import { getStudentLearningPath } from "@/services/student/student.learning.service";
import useAuthStore from "@/store/auth.store";
import { getRedirectPathForRole } from "@/utils/auth";
import { buildLoginPath, isStudentUser } from "@/utils/courseEnrollment";

const getNormalizedId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value?._id || value?.id || "";
};

const normalizeSearchKey = (key) => `${key || ""}`.replace(/^(amp;)+/i, "");

const getNormalizedSearchParam = (searchParams, candidateKeys) => {
  for (const key of candidateKeys) {
    const directValue = searchParams.get(key);

    if (directValue) {
      return directValue;
    }
  }

  for (const [key, value] of searchParams.entries()) {
    if (candidateKeys.includes(normalizeSearchKey(key)) && value) {
      return value;
    }
  }

  return "";
};

export default function PaymentVerificationView({ initialTxRef = "" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);
  const queryTxRef = useMemo(
    () =>
      initialTxRef ||
      getNormalizedSearchParam(searchParams, ["tx_ref", "trx_ref", "txRef"]),
    [initialTxRef, searchParams]
  );
  const fallbackCourseId = useMemo(
    () => getNormalizedSearchParam(searchParams, ["courseId"]),
    [searchParams]
  );
  const [verificationState, setVerificationState] = useState({
    status: "loading",
    courseId: fallbackCourseId,
    error: "",
  });

  useEffect(() => {
    let active = true;

    const resolveEnrollmentFallback = async () => {
      if (!fallbackCourseId) {
        throw new Error("Missing transaction reference. We could not confirm this payment yet.");
      }

      if (!user || !isStudentUser(user)) {
        throw new Error("Missing transaction reference. Please sign in again to continue learning.");
      }

      const enrollmentResponse = await getStudentCourses();
      const enrolledCourse = (enrollmentResponse?.courses || []).find(
        (course) => String(course?._id || "") === String(fallbackCourseId)
      );

      if (!enrolledCourse) {
        throw new Error("We could not confirm this enrollment yet. Please retry in a moment.");
      }

      return fallbackCourseId;
    };

    const confirmPayment = async () => {
      try {
        let resolvedCourseId = fallbackCourseId;

        if (queryTxRef) {
          const response = await verifyPayment(queryTxRef);
          resolvedCourseId =
            getNormalizedId(response?.payment?.courseId) || fallbackCourseId;
        } else {
          if (authLoading) {
            return;
          }

          resolvedCourseId = await resolveEnrollmentFallback();
        }

        if (active) {
          setVerificationState({
            status: "success",
            courseId: resolvedCourseId,
            error: "",
          });
        }
      } catch (error) {
        if (active) {
          setVerificationState({
            status: "error",
            courseId: fallbackCourseId,
            error: error.message || "We could not verify your payment.",
          });
        }
      }
    };

    confirmPayment();

    return () => {
      active = false;
    };
  }, [authLoading, fallbackCourseId, queryTxRef, user]);

  useEffect(() => {
    if (verificationState.status !== "success" || authLoading) {
      return;
    }

    const learningPath = verificationState.courseId
      ? getStudentLearningPath(verificationState.courseId)
      : "/student/courses";

    if (!user) {
      router.replace(buildLoginPath(learningPath));
      return;
    }

    if (!isStudentUser(user)) {
      router.replace(getRedirectPathForRole(user));
      return;
    }

    router.replace(learningPath);
  }, [authLoading, router, user, verificationState.courseId, verificationState.status]);

  if (verificationState.status === "loading" || authLoading) {
    return (
      <Loader
        fullScreen
        label={
          verificationState.status === "loading"
            ? "Confirming your payment and unlocking the course..."
            : "Preparing your learning workspace..."
        }
      />
    );
  }

  if (verificationState.status === "error") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorMessage
          title="Payment verification failed"
          message={verificationState.error}
          actionLabel="Try Again"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  return <Loader fullScreen label="Opening your learning workspace..." />;
}
