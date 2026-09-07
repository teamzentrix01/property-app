
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "BUYER",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [documents, setDocuments] = useState({ aadhaarDocument: null, panDocument: null, addressProofDocument: null });
  const documentsReady = Object.values(documents).every((file) => file && ["application/pdf", "image/jpeg", "image/png"].includes(file.type) && file.size <= 5 * 1024 * 1024);

  // =========================
  // VALIDATION
  // =========================
  function validateForm() {
    const newErrors = {};

    // Name
    const nameRegex = /^[A-Za-z ]{2,50}$/;

    if (!form.name.trim()) {
      newErrors.name = "Please enter your full name.";
    } else if (!nameRegex.test(form.name.trim())) {
      newErrors.name =
        "Name should contain only letters and spaces.";
    }

    // Email
    const emailRegex =
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!form.email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!emailRegex.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Phone
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!form.phone.trim()) {
      newErrors.phone = "Please enter your mobile number.";
    } else if (!phoneRegex.test(form.phone.trim())) {
      newErrors.phone =
        "Please enter a valid 10-digit Indian mobile number.";
    }

    // Password
    if (!form.password) {
      newErrors.password = "Please enter a password.";
    } else if (form.password.length < 12) {
      newErrors.password =
        "Password must be at least 12 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  // =========================
  // INPUT CHANGE
  // =========================
  function handleChange(e) {
    const { name } = e.target;
    let { value } = e.target;
    if (name === "name") value = value.replace(/[^A-Za-z ]/g, "").slice(0, 80);
    if (name === "email") value = value.replace(/\s/g, "");

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove field error while typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  }

  function handleDocumentChange(event, field) {
    const file = event.target.files?.[0] || null;
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (file && !validTypes.includes(file.type)) {
      setErrors((current) => ({ ...current, [field]: "Only PDF, JPG, JPEG and PNG files are allowed." }));
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({ ...current, [field]: "File size must be less than 5 MB." }));
      return;
    }
    setDocuments((current) => ({ ...current, [field]: file }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  // =========================
  // SUBMIT
  // =========================
  async function onSubmit(e) {
    e.preventDefault();

    // Validate form first
    if (!validateForm()) {
      return;
    }
    const documentErrors = {};
    if (!documents.aadhaarDocument) documentErrors.aadhaarDocument = "Please upload your Aadhaar Card.";
    if (!documents.panDocument) documentErrors.panDocument = "Please upload your PAN Card.";
    if (!documents.addressProofDocument) documentErrors.addressProofDocument = "Please upload your Address Proof.";
    if (Object.keys(documentErrors).length) {
      setErrors(documentErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.set(key, value));
      Object.entries(documents).forEach(([key, file]) => payload.set(key, file));
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        body: payload,
      });

      // Read response safely
      const text = await res.text();

      let data = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = {
            error: "Server returned an invalid response.",
          };
        }
      }

      // API error
      if (!res.ok) {
        setErrors({
          form: data.error || "Signup failed. Please try again.",
        });

        setLoading(false);
        return;
      }

      // Successful signup
      setErrors({
        form: data.documentsUploadPending
          ? "Your account has been created. Document upload is temporarily unavailable; please upload the documents from your dashboard once your connection is restored."
          : "Your account has been created successfully. Your documents are under verification. You will be notified once your account is verified.",
      });
      await new Promise((resolve) => setTimeout(resolve, 1200));
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Signup error:", error);

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
        {/* Heading */}
        <h1 className="font-display text-2xl mb-6 font-semibold">
          Create account
        </h1>

        {/* General Error */}
        {errors.form && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
            <p className="text-red-700 text-sm">
              ⚠ {errors.form}
            </p>
          </div>
        )}

        {/* ================= NAME ================= */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">
            Full Name
          </label>

          <input
            type="text"
            name="name"
            autoComplete="name"
            maxLength={80}
            pattern="[A-Za-z ]+"
            title="Use letters and spaces only"
            placeholder="Enter your full name"
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

        {/* ================= EMAIL ================= */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">
            Email
          </label>

          <input
            type="email"
            name="email"
            autoComplete="email"
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

        {/* ================= PHONE ================= */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">
            Mobile Number
          </label>

          <input
            type="tel"
            name="phone"
            inputMode="numeric"
            autoComplete="tel-national"
            pattern="[6-9][0-9]{9}"
            maxLength={10}
            placeholder="Enter 10-digit mobile number"
            value={form.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");

              if (value.length <= 10) {
                setForm((prev) => ({
                  ...prev,
                  phone: value,
                }));

                if (errors.phone) {
                  setErrors((prev) => ({
                    ...prev,
                    phone: "",
                  }));
                }
              }
            }}
            className={`w-full rounded-lg px-3 py-2 border outline-none transition ${
              errors.phone
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-gray-300 focus:border-green-600"
            }`}
          />

          {errors.phone && (
            <p className="text-red-600 text-xs mt-1">
              ⚠ {errors.phone}
            </p>
          )}
        </div>

        {/* ================= PASSWORD ================= */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="At least 12 characters"
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

          {errors.password ? (
            <p className="text-red-600 text-xs mt-1">
              ⚠ {errors.password}
            </p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              Use at least 12 characters.
            </p>
          )}
        </div>

        {/* ================= ROLE ================= */}
        <label className="block text-sm text-gray-600 mb-1">
          I am a
        </label>

        <select
          name="role"
          className="w-full mb-5 rounded-lg px-3 py-2 border border-gray-300 outline-none focus:border-green-600"
          value={form.role}
          onChange={handleChange}
        >
          <option value="BUYER">
            Buyer / Renter
          </option>

          <option value="OWNER">
            Owner
          </option>

          <option value="BROKER">
            Broker / Dealer
          </option>
        </select>

        <section className="mb-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Identity Documents</h2>
          <p className="mt-1 text-xs text-gray-500">Please upload the following documents. PDF, JPG, JPEG and PNG files up to 5 MB.</p>
          <div className="mt-4 space-y-4">
            {[
              ["aadhaarDocument", "Aadhaar Card"],
              ["panDocument", "PAN Card"],
              ["addressProofDocument", "Address Proof"],
            ].map(([field, label]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700">{label} <span className="text-red-600">*</span></label>
                <input type="file" required accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => handleDocumentChange(event, field)} className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white" />
                {documents[field] && !errors[field] && <div className="mt-2 flex items-center justify-between gap-2 text-xs text-green-700"><span>Upload successful ✓ {documents[field].name}</span><div className="flex gap-2"><a href={URL.createObjectURL(documents[field])} target="_blank" rel="noreferrer" className="font-semibold underline">Preview</a><button type="button" onClick={() => setDocuments((current) => ({ ...current, [field]: null }))} className="font-semibold underline">Replace</button></div></div>}
                {errors[field] && <p className="mt-1 text-xs text-red-600">⚠ {errors[field]}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* ================= SUBMIT ================= */}
        <button
          type="submit"
          disabled={loading || !documentsReady}
          className="w-full bg-gray-900 text-white rounded-full py-3 font-medium hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create account"}
        </button>

        {/* ================= LOGIN ================= */}
        <p className="text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-green-700 font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}

