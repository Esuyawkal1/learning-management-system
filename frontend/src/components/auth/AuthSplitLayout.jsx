"use client";

import Image from "next/image";
import Link from "next/link";
import TechFoldersMark from "@/components/branding/TechFoldersMark";
import { BookOpen, CheckCircle2, ShieldCheck } from "@/components/common/icons";
import Footer from "@/components/landing/Footer";

const showcasePoints = [
  {
    icon: ShieldCheck,
    title: "Secure access",
    description: "One account for previews, enrollment, and your learning workspace.",
  },
  {
    icon: BookOpen,
    title: "Course-ready setup",
    description: "Jump from public catalog browsing into guided lesson access without friction.",
  },
  {
    icon: CheckCircle2,
    title: "Structured onboarding",
    description: "A cleaner sign-in experience with room for email and Google auth flows.",
  },
];

export default function AuthSplitLayout({
  eyebrow,
  title = "Join and unlock the full learning path",
  description =
    "Set up your account to preview lessons, enroll in published courses, and keep your progress synced across sessions.",
  showFormIntroCopy = true,
  accentLabel,
  alternateText,
  alternateHref,
  alternateLabel,
  children,
}) {
  return (
    <div className="bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_26%),radial-gradient(circle_at_right,_rgba(251,191,36,0.12),_transparent_24%),linear-gradient(180deg,_#f8fafc,_#eef2ff)]">
      <div className="min-h-[calc(100vh-84px)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-8xl gap-2 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-slate-950 shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
            <div className="relative h-72 lg:h-full lg:min-h-[720px]">
              <Image
                src="/images/image.png"
                alt="Learner working inside the platform workspace"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.18)_0%,rgba(2,6,23,0.62)_52%,rgba(2,6,23,0.88)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.28),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.18),_transparent_30%)]" />

              <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-white backdrop-blur-md">
                    <TechFoldersMark className="h-9 w-9 shrink-0" />
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300">Tech Folders</p>
                      <p className="text-sm font-medium text-white/80">Professional learning access</p>
                    </div>
                  </div>

                  <div className="hidden rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200 sm:inline-flex">
                    {accentLabel}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="max-w-xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-300">{eyebrow}</p>
                    <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                      {title}
                    </h2>
                    <p className="mt-4 max-w-lg text-sm leading-7 text-white/75 sm:text-base">
                      {description}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {showcasePoints.map((point) => {
                      const Icon = point.icon;

                      return (
                        <div
                          key={point.title}
                          className="rounded-[1.5rem] border border-white/12 bg-white/10 p-4 backdrop-blur-md"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 text-white">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="mt-4 text-sm font-semibold text-white">{point.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-white/70">{point.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white/95 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">{eyebrow}</p>
                {showFormIntroCopy ? (
                  <>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
                  </>
                ) : null}
              </div>

              <div className={showFormIntroCopy ? "mt-8 space-y-6" : "mt-6 space-y-6"}>{children}</div>

              <p className="mt-6 text-center text-sm text-slate-500">
                {alternateText}{" "}
                <Link href={alternateHref} className="font-semibold text-indigo-600 transition hover:text-indigo-700 hover:underline">
                  {alternateLabel}
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
