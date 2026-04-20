"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { notify } from "@/store/notification.store";
import useAuthStore from "@/store/auth.store";
import { submitContactRequest } from "@/services/contact.service";

const supportEmail =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "esuyawkal.fentahun@gmail.com";
const supportPhone =
  process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+251 929 109 575";
const supportHours =
  process.env.NEXT_PUBLIC_SUPPORT_HOURS || "Monday - Friday, 8:00 AM - 6:00 PM";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  phone: "",
  message: "",
};

const contactHighlights = [
  {
    title: "EMAIL SUPPORT",
    value: supportEmail,
    description: "Best for account help, enrollment questions, To be instructor requests, and platform issues.",
  },
  {
    title: "CALL US",
    value: supportPhone,
    description: "Useful when you need a faster back-and-forth during business hours.",
  },
  {
    title: "Response window",
    value: "Usually within 1 business day",
    description: supportHours,
  },
];

const validateContactForm = ({ name, email, subject, message, phone }) => {
  if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
    return "Please complete the name, email, subject, and message fields.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return "Please enter a valid email address.";
  }

  if (subject.trim().length < 4) {
    return "Subject should be at least 4 characters.";
  }

  if (message.trim().length < 20) {
    return "Message should be at least 20 characters so we have enough context.";
  }

  if (phone.trim().length > 30) {
    return "Phone number should be 30 characters or fewer.";
  }

  return "";
};

export default function ContactPageView() {
  const user = useAuthStore((state) => state.user);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm((current) => ({
      ...current,
      name: current.name || user.name || "",
      email: current.email || user.email || "",
    }));
  }, [user]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateContactForm(form);

    if (validationMessage) {
      setErrorMessage(validationMessage);
      notify({
        type: "error",
        title: "Contact form incomplete",
        message: validationMessage,
      });
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await submitContactRequest({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
      });

      setForm((current) => ({
        ...current,
        subject: "",
        phone: "",
        message: "",
      }));

      const confirmation =
        "Your message is on its way. We will reach out using the email you provided.";

      setSuccessMessage(confirmation);
      notify({
        type: "success",
        title: "Message sent",
        message: confirmation,
      });
    } catch (error) {
      setErrorMessage(error.message);
      notify({
        type: "error",
        title: "Unable to send message",
        message: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-500 text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.2),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.18),_transparent_35%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-350 via-slate-450 to-slate-900" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-18 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.32em] text-amber-200 backdrop-blur-sm">
              Contact us
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Reach the team behind your learning experience.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200/85">
              Need help enrolling, managing your account, or planning to Teach Students , send us a message and we will follow up with real support.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Browse courses
              </Link>
              <Link
                href="/#featured"
                className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Explore featured learning
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {contactHighlights.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/12 bg-white/10 p-6 shadow-lg shadow-slate-950/25 backdrop-blur-md"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">
                  {item.title}
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {item.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200/75">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,_#0f172a_0%,_#f8fafc_12%,_#f8fafc_100%)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-20">
          <div className="space-y-6 text-slate-900">
            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-200/60">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">
                What to expect
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                Fast help, clear follow-up, no dead-end inbox.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Use the form for course questions, payment issues, partnerships, or technical support. We route each message to the right person and send a confirmation email right away.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-xl shadow-slate-900/20">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-200">
                Helpful details
              </p>
              <ul className="mt-4 space-y-4 text-sm leading-6 text-slate-200/80">
                <li>Include the course title or account email if your request is tied to a specific issue.</li>
                <li>For urgent login or checkout trouble, add a phone number so we can respond faster.</li>
                <li>After you submit, we send a confirmation email so you know the request was received.</li>
              </ul>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-8 text-slate-900 shadow-2xl shadow-slate-300/60 sm:p-10">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">
                Send a message
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                Tell us how we can help.
              </h2>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Name</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Your full name"
                    maxLength={80}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 transition focus:border-sky-500 focus:bg-white"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="you@example.com"
                    maxLength={120}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 transition focus:border-sky-500 focus:bg-white"
                  />
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-[1fr_0.46fr]">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Subject</span>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(event) => updateField("subject", event.target.value)}
                    placeholder="What do you need help with?"
                    maxLength={120}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 transition focus:border-sky-500 focus:bg-white"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Phone</span>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    placeholder="Optional"
                    maxLength={30}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 transition focus:border-sky-500 focus:bg-white"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Message</span>
                <textarea
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  placeholder="Share enough detail so we can help quickly."
                  rows={7}
                  maxLength={2000}
                  className="mt-2 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 transition focus:border-sky-500 focus:bg-white"
                />
              </label>

              {errorMessage ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </div>
              ) : null}

              {successMessage ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {successMessage}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Messages are sent directly to our support inbox.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {submitting ? "Sending..." : "Send message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
