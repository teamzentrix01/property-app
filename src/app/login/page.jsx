
"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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

  // Validation
  function validateForm() {
    const newErrors = {};

    // Name validation
    const nameRegex = /^[A-Za-z ]{2,50}$/;

    if (!form.name.trim()) {
      newErrors.name = "Please enter your name";
    } else if (!nameRegex.test(form.name.trim())) {
      newErrors.name = "Name should contain only letters";
    }

    // Email validation
    const emailRegex =
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!form.email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!emailRegex.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Mobile validation
    const mobileRegex = /^[6-9]\d{9}$/;

    if (!form.mobile.trim()) {
      newErrors.mobile = "Please enter your mobile number";
    } else if (!mobileRegex.test(form.mobile.trim())) {
      newErrors.mobile =
        "Please enter a valid 10-digit Indian mobile number";
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

    // First validate
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, emailOrPhone: form.email.trim() || form.mobile.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({
          form: data.error || "Login failed",
        });
        setLoading(false);
        return;
      }

      const next = searchParams.get("next");
      router.push(next?.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } catch (error) {
      setErrors({
        form: "Something went wrong. Please try again.",
      });
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16 bg-gray-50">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white text-gray-900 rounded-2xl p-8 shadow-lg"
      >
        <h1 className="font-display text-2xl mb-6 font-semibold">
          Log in
        </h1>

        {/* General Error */}
        {errors.form && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
            <p className="text-red-700 text-sm">
              {errors.form}
            </p>
          </div>
        )}

        {/* Name */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">
            Name
          </label>

          <input
            type="text"
            name="name"
            maxLength={80}
            pattern="[A-Za-z ]+"
            title="Use letters and spaces only"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
            className={`w-full rounded-lg px-3 py-2 border outline-none transition ${
              errors.name
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-gray-300 focus:border-green-600"
            }`}
          />

          {errors.name && (
            <p className="text-red-600 text-xs mt-1">
              ⚠ {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">
            Email
          </label>

          <input
            type="email"
            name="email"
            inputMode="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            className={`w-full rounded-lg px-3 py-2 border outline-none transition ${
              errors.email
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-gray-300 focus:border-green-600"
            }`}
          />

          {errors.email && (
            <p className="text-red-600 text-xs mt-1">
              ⚠ {errors.email}
            </p>
          )}
        </div>

        {/* Mobile */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">
            Mobile Number
          </label>

          <input
            type="tel"
            name="mobile"
            inputMode="numeric"
            maxLength={10}
            pattern="[6-9][0-9]{9}"
            placeholder="Enter 10-digit mobile number"
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
            className={`w-full rounded-lg px-3 py-2 border outline-none transition ${
              errors.mobile
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-gray-300 focus:border-green-600"
            }`}
          />

          {errors.mobile && (
            <p className="text-red-600 text-xs mt-1">
              ⚠ {errors.mobile}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="mb-1 block text-sm font-medium">
            Password
          </label>

          <div className="relative">
            <input
              required
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className={`w-full rounded-lg border px-3 py-2 pr-14 outline-none transition ${
                errors.password
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-gray-300 focus:border-green-600"
              }`}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((value) => !value)
              }
              className="absolute inset-y-0 right-3 text-xs font-medium text-green-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {errors.password && (
            <p className="text-red-600 text-xs mt-1">
              ⚠ {errors.password}
            </p>
          )}
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white rounded-full py-3 font-medium hover:bg-green-800 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        {/* Signup */}
        <p className="text-sm text-gray-600 mt-4">
          New here?{" "}
          <Link
            href="/signup"
            className="text-green-700 font-medium hover:underline"
          >
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<main className="flex-1" />}><LoginForm /></Suspense>;
}

