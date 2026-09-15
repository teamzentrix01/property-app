"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import BhoomiMark from "@/components/BhoomiMark";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <main className="login-page-shell">
        <div className="login-form-panel">
          <div className="login-card" style={{ textAlign: "center" }}>
            <BhoomiMark />
            <h1 className="login-card-title font-display" style={{ marginTop: "1rem" }}>
              Invalid Link
            </h1>
            <p className="login-card-subtitle" style={{ marginTop: "0.5rem" }}>
              This password reset link is missing or invalid.
            </p>
            <Link
              href="/login"
              className="login-submit-btn"
              style={{ display: "inline-flex", marginTop: "1.5rem", textDecoration: "none" }}
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to reset password. Please try again.");
      } else {
        setSuccess(true);
        setTimeout(() => router.replace("/login"), 3000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="login-page-shell">
        <div className="login-form-panel">
          <div className="login-card" style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              <CheckCircle2 size={56} color="#16a34a" strokeWidth={1.5} />
            </div>
            <h1 className="login-card-title font-display">Password Reset!</h1>
            <p className="login-card-subtitle" style={{ marginTop: "0.5rem" }}>
              Your password has been updated successfully. Redirecting to login…
            </p>
            <Link
              href="/login"
              className="login-submit-btn"
              style={{ display: "inline-flex", marginTop: "1.5rem", textDecoration: "none" }}
            >
              Go to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="login-page-shell">
      <div className="login-form-panel">
        <div className="login-card">
          <div className="login-card-brand">
            <BhoomiMark />
          </div>
          <div className="login-card-header">
            <h1 className="login-card-title font-display">Set New Password</h1>
            <p className="login-card-subtitle">Enter a strong new password for your account.</p>
          </div>

          {error && (
            <div className="login-error-banner" role="alert">
              <AlertCircle className="login-error-icon" />
              <p className="login-error-text">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="login-form" noValidate>
            {/* New Password */}
            <div className="login-field-group">
              <label htmlFor="rp-password" className="login-label">
                New Password
              </label>
              <div className="login-input-wrap">
                <Lock className="login-input-icon" aria-hidden="true" />
                <input
                  id="rp-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="login-input login-input--password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="login-eye-btn"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="login-field-group">
              <label htmlFor="rp-confirm" className="login-label">
                Confirm Password
              </label>
              <div className="login-input-wrap">
                <Lock className="login-input-icon" aria-hidden="true" />
                <input
                  id="rp-confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter new password"
                  className="login-input login-input--password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="login-eye-btn"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="login-submit-btn">
              {loading ? (
                <>
                  <Loader2 className="login-spinner" />
                  Resetting…
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <p className="login-register-cta" style={{ marginTop: "1.25rem" }}>
            Remember it?{" "}
            <Link href="/login" className="login-register-link">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="flex-1" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
