"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
  FileText,
  X,
  ChevronRight,
  ChevronLeft,
  Home,
  Check,
} from "lucide-react";
import BhoomiMark from "@/components/BhoomiMark";

/* ── Password strength helper (cosmetic only — does NOT change backend rules) ── */
function getPasswordStrength(password) {
  if (!password) return { level: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: "Weak", color: "#ef4444" };
  if (score <= 3) return { level: 2, label: "Medium", color: "#6b7280" };
  return { level: 3, label: "Strong", color: "#15803d" };
}

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
  const [success, setSuccess] = useState("");
  const submitting = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
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

  function continueToDocuments() {
    if (validateForm()) {
      setErrors({});
      setStep(2);
    }
  }

  // =========================
  // SUBMIT
  // =========================
  async function onSubmit(e) {
    e.preventDefault();

    if (step === 1) {
      continueToDocuments();
      return;
    }

    // State updates are asynchronous; this blocks rapid double submissions.
    if (submitting.current) return;

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

    submitting.current = true;
    setLoading(true);
    setErrors({});
    setSuccess("");

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

        return;
      }

      // A 201 response is the only success path. New users sign in through the
      // normal login page; signup no longer creates an implicit session.
      setSuccess(data.message || "Account created successfully. Redirecting to login…");
      await new Promise((resolve) => setTimeout(resolve, 700));
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Signup error:", error);

      setErrors({
        form: "Something went wrong. Please try again.",
      });

    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  const pwStrength = getPasswordStrength(form.password);

  const ROLES = [
    { value: "BUYER", label: "Buyer", icon: Home },
    { value: "OWNER", label: "Owner / Seller", icon: User },
  ];

  const DOCUMENT_FIELDS = [
    ["aadhaarDocument", "Aadhaar Card"],
    ["panDocument", "PAN Card"],
    ["addressProofDocument", "Address Proof"],
  ];

  return (
    <main className="login-page-shell">
      {/* ── LEFT: Hero Visual ── */}
      <div className="login-hero-panel" aria-hidden="true">
        <img
          src="/signup-hero.jpg"
          alt=""
          className="login-hero-img"
          draggable={false}
        />
        <div className="login-hero-overlay" />

        <div className="login-hero-content">
          <BhoomiMark light />
          <h2 className="login-hero-heading font-display">
            Start Your Property Journey
          </h2>
          <p className="login-hero-sub">
            Create your Bhoomi account to save properties, shortlist your
            favourites, post listings, and manage your property journey from one
            place.
          </p>

          {/* Benefits list */}
          <ul className="signup-hero-benefits">
            <li className="signup-hero-benefit">
              <Check size={16} className="signup-hero-benefit-icon" />
              <span>Save &amp; Shortlist Properties</span>
            </li>
            <li className="signup-hero-benefit">
              <Check size={16} className="signup-hero-benefit-icon" />
              <span>Post Your Property</span>
            </li>
            <li className="signup-hero-benefit">
              <Check size={16} className="signup-hero-benefit-icon" />
              <span>Manage Everything From Your Profile</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ── RIGHT: Registration Card ── */}
      <div className="login-form-panel signup-form-panel">
        <div className="login-card signup-card">
          {/* Brand (mobile only) */}
          <div className="login-card-brand">
            <BhoomiMark />
          </div>

          <div className="login-card-header">
            <h1 className="login-card-title font-display">Create Your Account</h1>
            <p className="login-card-subtitle">
              Join Bhoomi and find the right property for you.
            </p>
          </div>

          {/* ── Stepper ── */}
          <div className="signup-stepper">
            <div className={`signup-step ${step >= 1 ? "signup-step--active" : ""}`}>
              <span className={`signup-step-num ${step > 1 ? "signup-step-num--done" : ""}`}>
                {step > 1 ? <Check size={14} /> : "1"}
              </span>
              <span className="signup-step-label">Account Details</span>
            </div>
            <div className="signup-step-connector">
              <div className={`signup-step-connector-fill ${step >= 2 ? "signup-step-connector-fill--active" : ""}`} />
            </div>
            <div className={`signup-step ${step >= 2 ? "signup-step--active" : ""}`}>
              <span className="signup-step-num">2</span>
              <span className="signup-step-label">Documents</span>
            </div>
          </div>

          {/* ── Form-level banners ── */}
          {errors.form && (
            <div className="login-error-banner" role="alert">
              <AlertCircle className="login-error-icon" />
              <p className="login-error-text">{errors.form}</p>
            </div>
          )}

          {success && (
            <div className="signup-success-banner" role="status">
              <CheckCircle2 className="signup-success-icon" />
              <p className="signup-success-text">{success}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="login-form" noValidate>

            {/* ═══════════════════════ STEP 1 ═══════════════════════ */}
            {step === 1 && (
              <div className="signup-step-content">
                {/* Full Name */}
                <div className="login-field-group">
                  <label htmlFor="signup-name" className="login-label">
                    Full Name
                  </label>
                  <div className="login-input-wrap">
                    <User className="login-input-icon" aria-hidden="true" />
                    <input
                      id="signup-name"
                      type="text"
                      name="name"
                      autoComplete="name"
                      maxLength={80}
                      pattern="[A-Za-z ]+"
                      title="Use letters and spaces only"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleChange}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "signup-name-err" : undefined}
                      className={`login-input ${errors.name ? "login-input--error" : ""}`}
                    />
                  </div>
                  {errors.name && (
                    <p id="signup-name-err" className="login-field-error" role="alert">
                      <AlertCircle size={14} /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="login-field-group">
                  <label htmlFor="signup-email" className="login-label">
                    Email Address
                  </label>
                  <div className="login-input-wrap">
                    <Mail className="login-input-icon" aria-hidden="true" />
                    <input
                      id="signup-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "signup-email-err" : undefined}
                      className={`login-input ${errors.email ? "login-input--error" : ""}`}
                    />
                  </div>
                  {errors.email && (
                    <p id="signup-email-err" className="login-field-error" role="alert">
                      <AlertCircle size={14} /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="login-field-group">
                  <label htmlFor="signup-phone" className="login-label">
                    Mobile Number
                  </label>
                  <div className="login-input-wrap">
                    <Phone className="login-input-icon" aria-hidden="true" />
                    <input
                      id="signup-phone"
                      type="tel"
                      name="phone"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      pattern="[6-9][0-9]{9}"
                      maxLength={10}
                      placeholder="10-digit mobile number"
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
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "signup-phone-err" : undefined}
                      className={`login-input ${errors.phone ? "login-input--error" : ""}`}
                    />
                  </div>
                  {errors.phone && (
                    <p id="signup-phone-err" className="login-field-error" role="alert">
                      <AlertCircle size={14} /> {errors.phone}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="login-field-group">
                  <label htmlFor="signup-password" className="login-label">
                    Password
                  </label>
                  <div className="login-input-wrap">
                    <Lock className="login-input-icon" aria-hidden="true" />
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="new-password"
                      placeholder="At least 12 characters"
                      value={form.password}
                      onChange={handleChange}
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "signup-pass-err" : "signup-pass-hint"}
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

                  {errors.password ? (
                    <p id="signup-pass-err" className="login-field-error" role="alert">
                      <AlertCircle size={14} /> {errors.password}
                    </p>
                  ) : (
                    <div id="signup-pass-hint" className="signup-password-hints">
                      {/* Strength bar */}
                      {form.password && (
                        <div className="signup-pw-strength">
                          <div className="signup-pw-strength-track">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="signup-pw-strength-seg"
                                style={{
                                  background: pwStrength.level >= i ? pwStrength.color : "#e5e7eb",
                                }}
                              />
                            ))}
                          </div>
                          <span
                            className="signup-pw-strength-label"
                            style={{ color: pwStrength.color }}
                          >
                            {pwStrength.label}
                          </span>
                        </div>
                      )}
                      <ul className="signup-pw-rules">
                        <li className={form.password.length >= 12 ? "signup-pw-rule--pass" : ""}>
                          At least 12 characters
                        </li>
                        <li className={/[A-Z]/.test(form.password) ? "signup-pw-rule--pass" : ""}>
                          One uppercase letter
                        </li>
                        <li className={/[0-9]/.test(form.password) ? "signup-pw-rule--pass" : ""}>
                          One number
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Next button */}
                <button
                  type="button"
                  onClick={continueToDocuments}
                  className="login-submit-btn"
                >
                  Next: Documents
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* ═══════════════════════ STEP 2 ═══════════════════════ */}
            {step === 2 && (
              <div className="signup-step-content">
                {/* Role selector cards */}
                <div className="login-field-group">
                  <span className="login-label">I am a</span>
                  <div className="signup-role-grid">
                    {ROLES.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, role: value }));
                        }}
                        className={`signup-role-card ${form.role === value ? "signup-role-card--active" : ""}`}
                        aria-pressed={form.role === value}
                      >
                        <Icon size={20} className="signup-role-card-icon" />
                        <span className="signup-role-card-label">{label}</span>
                        {form.role === value && (
                          <span className="signup-role-card-check">
                            <Check size={12} />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  {/* Hidden select for native form value */}
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <option value="BUYER">Buyer</option>
                    <option value="OWNER">Owner/Seller</option>
                  </select>
                </div>

                {/* Document uploads */}
                <div className="signup-documents-section">
                  <div className="signup-documents-header">
                    <h2 className="signup-documents-title">Identity Documents</h2>
                    <p className="signup-documents-desc">
                      Upload PDF, JPG, JPEG or PNG files up to 5 MB each.
                    </p>
                  </div>

                  <div className="signup-documents-list">
                    {DOCUMENT_FIELDS.map(([field, label]) => (
                      <div key={field} className="signup-doc-item">
                        <label htmlFor={`signup-${field}`} className="signup-doc-label">
                          {label} <span className="signup-doc-required">*</span>
                        </label>

                        {!documents[field] ? (
                          <label
                            htmlFor={`signup-${field}`}
                            className={`signup-doc-dropzone ${errors[field] ? "signup-doc-dropzone--error" : ""}`}
                          >
                            <Upload size={20} className="signup-doc-dropzone-icon" />
                            <span className="signup-doc-dropzone-text">
                              Click to upload {label}
                            </span>
                            <span className="signup-doc-dropzone-hint">
                              PDF, JPG, PNG · Max 5 MB
                            </span>
                            <input
                              id={`signup-${field}`}
                              type="file"
                              required
                              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                              onChange={(event) => handleDocumentChange(event, field)}
                              className="sr-only"
                            />
                          </label>
                        ) : (
                          <div className="signup-doc-uploaded">
                            <div className="signup-doc-uploaded-info">
                              <FileText size={18} className="signup-doc-uploaded-icon" />
                              <span className="signup-doc-uploaded-name">
                                {documents[field].name}
                              </span>
                            </div>
                            <div className="signup-doc-uploaded-actions">
                              <a
                                href={URL.createObjectURL(documents[field])}
                                target="_blank"
                                rel="noreferrer"
                                className="signup-doc-action-link"
                              >
                                Preview
                              </a>
                              <button
                                type="button"
                                onClick={() =>
                                  setDocuments((current) => ({ ...current, [field]: null }))
                                }
                                className="signup-doc-action-remove"
                                aria-label={`Remove ${label}`}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        )}

                        {errors[field] && (
                          <p className="login-field-error" role="alert">
                            <AlertCircle size={14} /> {errors[field]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="signup-actions-row">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="signup-back-btn"
                  >
                    <ChevronLeft size={18} />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !documentsReady}
                    className="login-submit-btn signup-submit-btn"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="login-spinner" />
                        Creating Account…
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Divider + Login CTA */}
          <div className="login-divider">
            <span className="login-divider-line" />
            <span className="login-divider-text">OR</span>
            <span className="login-divider-line" />
          </div>

          <p className="login-register-cta">
            Already have an account?{" "}
            <Link href="/login" className="login-register-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
