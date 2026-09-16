"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calculator,
  Percent,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";

export default function HomeLoanEstimator({
  price = 0,
  purpose = "SALE",
  formattedPrice = "",
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

    // EMI formula: [P * r * (1 + r)^n] / [(1 + r)^n - 1]
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

  // Max slider value for loan amount
  const maxLoanSlider = Math.max(
    propertyPrice > 0 ? propertyPrice : 10000000,
    loanAmount > 10000000 ? loanAmount * 1.2 : 10000000
  );

  // Format large numbers in Lakhs / Crores for labels
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

  // If this is a rental listing, show Rental financial overview
  if (isRent) {
    return (
      <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#180e0f]">Rental Financial Overview</h3>
              <p className="text-[11px] text-gray-400">Monthly rent & security guidance</p>
            </div>
          </div>
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
            Rental
          </span>
        </div>

        <div className="mt-5 space-y-3 text-xs">
          <div className="rounded-xl border border-gray-100 bg-[#fafafa] p-3.5 flex justify-between items-center">
            <span className="text-gray-500">Monthly Rent:</span>
            <span className="font-bold text-[#180e0f]">{formattedPrice || `₹${propertyPrice.toLocaleString("en-IN")}/month`}</span>
          </div>
          <div className="rounded-xl border border-gray-100 bg-[#fafafa] p-3.5 flex justify-between items-center">
            <span className="text-gray-500">Security Deposit:</span>
            <span className="font-bold text-[#180e0f]">
              ₹{Math.round(propertyPrice * 2).toLocaleString("en-IN")} (Approx 2 Mo.)
            </span>
          </div>
          <div className="rounded-xl border border-gray-100 bg-[#fafafa] p-3.5 flex justify-between items-center">
            <span className="text-gray-500">Standard Agreement:</span>
            <span className="font-bold text-[#180e0f]">11 Months Registered</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#180e0f]">Home Loan & EMI Estimator</h3>
            <p className="text-[11px] text-gray-400">Interactive calculation & custom tenure</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsCustomizing((prev) => !prev)}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
            isCustomizing
              ? "bg-[#c41920] text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <SlidersHorizontal className="h-3 w-3" />
          <span>{isCustomizing ? "Compact" : "Customize"}</span>
        </button>
      </div>

      {/* Main EMI Highlight Box */}
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#fafafa] to-slate-50 p-4 border border-gray-100 text-center relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span className="font-medium text-[11px] uppercase tracking-wider text-gray-400">Estimated Monthly EMI</span>
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
            {interestRate}% p.a.
          </span>
        </div>
        <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#c41920] tracking-tight">
          ₹{emi.toLocaleString("en-IN")}
          <span className="text-xs font-normal text-gray-500"> / month</span>
        </p>

        {/* Quick details pill */}
        <div className="mt-2.5 flex items-center justify-center gap-3 text-[11px] text-gray-500 border-t border-gray-200/60 pt-2">
          <span>Loan: <strong className="text-gray-800">{formatCompactInr(loanAmount)}</strong></span>
          <span>•</span>
          <span>Tenure: <strong className="text-gray-800">{tenureYears} Yrs</strong></span>
        </div>
      </div>

      {/* Customization Controls */}
      {isCustomizing && (
        <div className="mt-4 space-y-4 rounded-2xl bg-[#fafafa] p-3.5 sm:p-4 border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#c41920]" />
              Customize Loan Details
            </span>
            {(loanAmount !== defaultLoanAmount || tenureYears !== defaultTenure || interestRate !== defaultRate) && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-[11px] text-[#c41920] font-medium hover:underline cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>

          {/* 1. Loan Amount Input + Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="loan-amount-input" className="text-gray-600 font-medium">Loan Amount (Principal)</label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400 font-semibold">₹</span>
                <input
                  id="loan-amount-input"
                  type="number"
                  min="50000"
                  max="500000000"
                  step="50000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
                  className="w-28 rounded-md border border-gray-200 bg-white px-2 py-1 text-right text-xs font-bold text-gray-800 focus:border-[#c41920] focus:outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min="100000"
              max={maxLoanSlider}
              step="50000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-[#c41920] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>₹1 L</span>
              <span className="font-semibold text-gray-600">{formatCompactInr(loanAmount)}</span>
              <span>{formatCompactInr(maxLoanSlider)}</span>
            </div>

            {/* Preset Loan % of Property */}
            {propertyPrice > 0 && (
              <div className="mt-1 flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-gray-400 font-medium">Quick %:</span>
                {[60, 70, 80, 85, 90].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setLoanAmount(Math.round(propertyPrice * (pct / 100)))}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition ${
                      Math.round(propertyPrice * (pct / 100)) === loanAmount
                        ? "bg-[#c41920] text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
                <span className="ml-auto text-[10px] text-gray-500">
                  Down payment: <strong className="text-gray-700">{formatCompactInr(Math.max(0, propertyPrice - loanAmount))}</strong>
                </span>
              </div>
            )}
          </div>

          {/* 2. Tenure (Duration in Years) */}
          <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="loan-tenure-slider" className="text-gray-600 font-medium">Loan Duration (Tenure)</label>
              <span className="text-xs font-bold text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-200">
                {tenureYears} Years <span className="text-[10px] font-normal text-gray-400">({tenureYears * 12} Mos)</span>
              </span>
            </div>
            <input
              id="loan-tenure-slider"
              type="range"
              min="1"
              max="30"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-[#c41920] cursor-pointer"
            />
            {/* Quick Tenure Selection Buttons */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {[5, 10, 15, 20, 25, 30].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setTenureYears(yr)}
                  className={`flex-1 rounded py-1 text-center text-[10px] font-semibold transition ${
                    tenureYears === yr
                      ? "bg-[#c41920] text-white shadow-xs"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {yr}Y
                </button>
              ))}
            </div>
          </div>

          {/* 3. Interest Rate (% p.a.) */}
          <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="interest-rate-input" className="text-gray-600 font-medium">Interest Rate (% p.a.)</label>
              <div className="flex items-center gap-1">
                <input
                  id="interest-rate-input"
                  type="number"
                  min="5"
                  max="20"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-16 rounded-md border border-gray-200 bg-white px-1.5 py-1 text-right text-xs font-bold text-gray-800 focus:border-[#c41920] focus:outline-none"
                />
                <span className="text-xs text-gray-400 font-semibold">%</span>
              </div>
            </div>
            <input
              type="range"
              min="6.5"
              max="15.0"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-[#c41920] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>6.5%</span>
              <span>Typical bank rate: 8.5% p.a.</span>
              <span>15.0%</span>
            </div>
          </div>
        </div>
      )}

      {/* Breakdown Cards & Final Amount */}
      <div className="mt-4 space-y-2 text-xs">
        <div className="rounded-xl border border-gray-100 bg-[#fafafa] p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-800" />
            <span className="text-gray-500 font-medium">Principal Loan Amount:</span>
          </div>
          <span className="font-bold text-gray-900">₹{loanAmount.toLocaleString("en-IN")}</span>
        </div>

        <div className="rounded-xl border border-gray-100 bg-[#fafafa] p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-[#c41920]" />
            <span className="text-gray-500 font-medium">Total Interest Payable:</span>
          </div>
          <span className="font-bold text-[#c41920]">₹{totalInterest.toLocaleString("en-IN")}</span>
        </div>

        {/* Final Amount Payable */}
        <div className="rounded-xl border-2 border-emerald-500/20 bg-emerald-50/50 p-3.5 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-gray-900 block">Total Final Amount</span>
            <span className="text-[10px] text-gray-500">Principal + Total Interest</span>
          </div>
          <span className="text-base font-extrabold text-emerald-800">
            ₹{totalAmount.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Visual Share Bar */}
        <div className="pt-1">
          <div className="flex justify-between text-[10px] font-semibold mb-1 text-gray-500">
            <span>Principal: {principalRatio}%</span>
            <span>Interest: {interestRatio}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden flex">
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

      {/* CTA Button */}
      <Link
        href="/contact-us"
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 py-2.5 text-center text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
      >
        <Percent className="h-3.5 w-3.5" />
        <span>Check Pre-Approved Loan Offers</span>
      </Link>
    </div>
  );
}
