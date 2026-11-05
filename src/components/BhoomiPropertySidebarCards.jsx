"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Sparkles,
  PhoneCall,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight,
  Building,
  BadgeCheck,
  Scale,
  Compass,
  MapPin,
  HelpCircle,
  Clock,
} from "lucide-react";

export default function BhoomiPropertySidebarCards({ price, title, city, area }) {
  return (
    <div className="space-y-6">
      {/* ── CARD 1: LOCALITY PRICE TRENDS & INVESTMENT INSIGHTS ── */}
      <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-sm transition hover:shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-[#c41920]">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-sm text-[#180e0f]">
              Locality Price Trends & Growth
            </h3>
          </div>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
            High Growth Zone
          </span>
        </div>

        <div className="mt-4 rounded-2xl bg-gradient-to-br from-red-50/50 via-white to-gray-50/60 p-4 border border-red-100/70">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
              {area || city || "Locality"} Appreciation
            </p>
            <span className="text-xs font-black text-emerald-600 flex items-center gap-0.5">
              ▲ +12.4% / yr
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-700 font-medium leading-relaxed">
            Infrastructure expansion, road widening, and commercial development are driving steady demand in {city || "this region"}.
          </p>
        </div>

        <div className="mt-4 space-y-2 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-gray-50">
            <span className="text-gray-600 font-medium">Rental Yield Potential:</span>
            <span className="font-bold text-gray-900">3.5% – 5.2% p.a.</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-gray-50">
            <span className="text-gray-600 font-medium">Demand Index:</span>
            <span className="font-bold text-emerald-700">Very High</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-600 font-medium">Avg. Holding Horizon:</span>
            <span className="font-bold text-gray-900">3 – 5 Years</span>
          </div>
        </div>
      </div>

      {/* ── CARD 2: BHOOMI VERIFIED TITLE & LEGAL INSPECTION ── */}
      <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <FileCheck className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-sm text-[#180e0f]">
            Legal & Document Check
          </h3>
        </div>

        <div className="mt-3.5 space-y-2.5 text-xs text-gray-700 font-medium">
          <div className="flex items-center justify-between py-1 border-b border-gray-50">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
              <span>Authority Approvals</span>
            </span>
            <span className="font-bold text-teal-800">Verified</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-gray-50">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
              <span>Title & Encumbrance</span>
            </span>
            <span className="font-bold text-teal-800">Clear Title</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-gray-50">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
              <span>Registry Assistance</span>
            </span>
            <span className="font-bold text-teal-800">Provided</span>
          </div>
        </div>

        <p className="mt-3.5 text-[11px] text-gray-600 leading-relaxed font-medium">
          Bhoomi's legal advisory team inspects government records, Khasra numbers, and development permissions for maximum buyer security.
        </p>
      </div>

      {/* ── CARD 3: WHY BUY THROUGH BHOOMI ── */}
      <div className="rounded-3xl border border-red-100 bg-gradient-to-br from-[#fff7f7] via-white to-[#fff0f1] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Award className="h-5 w-5 text-[#c41920]" />
          <h3 className="font-bold text-sm text-[#180e0f]">
            The Bhoomi Advantage
          </h3>
        </div>

        <ul className="space-y-2.5 text-xs text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-[#c41920] font-bold">✓</span>
            <span><strong>100% On-Ground Verified:</strong> No misleading images or prices.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#c41920] font-bold">✓</span>
            <span><strong>Direct Deals:</strong> Connect directly with verified owners & dealers.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#c41920] font-bold">✓</span>
            <span><strong>Dedicated Area Manager:</strong> End-to-end guidance from visit to registry.</span>
          </li>
        </ul>

        <div className="mt-4 pt-3 border-t border-red-100 flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-700">Have questions?</span>
          <Link
            href="/contact-us"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#c41920] hover:underline"
          >
            <span>Contact Support</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
