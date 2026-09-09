"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import BhoomiMark from "@/components/BhoomiMark";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const submitting = useRef(false);

  // Validation
  function validateForm() {
    const newErrors = {};

    const emailValue = form.email.trim();
    const mobileValue = form.mobile.replace(/\D/g, "");
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    if (!emailValue && !mobileValue) {
      newErrors.email = "Enter your email or mobile number";
    } else if (emailValue && !emailRegex.test(emailValue) && !mobileValue) {
      newErrors.email = "Please enter a valid email address";
    } else if (mobileValue && !mobileRegex.test(mobileValue) && !emailValue) {
      newErrors.mobile = "Please enter a valid 10-digit Indian mobile number";
    }

    // Password validation
    if (!form.password) {
      newErrors.password = "Please enter your password";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function handleChange(e) {
    const { name } = e.target;
    let { value } = e.target;
    if (name === "name") value = value.replace(/[^A-Za-z ]/g, "").slice(0, 80);
    if (name === "email") value = value.replace(/\s/g, "");

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove error while user is correcting the field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  }

  async function onSubmit(e) {
    e.preventDefault();

    // React state updates are asynchronous; use a ref as the immediate guard
    // so a double click/Enter cannot send two competing login requests.
    if (submitting.current) return;

    // First validate
    if (!validateForm()) {
      return;
    }

    submitting.current = true;
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          emailOrPhone: form.email.trim() || form.mobile.trim(),
          password: form.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors({
          form: res.status === 401 ? "Invalid email or password" : (data.error || "Login failed. Please try again."),
        });
        return;
      }

      window.dispatchEvent(new Event("bhoomi-auth-changed"));
      const next = searchParams.get("next") || searchParams.get("redirect");
      router.replace(next?.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login request failed", error);
      setErrors({
        form: "Login service is temporarily unavailable. Please try again.",
      });
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  return (
    <main className="login-page-shell">
      {/* ── LEFT: Property hero visual (hidden on mobile) ── */}
      <div className="login-hero-panel" aria-hidden="true">
        <img
          src="/login-hero.jpg"
          alt=""
          className="login-hero-img"
          draggable={false}
        />
        <div className="login-hero-overlay" />

        <div className="login-hero-content">
          <BhoomiMark light />
          <h2 className="login-hero-heading font-display">
            Find Your Perfect Property
          </h2>
          <p className="login-hero-sub">
            Discover homes, apartments, plots, and investment opportunities in
            the locations that matter to you.
          </p>
          <div className="login-hero-stats">
            <div className="login-hero-stat">
              <span className="login-hero-stat-num">5,000+</span>
              <span className="login-hero-stat-label">Properties</span>
            </div>
            <div className="login-hero-stat-divider" />
            <div className="login-hero-stat">
              <span className="login-hero-stat-num">200+</span>
              <span className="login-hero-stat-label">Cities</span>
            </div>
            <div className="login-hero-stat-divider" />
            <div className="login-hero-stat">
              <span className="login-hero-stat-num">10k+</span>
              <span className="login-hero-stat-label">Happy Clients</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login card ── */}
      <div className="login-form-panel">
        <div className="login-card">
          {/* Brand mark (mobile only) */}
          <div className="login-card-brand md:hidden">
            <BhoomiMark />
          </div>

          <div className="login-card-header">
            <h1 className="login-card-title font-display">Welcome Back</h1>
            <p className="login-card-subtitle">
              Login to continue exploring properties.
            </p>
          </div>

          {/* ── Form-level error alert ── */}
          {errors.form && (
            <div className="login-error-banner" role="alert">
              <AlertCircle className="login-error-icon" />
              <p className="login-error-text">
                {errors.form}
              </p>
            </div>
          )}

          <form onSubmit={onSubmit} className="login-form" noValidate>
            {/* Email / Phone */}
            <div className="login-field-group">
              <label htmlFor="login-email" className="login-label">
                Email Address
              </label>
              <div className="login-input-wrap">
                <Mail className="login-input-icon" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "login-email-err" : undefined}
                  className={`login-input ${errors.email ? "login-input--error" : ""}`}
                />
              </div>
              {errors.email && (
                <p id="login-email-err" className="login-field-error" role="alert">
                  <AlertCircle size={14} /> {errors.email}
                </p>
              )}
            </div>

            {/* Mobile */}
            <div className="login-field-group">
              <label htmlFor="login-mobile" className="login-label">
                Or Mobile Number
              </label>
              <div className="login-input-wrap">
                <span className="login-input-icon login-input-icon--text" aria-hidden="true">+91</span>
                <input
                  id="login-mobile"
                  type="tel"
                  name="mobile"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  pattern="[6-9][0-9]{9}"
                  placeholder="10-digit mobile number"
                  value={form.mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setForm((prev) => ({
                        ...prev,
                        mobile: value,
                      }));
                      if (errors.mobile) {
                        setErrors((prev) => ({
                          ...prev,
                          mobile: "",
                        }));
                      }
                    }
                  }}
                  aria-invalid={!!errors.mobile}
                  aria-describedby={errors.mobile ? "login-mobile-err" : undefined}
                  className={`login-input ${errors.mobile ? "login-input--error" : ""}`}
                />
              </div>
              {errors.mobile && (
                <p id="login-mobile-err" className="login-field-error" role="alert">
                  <AlertCircle size={14} /> {errors.mobile}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="login-field-group">
              <label htmlFor="login-password" className="login-label">
                Password
              </label>
              <div className="login-input-wrap">
                <Lock className="login-input-icon" aria-hidden="true" />
                <input
                  id="login-password"
                  required
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "login-pass-err" : undefined}
                  className={`login-input login-input--password ${errors.password ? "login-input--error" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="login-eye-btn"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p id="login-pass-err" className="login-field-error" role="alert">
                  <AlertCircle size={14} /> {errors.password}
                </p>
              )}
            </div>

            {/* Remember / Forgot */}
            <div className="login-meta-row">
              <label className="login-remember">
                <input type="checkbox" className="login-checkbox" />
                <span>Remember me</span>
              </label>
              <Link href="#" className="login-forgot">
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="login-spinner" />
                  Logging in…
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span className="login-divider-line" />
            <span className="login-divider-text">OR</span>
            <span className="login-divider-line" />
          </div>

          {/* Register CTA */}
          <p className="login-register-cta">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="login-register-link">
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<main className="flex-1" />}><LoginForm /></Suspense>;
}
