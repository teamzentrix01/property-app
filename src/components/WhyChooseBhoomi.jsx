"use client";

import React from "react";
import {
  ShieldCheck,
  Search,
  BadgeCheck,
  Headphones,
  MapPin,
  Building2,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const benefits = [
  {
    icon: Search,
    title: "Verified Properties",
    description:
      "Explore genuine property listings with verified project and property information.",
  },
  {
    icon: BadgeCheck,
    title: "Trusted Developers",
    description:
      "Discover projects from reputed and established builders across Delhi NCR.",
  },
  {
    icon: MapPin,
    title: "Prime Locations",
    description:
      "Find properties in the most sought-after residential and commercial locations.",
  },
  {
    icon: Building2,
    title: "Wide Property Choice",
    description:
      "Apartments, villas, plots, commercial spaces and luxury properties under one roof.",
  },
  {
    icon: Users,
    title: "Expert Assistance",
    description:
      "Get professional guidance to help you find a property that fits your needs.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description:
      "Our team is available to assist you throughout your property search journey.",
  },
];

export default function WhyChoose100Acress() {
  return (
    <section className="w-full bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">

        {/* ================= HEADER ================= */}
        <div className="mx-auto max-w-3xl text-center">

          {/* Label */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-[#b58a3a]" />

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#a17a2d]">
              Your Trusted Property Partner
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl lg:text-[42px]">
            Why Choose{" "}
            <span className="text-[#b2873a]">
              Bhoomi.com
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Everything you need to make a smarter property decision,
            all in one trusted destination.
          </p>
        </div>

        {/* ================= MAIN AREA ================= */}
        <div className="mt-12 grid gap-7 lg:grid-cols-[0.75fr_1.25fr]">

          {/* ================= LEFT CARD ================= */}
          <div className="relative min-h-[470px] overflow-hidden rounded-2xl bg-[#171717] p-7 sm:p-10">

            {/* Decorative circles */}
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#b58a3a]/20" />

            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full border border-[#b58a3a]/10" />

            <div className="relative z-10 flex h-full flex-col justify-between">

              <div>

                {/* Icon */}
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#b58a3a]/15">
                  <ShieldCheck className="h-8 w-8 text-[#d3aa5d]" />
                </div>

                <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-[#d3aa5d]">
                  Property Search Made Easy
                </p>

                <h3 className="mt-3 max-w-md text-3xl font-bold leading-tight text-white sm:text-4xl">
                  Find the right property with confidence.
                </h3>

                <p className="mt-5 max-w-md text-sm leading-7 text-white/55">
                  From discovering the right location to exploring premium
                  projects, get the information you need to make an informed
                  property decision.
                </p>
              </div>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-2 gap-3">

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-2xl font-bold text-[#d3aa5d]">
                    10K+
                  </p>

                  <p className="mt-1 text-xs text-white/45">
                    Property Listings
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-2xl font-bold text-[#d3aa5d]">
                    500+
                  </p>

                  <p className="mt-1 text-xs text-white/45">
                    Projects
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* ================= RIGHT GRID ================= */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {benefits.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className="group rounded-xl border border-gray-100 bg-white p-6 shadow-[0_4px_18px_rgba(0,0,0,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d9c49c] hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)]"
                >

                  {/* Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f7f1e6] transition-all duration-300 group-hover:bg-[#b58a3a]">
                    <Icon className="h-5 w-5 text-[#b2873a] transition-colors group-hover:text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="mt-5 text-lg font-bold text-[#171717] transition-colors group-hover:text-[#a17a2d]">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {item.description}
                  </p>

                  {/* Bottom */}
                  <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4">

                    <CheckCircle2 className="h-4 w-4 text-[#b58a3a]" />

                    <span className="text-[11px] font-semibold text-gray-400">
                      Trusted Experience
                    </span>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= BOTTOM CTA ================= */}
        <div className="relative mt-8 overflow-hidden rounded-2xl border border-[#eadfc9] bg-[#faf7f0]">

          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border border-[#b58a3a]/10" />

          <div className="relative z-10 flex flex-col gap-5 px-6 py-7 sm:px-9 lg:flex-row lg:items-center lg:justify-between lg:px-10">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#b58a3a]">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#171717]">
                  Ready to find your dream property?
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Explore verified properties and premium projects today.
                </p>
              </div>

            </div>

            <button className="group flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#b58a3a] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#c69d50]">
              Explore Properties

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

          </div>
        </div>

      </div>
    </section>
  );
}