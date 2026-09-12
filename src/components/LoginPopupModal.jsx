"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function LoginPopupModal() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ emailOrPhone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const submittingRef = useRef(false);

  useEffect(() => {
    // Do not show popup on login, signup, or admin pages
    if (
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname.startsWith("/admin")
    ) {
      return;
    }

    // Check if user already dismissed the popup in this session
    try {
      if (sessionStorage.getItem("bhoomi_login_popup_dismissed") === "true") {
        return;
      }
    } catch {
      // ignore storage errors
    }

    let isMounted = true;

    // Check if user is already authenticated
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        if (!isMounted) return;
        // If already logged in, do not trigger popup
        if (data?.user) return;

        // Schedule popup after exactly 10 seconds (10,000 ms)
        const timer = setTimeout(() => {
          if (isMounted) {
            // Re-check dismissal before opening
            try {
              if (sessionStorage.getItem("bhoomi_login_popup_dismissed") === "true") {
                return;
              }
            } catch {}
            setIsOpen(true);
          }
        }, 10000);

        return () => clearTimeout(timer);
      })
      .catch(() => {
        // In case of error, still set timer
        const timer = setTimeout(() => {
          if (isMounted) setIsOpen(true);
        }, 10000);
        return () => clearTimeout(timer);
      });

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function handleClose() {
    setIsOpen(false);
    try {
      sessionStorage.setItem("bhoomi_login_popup_dismissed", "true");
    } catch {}
  }

  function validate() {
    const newErrors = {};
    const val = form.emailOrPhone.trim();
    if (!val) {
      newErrors.emailOrPhone = "Enter your email or 10-digit mobile number";
    }
    if (!form.password) {
      newErrors.password = "Enter your password";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!validate()) return;

    submittingRef.current = true;
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          emailOrPhone: form.emailOrPhone.trim(),
          password: form.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors({
          form:
            res.status === 401
              ? "Invalid email/phone or password."
              : data.error || "Login failed. Please try again.",
        });
        return;
      }

      setLoginSuccess(true);
      window.dispatchEvent(new Event("bhoomi-auth-changed"));

      try {
        sessionStorage.setItem("bhoomi_login_popup_dismissed", "true");
      } catch {}

      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 1200);
    } catch {
      setErrors({ form: "Login service temporarily unavailable. Please try again." });
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-popup-title"
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl transition-all duration-300 animate-in zoom-in-95">
        {/* Decorative Top Ribbon */}
        <div className="relative bg-gradient-to-r from-[#8e1016] via-[#c41920] to-[#8e1016] px-6 py-6 text-white text-center">
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close login popup"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white/90 transition hover:bg-black/40 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md text-white font-black shadow-sm">
            ₹
          </div>
          <h2 id="login-popup-title" className="font-display text-2xl font-bold tracking-tight">
            Welcome to Bhoomi
          </h2>
          <p className="mt-1 text-xs text-white/80 leading-relaxed max-w-xs mx-auto">
            Log in to save favorite properties, unlock direct owner contacts & view verified listings.
          </p>
        </div>

        {/* Content Body */}
        <div className="px-6 py-6 sm:px-8">
          {loginSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Login Successful!</h3>
              <p className="text-xs text-gray-500">Welcome back to Bhoomi Real Estate.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {errors.form && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{errors.form}</span>
                </div>
              )}

              {/* Email or Phone Input */}
              <div>
                <label
                  htmlFor="popup-emailOrPhone"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5"
                >
                  Email or Mobile Number
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    id="popup-emailOrPhone"
                    type="text"
                    required
                    placeholder="name@example.com or 10-digit number"
                    value={form.emailOrPhone}
                    onChange={(e) => {
                      setForm({ ...form, emailOrPhone: e.target.value });
                      if (errors.emailOrPhone) setErrors({ ...errors, emailOrPhone: "" });
                    }}
                    className={`w-full rounded-xl border bg-gray-50/70 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:bg-white focus:border-[#c41920] focus:ring-2 focus:ring-[#c41920]/15 ${
                      errors.emailOrPhone ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                </div>
                {errors.emailOrPhone && (
                  <p className="mt-1 text-xs text-red-600">{errors.emailOrPhone}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="popup-password"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-500"
                  >
                    Password
                  </label>
                  <Link
                    href="/login"
                    onClick={handleClose}
                    className="text-[11px] font-semibold text-[#c41920] hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    id="popup-password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                    className={`w-full rounded-xl border bg-gray-50/70 py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition focus:bg-white focus:border-[#c41920] focus:ring-2 focus:ring-[#c41920]/15 ${
                      errors.password ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c41920] to-[#8e1016] py-3 text-sm font-bold text-white shadow-md shadow-[#c41920]/25 transition hover:from-[#8e1016] hover:to-[#c41920] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In to Account</span>
                )}
              </button>
            </form>
          )}

          {/* Footer Register Prompt */}
          <div className="mt-5 border-t border-gray-100 pt-4 text-center">
            <p className="text-xs text-gray-500">
              Don't have an account?{" "}
              <Link
                href="/signup"
                onClick={handleClose}
                className="font-bold text-[#c41920] hover:underline"
              >
                Register for Free
              </Link>
            </p>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>100% Privacy Protected & RERA Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
