"use client";

import React from "react";
import {
  ArrowRight,
  Sparkles,
  Clock3,
  ShieldCheck,
  PhoneCall,
} from "lucide-react";

export default function FestivalOffer() {
  return (
    <section className="w-full bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">

        {/* MAIN OFFER BANNER */}
        <div className="relative min-h-[340px] overflow-hidden rounded-2xl bg-[#052E16] shadow-xl">

          {/* Background Image */}
          <img
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=90"
            alt="Luxury Property"
            className="absolute inset-0 h-full w-full object-cover mix-blend-luminosity opacity-40"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#052E16] via-[#052E16]/80 to-transparent" />

          {/* Decorative Circle */}
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-green-600/30" />

          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-green-600/20" />

          {/* CONTENT */}
          <div className="relative z-10 flex min-h-[340px] items-center">

            <div className="max-w-3xl px-6 py-12 sm:px-10 lg:px-14">

              {/* Festival Badge */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-600/20 px-4 py-2 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-red-300" />

                <span className="text-xs font-bold uppercase tracking-[0.18em] text-red-200">
                  Exclusive Festival Offer 2026
                </span>
              </div>

              {/* Heading */}
              <h2 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[50px]">
                Best Festival Offer in{" "}
                <span className="text-emerald-400">
                  2026
                </span>
              </h2>

              <h3 className="mt-3 text-xl font-semibold text-white/90 sm:text-2xl">
                Limited Period Luxury Deals
              </h3>

              {/* Description */}
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
                Unlock exclusive festive offers on premium apartments,
                luxury residences and high-value properties across India.
              </p>

              {/* BUTTONS */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <a
                  href="/listings"
                  className="group flex items-center justify-center gap-2 rounded-xl bg-red-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-950/30 transition-all duration-200 hover:bg-red-700 hover:shadow-xl"
                >
                  Explore Festival Deals
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </a>

                <a
                  href="tel:+919999999999"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-gray-900"
                >
                  <PhoneCall className="h-4 w-4 text-emerald-400" />
                  Get Expert Advice
                </a>

              </div>
            </div>

          </div>

          {/* RIGHT OFFER CARD */}
          <div className="absolute bottom-8 right-8 hidden w-[280px] rounded-xl border border-white/20 bg-black/45 p-5 backdrop-blur-xl lg:block">

            <p className="text-xs font-medium uppercase tracking-widest text-white/50">
              Festival Benefits
            </p>

            <div className="mt-4 space-y-4">

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm text-white/60">
                  Special Offers
                </span>

                <span className="font-bold text-green-700">
                  Exclusive
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm text-white/60">
                  Premium Projects
                </span>

                <span className="font-bold text-white">
                  100+
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">
                  Availability
                </span>

                <span className="font-bold text-green-400">
                  Limited
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* ================= COUNTDOWN / INFO ================= */}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Card 1 */}
          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-[#fafafa] p-5">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-50">
              <Sparkles className="h-5 w-5 text-green-700" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Special Benefit
              </p>

              <p className="mt-1 text-sm font-bold text-gray-800">
                Festival Exclusive Pricing
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-[#fafafa] p-5">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-50">
              <Clock3 className="h-5 w-5 text-green-700" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Offer Period
              </p>

              <p className="mt-1 text-sm font-bold text-gray-800">
                Limited Period Only
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-[#fafafa] p-5">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-50">
              <ShieldCheck className="h-5 w-5 text-green-700" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Property Status
              </p>

              <p className="mt-1 text-sm font-bold text-gray-800">
                Verified Projects
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}