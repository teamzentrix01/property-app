"use client";

import React, { useState, useMemo } from "react";
import {
  Calculator,
  Percent,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
  X,
  Send,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function HomeLoanEstimator({
  price = 0,
  purpose = "SALE",
  formattedPrice = "",
  listingId = null,
  propertyTitle = "",
  propertyLocation = "",
  compact = false,
}) {
  const isRent = purpose === "RENT";
  const propertyPrice = Number(price) || 0;

  // Initial defaults
  const defaultLoanAmount = propertyPrice > 0 ? Math.round(propertyPrice * 0.8) : 5000000;
  const defaultTenure = 20; // 20 years
  const defaultRate = 8.5; // 8.5%

  const [loanAmount, setLoanAmount] = useState(defaultLoanAmount);
  const [tenureYears, setTenureYears] = useState(defaultTenure);
  const [interestRate, setInterestRate] = useState(defaultRate);
  const [isCustomizing, setIsCustomizing] = useState(true);

  // Loan Inquiry Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loanForm, setLoanForm] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  // Quick reset
  const handleReset = () => {
    setLoanAmount(defaultLoanAmount);
    setTenureYears(defaultTenure);
    setInterestRate(defaultRate);
  };

  // Calculations
  const { emi, totalInterest, totalAmount, principalRatio, interestRatio } = useMemo(() => {
    const P = Math.max(10000, Number(loanAmount) || 0);
    const annualRate = Math.max(0.1, Number(interestRate) || 8.5);
    const r = annualRate / (12 * 100);
    const n = Math.max(1, (Number(tenureYears) || 1) * 12);

    const numerator = P * r * Math.pow(1 + r, n);
    const denominator = Math.pow(1 + r, n) - 1;
    const monthlyEmi = denominator === 0 ? 0 : Math.round(numerator / denominator);

    const totalPayable = monthlyEmi * n;
    const totalInt = Math.max(0, totalPayable - P);

    const pRatio = totalPayable > 0 ? Math.round((P / totalPayable) * 100) : 100;
    const iRatio = totalPayable > 0 ? 100 - pRatio : 0;

    return {
      emi: monthlyEmi,
      totalInterest: totalInt,
      totalAmount: totalPayable,
      principalRatio: pRatio,
      interestRatio: iRatio,
    };
  }, [loanAmount, tenureYears, interestRate]);

  const maxLoanSlider = Math.max(
    propertyPrice > 0 ? propertyPrice : 10000000,
    loanAmount > 10000000 ? loanAmount * 1.2 : 10000000
  );

  const formatCompactInr = (num) => {
    const val = Number(num) || 0;
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2).replace(/\.00$/, "")} L`;
    }
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    const phoneDigits = String(loanForm.phone || "").replace(/\D/g, "");
    if (phoneDigits.length !== 10 || !/^[6-9]\d{9}$/.test(phoneDigits)) {
      alert("Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "LOAN",
          listingId,
          name: loanForm.name,
          phone: loanForm.phone,
          email: loanForm.email,
          notes: loanForm.notes,
          loanAmount,
          tenureYears,
          interestRate,
          emi,
          propertyTitle,
          propertyLocation,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit loan inquiry");
      }

      setSubmitted(true);
    } catch (err) {
      alert(err.message || "Something went wrong submitting loan inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  // If this is a rental listing, show Rental financial overview
  if (isRent) {
    return (
      <div className={`rounded-2xl border border-gray-200/90 bg-white shadow-sm transition hover:shadow-md ${compact ? "p-4 sm:p-5" : "p-6"}`}>
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Calculator className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-[#180e0f]">Rental Overview</h3>
              <p className="text-[10px] text-gray-400">Monthly rent & security guidance</p>
            </div>
          </div>
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 uppercase">
            Rental
          </span>
        </div>

        <div className="mt-3.5 space-y-2.5">
          <div className="rounded-xl border border-gray-100 bg-[#fafafa] p-3">
            <span className="text-[11px] text-gray-500 block font-medium">Monthly Rent</span>
            <span className="text-xl font-black text-[#180e0f]">{formattedPrice || `₹${propertyPrice.toLocaleString("en-IN")}`}</span>
          </div>
          <div className="rounded-xl border border-gray-100 bg-[#fafafa] p-3 flex justify-between items-center">
            <div>
              <span className="text-[11px] text-gray-500 block font-medium">Security Deposit</span>
              <span className="text-[10px] text-gray-400">Usually 2 months of rent</span>
            </div>
            <span className="text-sm font-bold text-emerald-700">₹{(propertyPrice * 2).toLocaleString("en-IN")}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setModalOpen(true);
          }}
          className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 py-2 text-center text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 cursor-pointer"
        >
          <Percent className="h-3.5 w-3.5" />
          <span>Apply For Rental Assistance</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-gray-200/90 bg-white shadow-sm transition hover:shadow-md ${compact ? "p-4 sm:p-5" : "p-6"}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs sm:text-sm text-[#180e0f]">EMI Calculator</h3>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 text-[9px] font-extrabold text-emerald-800">
                Buyer Tool
              </span>
            </div>
            <p className="text-[10px] text-gray-400">Monthly bank loan repayment</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsCustomizing((prev) => !prev)}
          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
        >
          <SlidersHorizontal className="h-3 w-3" />
          <span>{isCustomizing ? "Collapse" : "Adjust"}</span>
        </button>
      </div>

      {/* Main Monthly EMI Display Card */}
      <div className="mt-3.5 rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50/70 to-white p-3 sm:p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">Estimated Monthly EMI</span>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-emerald-700 cursor-pointer"
            title="Reset to default 80% loan at 8.5% for 20 years"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            <span>Reset</span>
          </button>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-800">
            ₹{emi.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-gray-500 font-medium">/ month</span>
        </div>
        <p className="mt-1 text-[10px] text-emerald-800/80 font-medium">
          For {tenureYears} yrs tenure @ {interestRate}% p.a.
        </p>
      </div>

      {/* Sliders Area */}
      {isCustomizing && (
        <div className="mt-3.5 space-y-3 pt-1 border-t border-gray-100">
          {/* Slider 1: Loan Amount */}
          <div>
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-gray-600 font-medium">Loan Amount:</span>
              <span className="font-bold text-gray-900">
                ₹{loanAmount.toLocaleString("en-IN")}{" "}
                <span className="text-gray-400 font-normal">({formatCompactInr(loanAmount)})</span>
              </span>
            </div>
            <input
              type="range"
              min="100000"
              max={maxLoanSlider}
              step="50000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-emerald-700 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
              <span>₹1 Lakh</span>
              <span>Max: {formatCompactInr(maxLoanSlider)}</span>
            </div>
          </div>

          {/* Slider 2: Tenure */}
          <div>
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-gray-600 font-medium">Tenure:</span>
              <span className="font-bold text-gray-900">{tenureYears} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-emerald-700 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
              <span>1 Year</span>
              <span>15 Yrs</span>
              <span>30 Years</span>
            </div>
          </div>

          {/* Slider 3: Interest Rate */}
          <div>
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-gray-600 font-medium">Interest Rate (% p.a.):</span>
              <div className="flex items-center gap-1 font-bold text-gray-900">
                <input
                  type="number"
                  step="0.1"
                  min="5"
                  max="20"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-12 rounded-md border border-gray-200 px-1 py-0.5 text-right text-xs"
                />
                <span className="text-xs text-gray-500">%</span>
              </div>
            </div>
            <input
              type="range"
              min="6.5"
              max="15.0"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-[#c41920] cursor-pointer h-1.5 bg-gray-200 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
              <span>6.5%</span>
              <span>Typical: 8.5%</span>
              <span>15.0%</span>
            </div>
          </div>
        </div>
      )}

      {/* Breakdown Cards & Final Amount */}
      <div className="mt-3.5 space-y-1.5 text-xs">
        <div className="rounded-lg border border-gray-100 bg-[#fafafa] p-2.5 flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-slate-800" />
            <span className="text-gray-500 text-[11px] font-medium">Principal:</span>
          </div>
          <span className="font-bold text-gray-900 text-xs">₹{loanAmount.toLocaleString("en-IN")}</span>
        </div>

        <div className="rounded-lg border border-gray-100 bg-[#fafafa] p-2.5 flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[#c41920]" />
            <span className="text-gray-500 text-[11px] font-medium">Interest Payable:</span>
          </div>
          <span className="font-bold text-[#c41920] text-xs">₹{totalInterest.toLocaleString("en-IN")}</span>
        </div>

        {/* Final Amount Payable */}
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-50/40 p-2.5 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold text-gray-900 block">Total Amount</span>
            <span className="text-[9px] text-gray-500">Principal + Interest</span>
          </div>
          <span className="text-sm font-extrabold text-emerald-800">
            ₹{totalAmount.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Visual Share Bar */}
        <div className="pt-0.5">
          <div className="flex justify-between text-[9px] font-semibold mb-0.5 text-gray-500">
            <span>Principal: {principalRatio}%</span>
            <span>Interest: {interestRatio}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden flex">
            <div
              style={{ width: `${principalRatio}%` }}
              className="bg-slate-800 transition-all duration-300"
              title={`Principal: ${principalRatio}%`}
            />
            <div
              style={{ width: `${interestRatio}%` }}
              className="bg-[#c41920] transition-all duration-300"
              title={`Interest: ${interestRatio}%`}
            />
          </div>
        </div>
      </div>

      {/* CTA Button — Opens Modal */}
      <button
        type="button"
        onClick={() => {
          setSubmitted(false);
          setModalOpen(true);
        }}
        className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 py-2 text-center text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 cursor-pointer"
      >
        <Percent className="h-3.5 w-3.5" />
        <span>Check Pre-Approved Bank Offers</span>
      </button>

      {/* Loan Inquiry Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-emerald-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {submitted ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                <h3 className="mt-3 text-lg font-bold text-[#180e0f]">
                  Loan Inquiry Submitted!
                </h3>
                <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                  Our loan specialist will call you on <strong>+91 {loanForm.phone}</strong> with tailored pre-approved bank offers.
                </p>
                <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-left text-xs space-y-1">
                  <p className="text-emerald-900 font-semibold">Estimated EMI: ₹{emi.toLocaleString("en-IN")}/mo</p>
                  <p className="text-emerald-800">Loan Amount: ₹{loanAmount.toLocaleString("en-IN")} ({tenureYears} yrs)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="mt-6 w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                    <Percent className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#180e0f]">Pre-Approved Loan Inquiry</h3>
                    <p className="text-[11px] text-gray-500">Compare lowest interest rates from top banks</p>
                  </div>
                </div>

                {/* Summary Pill */}
                <div className="mt-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 p-3 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-gray-500 block text-[10px]">Loan for Property</span>
                    <span className="font-bold text-gray-900 truncate max-w-[200px] block">
                      {propertyTitle || "Property"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-700 block font-semibold">₹{loanAmount.toLocaleString("en-IN")}</span>
                    <span className="text-[10px] text-gray-500">EMI: ₹{emi.toLocaleString("en-IN")}/mo</span>
                  </div>
                </div>

                <form onSubmit={handleLoanSubmit} className="mt-4 space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={loanForm.name}
                      onChange={(e) => setLoanForm({ ...loanForm, name: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Mobile Number *
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-semibold text-gray-500 select-none">
                        +91
                      </span>
                      <input
                        required
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="98765 43210"
                        value={loanForm.phone}
                        onChange={(e) =>
                          setLoanForm({
                            ...loanForm,
                            phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                          })
                        }
                        className="w-full rounded-xl border border-gray-200 pl-11 pr-3.5 py-2.5 text-xs outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={loanForm.email}
                      onChange={(e) => setLoanForm({ ...loanForm, email: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Any specific bank / notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Prefer SBI / HDFC loan, salaried applicant..."
                      value={loanForm.notes}
                      onChange={(e) => setLoanForm({ ...loanForm, notes: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 pt-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Your details are 100% confidential and only shared with verified bank advisors.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting Loan Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Submit Loan Inquiry</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
