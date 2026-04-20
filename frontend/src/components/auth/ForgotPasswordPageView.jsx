"use client";

import Link from "next/link";
import { useState } from "react";

import EmailVerificationCard from "@/components/auth/EmailVerificationCard";
import Footer from "@/components/landing/Footer";
import {
  requestPasswordReset,
  resetPassword,
} from "@/services/auth.service";
import { getAuthErrorMessage, reportAuthError } from "@/utils/auth";

export default function ForgotPasswordPageView() {
  const [sendingCode, setSendingCode] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resending, setResending] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    code: "",
    password: "",
    confirmPassword: "",
  });

  const updateField = (name, value) => {
    setForm((state) => ({
      ...state,
      [name]: value,
    }));
  };

  const handleRequestReset = async (event) => {
    event.preventDefault();

    if (!form.email || sendingCode) {
      return;
    }

    try {
      setSendingCode(true);
      setCompleted(false);
      setError("");

      const response = await requestPasswordReset({
        email: form.email,
      });

      setMessage(
        response?.message || "If an account exists, a reset code has been sent."
      );
    } catch (err) {
      reportAuthError("Forgot password error:", err);
      setError(getAuthErrorMessage(err, "Unable to send the reset code."));
    } finally {
      setSendingCode(false);
    }
  };

  const handleResendCode = async () => {
    if (!form.email || resending) {
      if (!form.email) {
        setError("Enter your email first so a reset code can be sent.");
      }
      return;
    }

    try {
      setResending(true);
      setCompleted(false);
      setError("");

      const response = await requestPasswordReset({
        email: form.email,
      });

      setMessage(
        response?.message || "If an account exists, a new reset code has been sent."
      );
    } catch (err) {
      reportAuthError("Resend reset code error:", err);
      setError(getAuthErrorMessage(err, "Unable to resend the reset code."));
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (resetting) {
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setResetting(true);
      setError("");

      const response = await resetPassword({
        email: form.email,
        code: form.code,
        password: form.password,
      });

      setCompleted(true);
      setMessage(
        response?.message || "Password reset successful. You can now log in."
      );
      setForm((state) => ({
        ...state,
        code: "",
        password: "",
        confirmPassword: "",
      }));
    } catch (err) {
      reportAuthError("Reset password error:", err);
      setError(getAuthErrorMessage(err, "Unable to reset this password."));
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-100 via-white to-amber-50">
      <div className="mx-auto flex min-h-[calc(100vh-84px)] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 rounded-[2rem] border border-white/70 bg-white p-8 shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Reset Password</h1>
            <p className="mt-2 text-sm text-gray-500">
              Send a reset code to your email, then enter the code with a new password.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">Send reset code</h2>
              <p className="text-sm text-slate-600">
                We&apos;ll email you a six-digit code for this account.
              </p>
            </div>

            <form onSubmit={handleRequestReset} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="Email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sendingCode || resetting}
                className="w-full rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-50"
              >
                {sendingCode ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          </div>

          {completed ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5 text-center">
              <h2 className="text-lg font-semibold text-emerald-900">
                Password updated
              </h2>
              <p className="mt-2 text-sm text-emerald-700">{message}</p>
              <Link
                href="/login"
                className="mt-4 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Return to login
              </Link>
            </div>
          ) : (
            <EmailVerificationCard
              title="Reset with received code"
              description="Enter the code from your inbox and choose a new password."
              email={form.email}
              code={form.code}
              onEmailChange={(event) => updateField("email", event.target.value)}
              onCodeChange={(event) => updateField("code", event.target.value)}
              onVerify={handleResetPassword}
              onResend={handleResendCode}
              verifyLabel="Reset Password"
              verifying={resetting}
              resending={resending}
              message={message}
              error={error}
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  New Password
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="Enter a new password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) =>
                    updateField("confirmPassword", event.target.value)
                  }
                  placeholder="Re-enter your new password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  required
                  minLength={6}
                />
              </div>
            </EmailVerificationCard>
          )}

          <p className="text-center text-sm text-gray-500">
            Remembered it?{" "}
            <Link href="/login" className="text-indigo-500 hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
