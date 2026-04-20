"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import Footer from "@/components/landing/Footer";
import { CheckCircle2, Lock, ShieldCheck } from "@/components/common/icons";
import { getCourseById } from "@/services/course.service";
import { initializePayment } from "@/services/payment.service";
import { getStudentCourses } from "@/services/student/student.course.service";
import { getStudentLearningPath } from "@/services/student/student.learning.service";
import useAuthStore from "@/store/auth.store";
import { notify } from "@/store/notification.store";
import { getRedirectPathForRole } from "@/utils/auth";
import { buildLoginPath, getCourseCheckoutPath, getCoursePriceLabel, isStudentUser } from "@/utils/courseEnrollment";

function CheckoutSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="h-[560px] animate-pulse rounded-[2rem] bg-slate-200" />
        <div className="h-[560px] animate-pulse rounded-[2rem] bg-slate-200" />
      </div>
    </div>
  );
}

export default function CourseCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);
  const courseId = params?.courseId || "";
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCheckout = async () => {
      if (!courseId) {
        setError("We could not determine which course you want to enroll in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const courseResponse = await getCourseById(courseId);

        let enrolled = Boolean(courseResponse?.access?.hasFullAccess);

        if (!enrolled && isStudentUser(user)) {
          try {
            const enrollmentResponse = await getStudentCourses();
            enrolled = (enrollmentResponse?.courses || []).some((item) => item._id === courseId);
          } catch (_error) {
            enrolled = Boolean(courseResponse?.access?.hasFullAccess);
          }
        }

        if (isMounted) {
          setCourse(courseResponse);
          setIsEnrolled(enrolled);
          setError("");
        }
      } catch (requestError) {
        if (isMounted) {
          setCourse(null);
          setError(requestError.message || "Failed to load checkout details.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCheckout();

    return () => {
      isMounted = false;
    };
  }, [courseId, user]);

  const priceLabel = getCoursePriceLabel(course?.price);
  const checkoutPath = getCourseCheckoutPath(courseId);
  const isStudent = isStudentUser(user);
  const currentUserId = user?._id || user?.id || "";

  const handleCompleteCheckout = async () => {
    if (!user) {
      router.push(buildLoginPath(checkoutPath));
      return;
    }

    if (!isStudent) {
      router.push(getRedirectPathForRole(user));
      return;
    }

    if (isEnrolled) {
      router.push(getStudentLearningPath(courseId));
      return;
    }

    try {
      setProcessing(true);
      const paymentResponse = await initializePayment({
        userId: currentUserId,
        courseId,
      });
      const checkoutUrl = paymentResponse?.checkout_url;

      if (!checkoutUrl) {
        throw new Error("Payment link unavailable. Please try again.");
      }

      window.location.href = checkoutUrl;
    } catch (requestError) {
      const message = requestError.message || "Unable to initialize payment.";

      if (message.toLowerCase().includes("already enrolled")) {
        setIsEnrolled(true);
        router.push(getStudentLearningPath(courseId));
        return;
      }

      setError(message);
      notify({
        type: "error",
        title: "Checkout unavailable",
        message,
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50/70">
        <div className="flex-1">
          <CheckoutSkeleton />
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50/70">
        <div className="mx-auto flex-1 max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <ErrorMessage title="Checkout unavailable" message={error} actionLabel="Back to courses" onAction={() => router.push("/courses")} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50/70">
        <div className="mx-auto flex-1 max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <EmptyState title="Course not found" description="This course may have been removed or is no longer available." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/70">
      <div className="mx-auto flex-1 max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-500">Chapa Checkout</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">Confirm your enrollment for {course.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              This checkout keeps the existing course flow intact while sending your payment through Chapa test mode before enrollment is completed.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Instructor</p>
                <p className="mt-3 font-semibold text-slate-900">{course.instructor?.name || "Instructor"}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Course Price</p>
                <p className="mt-3 font-semibold text-slate-900">{priceLabel}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Students</p>
                <p className="mt-3 font-semibold text-slate-900">{course.studentsEnrolled || 0}</p>
              </div>
            </div>

            <div className="mt-8 rounded-[1.75rem] border border-amber-100 bg-amber-50 p-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-5 w-5 text-amber-700" />
                <div>
                  <h2 className="text-lg font-semibold text-amber-950">Secure payment details</h2>
                  <p className="mt-2 text-sm leading-6 text-amber-900/80">
                    Clicking the payment action initializes a Chapa transaction, and enrollment is completed only after the backend verifies the transaction result.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">What unlocks after payment</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <p className="text-sm text-slate-700">Full lesson access beyond preview content</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <p className="text-sm text-slate-700">Progress tracking inside the student workspace</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <p className="text-sm text-slate-700">Direct continuation into your learning path after confirmation</p>
                  </div>
                </div>
              </div>

              {error ? (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}
            </div>
          </section>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white">
              <p className="text-xs uppercase tracking-[0.28em] text-amber-300">Order Summary</p>
              <p className="mt-4 text-2xl font-semibold">{course.title}</p>
              <p className="mt-3 text-sm leading-6 text-white/70">{course.description}</p>

              <div className="mt-6 rounded-3xl bg-white/10 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-white/70">Enrollment total</span>
                  <span className="text-xl font-semibold">{priceLabel}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {!user ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Login with a student account first, then return here to finish checkout.
                </div>
              ) : !isStudent ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Your current account is a <span className="font-semibold text-slate-900">{user.role}</span>. Only student accounts can complete course enrollment.
                </div>
              ) : isEnrolled ? (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  You are already enrolled in this course. Continue directly to your learning workspace whenever you are ready.
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Payment provider: <span className="font-semibold text-slate-900">Chapa Test Mode</span>
                  <br />
                  Account: <span className="font-semibold text-slate-900">{user.name || user.email || "Student account"}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleCompleteCheckout}
                disabled={processing}
                className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {!user
                  ? "Login To Continue"
                  : !isStudent
                    ? "Open Your Dashboard"
                    : isEnrolled
                      ? "Continue Learning"
                      : processing
                        ? "Redirecting To Chapa..."
                        : course.price > 0
                          ? "Pay and Enroll"
                          : "Complete Free Enrollment"}
              </button>

              <Link
                href={`/courses/${courseId}`}
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back To Course
              </Link>

              <div className="rounded-3xl border border-slate-100 bg-slate-50 px-4 py-4">
                <div className="flex items-start gap-3">
                  <Lock className="mt-0.5 h-4 w-4 text-slate-500" />
                  <p className="text-sm text-slate-600">
                    Your payment is verified on the backend before the learner is enrolled and sent into the learning workspace.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
