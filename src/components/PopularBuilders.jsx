"use client";

import React from "react";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Star,
  ShieldCheck,
} from "lucide-react";

const builders = [
  {
    id: 1,
    name: "DLF",
    projects: "40+ Projects",
    description: "Premium residential & commercial developments",
    initial: "DLF",
  },
  {
    id: 2,
    name: "M3M",
    projects: "35+ Projects",
    description: "Luxury residential and commercial spaces",
    initial: "M3M",
  },
  {
    id: 3,
    name: "Sobha",
    projects: "25+ Projects",
    description: "Crafting premium luxury residences",
    initial: "S",
  },
  {
    id: 4,
    name: "Godrej Properties",
    projects: "20+ Projects",
    description: "Trusted homes across Delhi NCR",
    initial: "GP",
  },
  {
    id: 5,
    name: "Emaar",
    projects: "20+ Projects",
    description: "International luxury living experiences",
    initial: "E",
  },
  {
    id: 6,
    name: "Signature Global",
    projects: "30+ Projects",
    description: "Modern homes across New Gurugram",
    initial: "SG",
  },
  {
    id: 7,
    name: "BPTP",
    projects: "25+ Projects",
    description: "Residential and commercial destinations",
    initial: "B",
  },
  {
    id: 8,
    name: "Max Estates",
    projects: "15+ Projects",
    description: "Premium residences in prime locations",
    initial: "ME",
  },
];

export default function PopularBuilders() {
  return (
    <section className="w-full bg-white py-16 sm:py-20 lg:py-12">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">

        {/* ================= HEADER ================= */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            {/* Small Label */}
            <div className="mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#c41920]" />

              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c41920]">
                Trusted Developers
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl lg:text-[42px]">
              Popular{" "}
              <span className="text-[#c41920]">
                Builders
              </span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              Explore properties from some of the most trusted and
              recognised builders across Delhi NCR.
            </p>
          </div>

          {/* View All */}
          <button className="group flex w-fit items-center gap-2 text-sm font-semibold text-[#222] transition hover:text-[#c41920]">
            View All Builders

            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>

        {/* ================= BUILDER GRID ================= */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {builders.map((builder) => (
            <button
              key={builder.id}
              className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 text-left shadow-[0_4px_18px_rgba(0,0,0,0.045)] transition-all duration-300 hover:-translate-y-1.5 hover:border-red-200 hover:shadow-[0_18px_35px_rgba(196,25,32,0.08)]"
            >
              {/* Crimson accent corner */}
              <div className="absolute right-0 top-0 h-16 w-16 overflow-hidden">
                <div className="absolute right-[-25px] top-[-25px] h-16 w-16 rounded-full bg-red-50 transition-all duration-300 group-hover:bg-red-100" />
              </div>

              {/* Logo / Initial */}
              <div className="relative flex items-center justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-red-100 bg-red-50/60 transition-all duration-300 group-hover:border-[#c41920] group-hover:bg-[#c41920]">
                  <span className="text-sm font-black tracking-tight text-[#c41920] transition-colors duration-300 group-hover:text-white">
                    {builder.initial}
                  </span>
                </div>

                {/* Arrow */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-100 bg-white transition-all duration-300 group-hover:border-[#c41920] group-hover:bg-[#c41920]">
                  <ChevronRight className="h-4 w-4 text-gray-400 transition group-hover:text-white" />
                </div>
              </div>

              {/* Builder Name */}
              <h3 className="mt-5 text-base font-bold text-[#171717] transition group-hover:text-[#c41920] sm:text-lg">
                {builder.name}
              </h3>

              {/* Projects */}
              <div className="mt-2 flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-[#c41920] text-[#c41920]" />
                <span className="text-xs font-semibold text-[#c41920]">
                  {builder.projects}
                </span>
              </div>

              {/* Description */}
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
                {builder.description}
              </p>

              {/* Bottom */}
              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 transition-colors group-hover:text-[#c41920]">
                  View Projects
                </span>

                <ArrowRight className="h-3.5 w-3.5 text-[#c41920] transition-transform duration-300 group-hover:translate-x-1.5" />
              </div>
            </button>
          ))}
        </div>

        {/* ================= TRUST BANNER ================= */}
        <div className="relative mt-10 overflow-hidden rounded-2xl bg-[#191919]">

          {/* Decorative circles */}
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-[#c41920]/20" />

          <div className="absolute -right-3 -top-9 h-44 w-44 rounded-full border border-[#c41920]/15" />

          <div className="relative z-10 flex flex-col gap-6 px-6 py-8 sm:px-9 lg:flex-row lg:items-center lg:justify-between lg:px-12">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#c41920]/20 border border-[#c41920]/30 shadow-inner">
                <ShieldCheck className="h-6 w-6 text-[#ff4d4f]" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ff4d4f]">
                  Trusted Developers
                </p>

                <h3 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                  Find your property from trusted builders.
                </h3>

                <p className="mt-1 text-sm text-white/70">
                  Compare projects, locations, prices and amenities
                  before making your decision.
                </p>
              </div>

            </div>

            <button className="group flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#c41920] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#a51319]">
              Explore Builders

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

          </div>
        </div>

      </div>
    </section>
  );
}