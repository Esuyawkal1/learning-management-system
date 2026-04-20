"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import useAuthStore from "@/store/auth.store";

export default function CTA() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const primaryHref = !isAuthenticated
    ? "/register"
    : user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "instructor"
        ? "/instructor/dashboard"
        : "/student/dashboard";

  return (
  <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="overflow-hidden rounded-[2rem] border border-teal-200/40 bg-teal-100/25 backdrop-blur-xl px-6 py-12 shadow-lg shadow-teal-100/30 sm:px-8 lg:px-12"
    >
      
      {/* Text block */}
      <div className="max-w-3xl">
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-500"
        >
          Join the momentum
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl"
        >
          Join thousands of learners building real skills with structured video-first courses.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-4 text-base leading-7 text-slate-600"
        >
          Preview what matters, then unlock the full curriculum, progress tracking, and guided learning path with your account.
        </motion.p>

      </div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="mt-8 flex flex-col gap-3 sm:flex-row"
      >
        <Link
          href={primaryHref}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {isAuthenticated ? "Open Workspace" : "Register"}
        </Link>

        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Login
        </Link>
      </motion.div>

    </motion.div>
  </section>
);
  }