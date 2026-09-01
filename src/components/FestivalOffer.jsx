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
    <section className="w-full bg-white py-14 sm:py-18 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">

        {/* MAIN OFFER BANNER */}
        <div className="relative min-h-[430px] overflow-hidden rounded-2xl bg-[#171717]">

          {/* Background Image */}
          <img
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=90"
            alt="Luxury Property"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/65" />

          {/* Gold Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />

          {/* Decorative Circle */}
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#c49a4a]/30" />

          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-[#c49a4a]/20" />

          {/* CONTENT */}
          <div className="relative z-10 flex min-h-[430px] items-center">

            <div className="max-w-3xl px-6 py-12 sm:px-10 lg:px-14">

              {/* Festival Badge */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c49a4a]/50 bg-[#c49a4a]/10 px-4 py-2 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-[#d5ae62]" />

                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#e0bc72]">
                  Exclusive Festival Offer 2026
                </span>
              </div>

              {/* Heading */}
              <h2 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[50px]">
                Best Festival Offer in{" "}
                <span className="text-[#d3aa5d]">
                  2026
                </span>
              </h2>

              <h3 className="mt-3 text-xl font-semibold text-white/90 sm:text-2xl">
                Limited Period Luxury Deals
              </h3>

              {/* Description */}
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
                Unlock exclusive festive offers on premium apartments,
                luxury residences and high-value properties across Gurugram.
              </p>

              {/* Offer Points */}
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">

                <div className="flex items-center gap-2 text-sm text-white/85">
                  <ShieldCheck className="h-4 w-4 text-[#d3aa5d]" />
                  Verified Properties
                </div>

                <div className="flex items-center gap-2 text-sm text-white/85">
                  <Sparkles className="h-4 w-4 text-[#d3aa5d]" />
                  Exclusive Deals
                </div>

                <div className="flex items-center gap-2 text-sm text-white/85">
                  <Clock3 className="h-4 w-4 text-[#d3aa5d]" />
                  Limited Period
                </div>

              </div>

              {/* BUTTONS */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <button className="group flex items-center justify-center gap-2 rounded-lg bg-[#b58a3a] px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:bg-[#c69d50] hover:shadow-xl">
                  Explore Festival Deals

                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                <button className="flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-black">
                  <PhoneCall className="h-4 w-4" />
                  Get Expert Advice
                </button>

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

                <span className="font-bold text-[#d3aa5d]">
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

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#f5efe4]">
              <Sparkles className="h-5 w-5 text-[#b2873a]" />
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

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#f5efe4]">
              <Clock3 className="h-5 w-5 text-[#b2873a]" />
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

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#f5efe4]">
              <ShieldCheck className="h-5 w-5 text-[#b2873a]" />
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