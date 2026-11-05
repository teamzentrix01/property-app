"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, SlidersHorizontal, Calculator } from "lucide-react";
import {
  MEASUREMENT_UNITS,
  REGIONAL_BIGHA_FACTORS,
  calculateEstimatedUnitRate,
  normalizeUnitKey,
} from "@/lib/unitConversions";

export default function EstimatedUnitRateSelector({
  price,
  sizeValue,
  sizeUnit = "sqft",
  initialTargetUnit = null,
}) {
  const [selectedUnit, setSelectedUnit] = useState(() => {
    if (initialTargetUnit) return normalizeUnitKey(initialTargetUnit);
    return "sqft";
  });

  const [bighaRegion, setBighaRegion] = useState("UP_STANDARD");
  const [customBighaSqft, setCustomBighaSqft] = useState(27225);
  const [showBighaConfig, setShowBighaConfig] = useState(false);

  // Active bigha sqft factor
  const activeBighaSqft = useMemo(() => {
    if (bighaRegion === "CUSTOM") {
      return Number(customBighaSqft) || 27225;
    }
    const found = REGIONAL_BIGHA_FACTORS.find((f) => f.id === bighaRegion);
    return found?.sqft || 27225;
  }, [bighaRegion, customBighaSqft]);

  const calculation = useMemo(() => {
    return calculateEstimatedUnitRate({
      price,
      sizeValue,
      sizeUnit,
      targetUnit: selectedUnit,
      customBighaSqft: activeBighaSqft,
    });
  }, [price, sizeValue, sizeUnit, selectedUnit, activeBighaSqft]);

  if (!calculation.rate) {
    return null;
  }

  const isBigha = selectedUnit === "bigha" || normalizeUnitKey(sizeUnit) === "bigha";

  return (
    <div className="flex flex-col items-end sm:items-start">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 font-bold uppercase tracking-wider mb-1">
        <span>Estimated Unit Rate</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Unit Rate Badge */}
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-1.5 border border-emerald-200/80 shadow-2xs">
          <span className="font-bold text-sm sm:text-base text-emerald-800 tracking-tight">
            ₹{Math.round(calculation.rate).toLocaleString("en-IN")}
          </span>
          <span className="text-xs font-medium text-emerald-700">
            {calculation.suffix}
          </span>
        </div>

        {/* Dropdown to change measurement unit */}
        <div className="relative inline-block">
          <select
            value={selectedUnit}
            onChange={(e) => {
              setSelectedUnit(e.target.value);
              if (e.target.value === "bigha") {
                setShowBighaConfig(true);
              }
            }}
            aria-label="Select plot measurement unit"
            className="appearance-none cursor-pointer rounded-xl border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-gray-700 shadow-2xs transition hover:border-[#c41920] hover:text-[#c41920] focus:border-[#c41920] focus:outline-none focus:ring-1 focus:ring-[#c41920]"
          >
            {MEASUREMENT_UNITS.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600 font-medium" />
        </div>

        {/* Optional config toggle for Bigha */}
        {isBigha && (
          <button
            type="button"
            onClick={() => setShowBighaConfig(!showBighaConfig)}
            title="Configure regional Bigha conversion"
            className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50/60 px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 transition"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span>Region</span>
          </button>
        )}
      </div>

      {/* Regional Bigha Selector Popover / Drawer */}
      {isBigha && showBighaConfig && (
        <div className="mt-2.5 w-full max-w-sm rounded-2xl border border-emerald-200/90 bg-emerald-50/70 p-3 text-xs shadow-sm">
          <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200/60">
            <span className="font-bold text-emerald-900">Regional Bigha Standard</span>
            <button
              type="button"
              onClick={() => setShowBighaConfig(false)}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-950"
            >
              Done ✓
            </button>
          </div>
          <p className="mt-1 text-[11px] text-gray-600 leading-4">
            Bigha sizes vary across states in India. Select your state or enter manual sq. ft:
          </p>
          <select
            value={bighaRegion}
            onChange={(e) => {
              setBighaRegion(e.target.value);
              const found = REGIONAL_BIGHA_FACTORS.find((f) => f.id === e.target.value);
              if (found && found.sqft) {
                setCustomBighaSqft(found.sqft);
              }
            }}
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-1.5 text-xs font-medium text-gray-800 outline-none focus:border-emerald-600"
          >
            {REGIONAL_BIGHA_FACTORS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>

          {bighaRegion === "CUSTOM" && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] text-gray-600">1 Bigha =</span>
              <input
                type="number"
                min="100"
                value={customBighaSqft}
                onChange={(e) => setCustomBighaSqft(Math.max(1, Number(e.target.value) || 0))}
                className="w-24 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs outline-none focus:border-emerald-600"
                placeholder="sq ft"
              />
              <span className="text-[11px] text-gray-600">sq ft</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

