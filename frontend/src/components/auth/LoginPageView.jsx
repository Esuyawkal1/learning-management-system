"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import GoogleContinueSection from "@/components/auth/GoogleContinueSection";
import {
  getCurrentUser,
  loginUser,
  loginWithGoogleCredential,
} from "@/services/auth.service";
import useAuthStore from "@/store/auth.store";
import {
  extractAuthUser,
  getAuthErrorMessage,
  reportAuthError,
  resolvePostLoginPath,
} from "@/utils/auth";

export default function LoginPageView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const currentUser = useAuthStore((state) => state.user);
  const nextPath = searchParams.get("next") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    router.replace(resolvePostLoginPath(currentUser, nextPath));
  }, [currentUser, nextPath, router]);

  const completeAuth = async (payload) => {
    let user = extractAuthUser(payload);

    if (!user) {
      const currentRes = await getCurrentUser();
      user = currentRes?.data?.data;
    }

    if (!user) {
      throw new Error("Authenticated user not returned");
    }

    login(user);
    router.replace(resolvePostLoginPath(user, nextPath));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((state) => ({
      ...state,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading || googleLoading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await loginUser(form);
      await completeAuth(response);
    } catch (err) {
      reportAuthError("Login error:", err);
      setError(getAuthErrorMessage(err, "Unable to log in with those details."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credential) => {
    if (!credential || loading || googleLoading) {
      return;
    }

    try {
      setGoogleLoading(true);
      setError("");

      const response = await loginWithGoogleCredential(credential);
      await completeAuth(response);
    } catch (err) {
      reportAuthError("Google login error:", err);
      setError(
        getAuthErrorMessage(err, "Google sign-in could not be completed.")
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      eyebrow="Welcome back"
      title="Sign in to continue learning"
      accentLabel="Returning learners"
      alternateText="Don't have an account?"
      alternateHref="/register"
      alternateLabel="Register"
    >
     <form onSubmit={handleSubmit} className="space-y-5">
  {/* Email */}
  <div>
    <label className="mb-1 block text-sm font-medium text-slate-600">
      Email
    </label>
    <input
      name="email"
      type="email"
      value={form.email}
      onChange={handleChange}
      placeholder="Email"
      className="w-full border-b border-slate-300 bg-transparent px-0 py-3 text-slate-900 transition focus:border-indigo-500 focus:outline-none"
      required
    />
  </div>

  {/* Password */}
  <div className="relative">
    <label className="mb-1 block text-sm font-medium text-slate-600">
      Password
    </label>
    <input
      name="password"
      type={showPassword ? "text" : "password"}
      value={form.password}
      onChange={handleChange}
      placeholder="Password"
      className="w-full border-b border-slate-300 bg-transparent px-0 py-3 pr-14 text-slate-900 transition focus:border-indigo-500 focus:outline-none"
      required
    />

    <button
      type="button"
      onClick={() => setShowPassword((state) => !state)}
      className="absolute right-0 top-10 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
    >
      {showPassword ? "Hide" : "Show"}
    </button>
  </div>

  {/* Forgot Password */}
  <div className="flex justify-end">
    <Link
      href="/forgot-password"
      className="text-sm font-medium text-indigo-600 transition hover:text-indigo-700 hover:underline"
    >
      Forgot password?
    </Link>
  </div>

  {/* Error */}
  {error ? <p className="text-sm text-rose-600">{error}</p> : null}

  {/* Submit Button */}
  <button
    type="submit"
    disabled={loading || googleLoading}
    className="w-full rounded-xl bg-slate-950 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
  >
    {loading ? "Logging in..." : "Login"}
  </button>
</form>

      <GoogleContinueSection
        onCredential={handleGoogleLogin}
        disabled={loading || googleLoading}
      />
    </AuthSplitLayout>
  );
}
