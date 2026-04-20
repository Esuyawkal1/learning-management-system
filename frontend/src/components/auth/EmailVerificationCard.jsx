"use client";

export default function EmailVerificationCard({
  title = "Verify your email",
  description,
  email,
  code,
  onEmailChange,
  onCodeChange,
  onVerify,
  onResend,
  verifyLabel = "Verify Email",
  verifying = false,
  resending = false,
  disableEmail = false,
  message,
  error,
  children,
}) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
      <div className="space-y-1">
        <p className="text-sm text-slate-600">
          {description || "Enter the six-digit code sent to your inbox."}
        </p>
      </div>

      <form onSubmit={onVerify} className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">
            Verification Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={onCodeChange}
            placeholder="Entere the code"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm tracking-[0.3em] focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
            required
          />
        </div>

        {children}

        {message ? (
          <p className="text-sm text-emerald-600">{message}</p>
        ) : null}

        {error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={verifying}
            className="flex-1 rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-50"
          >
            {verifying ? "Verifying..." : verifyLabel}
          </button>
          <button
            type="button"
            onClick={onResend}
            disabled={resending}
            className="flex-1 rounded-lg border border-indigo-200 bg-white py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend Code"}
          </button>
        </div>
      </form>
    </div>
  );
}
