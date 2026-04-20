"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import useAuthStore from "@/store/auth.store";

const getStartLearningHref = (user, isAuthenticated) => {
  if (!isAuthenticated) {
    return "/login";
  }

  if (user?.role === "admin") {
    return "/admin/dashboard";
  }

  if (user?.role === "instructor") {
    return "/instructor/dashboard";
  }

  return "/student/dashboard";
};

const heroBackgroundImage = "/images/landing-hero-background.jpg";

export default function Hero({ totalCourses = 0 }) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

 return (
    <section className="relative isolate overflow-hidden bg-slate-950">
      
      {/* Background Image */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <Image
          src={heroBackgroundImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-contain object-right opacity-85"
        />
      </motion.div>

      {/* Overlays */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.24),_transparent_30%),radial-gradient(circle_at_right,_rgba(148,163,184,0.16),_transparent_35%)]"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.8 }}
        className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/45"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="absolute inset-0 bg-gradient-to-b from-slate-950/16 via-transparent to-slate-950/72"
      />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-3xl">

          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.32em] text-amber-200 backdrop-blur-sm"
          >
            Learn with real previews
          </motion.span>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
            className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Preview High Impact Tech Courses Before You Commit To The Full Journey.
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="mt-6 max-w-2xl font-semibold text-lg leading-8 text-slate-100/85"
          >
            Explore a modern learning platform built for ambitious learners. Browse live courses, watch preview lessons, and unlock full guided content after sign in.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.7 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href={getStartLearningHref(user, isAuthenticated)}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Start Learning
            </Link>

            <Link
              href="/courses"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/18"
            >
              Browse Courses
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.12
                }
              }
            }}
            className="mt-10 grid gap-4 sm:grid-cols-3"
          >
            {[
              {
                title: `${totalCourses}+`,
                desc: "Courses ready to preview"
              },
              {
                title: "Preview",
                desc: "Short-form lessons before login"
              },
              {
                title: "Enroll",
                desc: "Unlock the full guided path"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                className="rounded-3xl border border-white/15 bg-white/10 p-4 shadow-lg shadow-slate-950/20 backdrop-blur-md"
              >
                <p className="text-2xl font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm text-slate-200/75">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}