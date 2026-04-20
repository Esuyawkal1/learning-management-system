"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import GoogleContinueSection from "@/components/auth/GoogleContinueSection";
import {
  getCurrentUser,
  loginWithGoogleCredential,
  registerUser,
} from "@/services/auth.service";
import useAuthStore from "@/store/auth.store";
import {
  extractAuthUser,
  getAuthErrorMessage,
  getRedirectPathForRole,
  reportAuthError,
} from "@/utils/auth";

export default function RegisterPageView() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const currentUser = useAuthStore((state) => state.user);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    router.replace(getRedirectPathForRole(currentUser));
  }, [currentUser, router]);

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
    router.replace(getRedirectPathForRole(user));
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

      const response = await registerUser(form);
      await completeAuth(response);
    } catch (err) {
      reportAuthError("Register error:", err);
      setError(getAuthErrorMessage(err, "Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async (credential) => {
    if (!credential || loading || googleLoading) {
      return;
    }

    try {
      setGoogleLoading(true);
      setError("");

      const response = await loginWithGoogleCredential(credential);
      await completeAuth(response);
    } catch (err) {
      reportAuthError("Google registration error:", err);
      setError(
        getAuthErrorMessage(err, "Google sign-in could not be completed.")
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      eyebrow="Create account"
      accentLabel="New learners"
      showFormIntroCopy={false}
      alternateText="Already have an account?"
      alternateHref="/login"
      alternateLabel="Login"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Full Name
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-slate-900 transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            required
          />
        </div>

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
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-slate-900 transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            required
          />
        </div>

        <div className="relative">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Password
          </label>

          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 pr-14 text-slate-900 transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            required
            minLength={6}
          />

          <button
            type="button"
            onClick={() => setShowPassword((state) => !state)}
            className="absolute right-4 top-10 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full rounded-2xl bg-slate-950 py-3 font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <GoogleContinueSection
        onCredential={handleGoogleRegister}
        disabled={loading || googleLoading}
      />
    </AuthSplitLayout>
  );
}
