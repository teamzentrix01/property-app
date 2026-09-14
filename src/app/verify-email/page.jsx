"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Mail } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [notice, setNotice] = useState(
    searchParams.get("sent") === "0"
      ? "We could not send the first code. Please request a new one."
      : "We sent a six-digit verification code to your email.",
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function verify(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Verification failed.");
      setNotice(
        data.greetingSent
          ? "Email verified. A welcome message is on its way—redirecting to login."
          : "Email verified successfully—redirecting to login.",
      );
      setTimeout(() => router.replace("/login"), 900);
    } catch (reason) {
      setError(reason.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setResending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/resend-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not resend the code.");
      setNotice(data.message);
      setOtp("");
    } catch (reason) {
      setError(reason.message || "Could not resend the code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="login-page-shell">
      <section className="mx-auto my-10 w-full max-w-md rounded-3xl bg-white p-7 shadow-xl sm:p-9">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#c41920]">
          <Mail size={24} />
        </div>
        <h1 className="font-display text-3xl text-ink">Verify your email</h1>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Enter the six-digit code sent to the email address you used to create your account. The code expires in 10 minutes.
        </p>
        {notice && <p className="mt-5 flex gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-800"><CheckCircle2 className="mt-0.5 shrink-0" size={16} />{notice}</p>}
        {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <form className="mt-6 space-y-4" onSubmit={verify}>
          <label className="login-label">Email address
            <input className="login-input mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          </label>
          <label className="login-label">Verification code
            <input className="login-input mt-2 text-center text-lg tracking-[0.45em]" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} required />
          </label>
          <button className="login-submit-btn w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Verify email"}
          </button>
        </form>
        <button className="mt-5 w-full text-sm font-semibold text-[#c41920] disabled:opacity-60" type="button" onClick={resend} disabled={resending || !email}>
          {resending ? "Sending code…" : "Resend verification code"}
        </button>
        <p className="mt-6 text-center text-sm text-ink-soft">Used another email? <Link href="/signup" className="font-semibold text-[#c41920]">Create an account</Link></p>
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<main className="login-page-shell" />}><VerifyEmailContent /></Suspense>;
}
