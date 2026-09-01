"use client";

import React, { useState } from "react";
import {
  Home,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

const bhkOptions = [
  {
    id: "1 BHK",
    title: "Smart & Comfortable",
    subtitle: "Perfect for modern individuals",
    description:
      "A compact yet comfortable home designed for singles and young professionals who prefer convenience and smart living.",
    idealFor: "Singles & Young Professionals",
    size: "500 - 800 Sq.Ft.",
    features: [
      "Efficient use of space",
      "Lower maintenance",
      "Modern lifestyle",
    ],
  },
  {
    id: "2 BHK",
    title: "Balanced Living",
    subtitle: "Perfect for couples & small families",
    description:
      "The perfect balance of comfort and functionality with enough space for a couple, small family or work-from-home lifestyle.",
    idealFor: "Couples & Small Families",
    size: "800 - 1,200 Sq.Ft.",
    features: [
      "Flexible living space",
      "Work-from-home friendly",
      "Great value for money",
    ],
  },
  {
    id: "3 BHK",
    title: "Room to Grow",
    subtitle: "Perfect for growing families",
    description:
      "Spacious and versatile homes offering privacy, comfort and room for every member of the family.",
    idealFor: "Growing Families",
    size: "1,200 - 1,800 Sq.Ft.",
    features: [
      "Spacious bedrooms",
      "Separate living areas",
      "Family-friendly layout",
    ],
  },
  {
    id: "4 BHK",
    title: "Luxury & Space",
    subtitle: "Perfect for premium family living",
    description:
      "Experience elevated living with expansive interiors, multiple bedrooms and generous spaces designed for premium lifestyles.",
    idealFor: "Large & Premium Families",
    size: "1,800 - 3,000 Sq.Ft.",
    features: [
      "Large bedrooms",
      "Premium interiors",
      "More privacy & space",
    ],
  },
  {
    id: "5+ BHK",
    title: "Ultimate Luxury",
    subtitle: "Perfect for an exclusive lifestyle",
    description:
      "For those who want exceptional space, privacy and luxury with expansive layouts and premium lifestyle amenities.",
    idealFor: "Luxury Home Buyers",
    size: "3,000+ Sq.Ft.",
    features: [
      "Expansive living spaces",
      "Private luxury zones",
      "Premium lifestyle",
    ],
  },
];

export default function BHKLifestyle() {
  const [activeBhk, setActiveBhk] = useState("3 BHK");

  const selected =
    bhkOptions.find((item) => item.id === activeBhk) || bhkOptions[2];

  return (
    <section className="w-full bg-[#f7f6f3] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">

        {/* ================= HEADER ================= */}
        <div className="mx-auto max-w-3xl text-center">

          {/* Label */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-[#b58a3a]" />

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#a17a2d]">
              Find Your Perfect Home
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl lg:text-[42px]">
            Which BHK suits your{" "}
            <span className="text-[#b2873a]">
              lifestyle best?
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Choose your preferred home size and discover the lifestyle,
            space and property type that fits you best.
          </p>
        </div>

        {/* ================= BHK TABS ================= */}
        <div className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-3">

          {bhkOptions.map((bhk) => (
            <button
              key={bhk.id}
              onClick={() => setActiveBhk(bhk.id)}
              className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300 sm:px-7 ${
                activeBhk === bhk.id
                  ? "border-[#b58a3a] bg-[#b58a3a] text-white shadow-md"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#b58a3a] hover:text-[#a17a2d]"
              }`}
            >
              {bhk.id}
            </button>
          ))}
        </div>

        {/* ================= MAIN CONTENT ================= */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-[#e7e2d8] bg-white shadow-[0_8px_35px_rgba(0,0,0,0.06)]">

          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">

            {/* ================= LEFT VISUAL ================= */}
            <div className="relative min-h-[360px] overflow-hidden bg-[#171717] lg:min-h-[470px]">

              {/* Background */}
              <img
                src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=90"
                alt={`${selected.id} luxury home`}
                className="absolute inset-0 h-full w-full object-cover opacity-55 transition-all duration-500"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />

              {/* Decorative */}
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border border-[#d3aa5d]/25" />

              <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-10">

                {/* BHK */}
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-white/20 bg-black/35 backdrop-blur-md">
                  <span className="text-2xl font-black text-[#e0bc72]">
                    {selected.id.replace(" BHK", "")}
                    <span className="text-sm"> BHK</span>
                  </span>
                </div>

                <h3 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
                  {selected.title}
                </h3>

                <p className="mt-2 text-sm font-medium text-[#d3aa5d]">
                  {selected.subtitle}
                </p>

                {/* Size */}
                <div className="mt-6 flex items-center gap-2 text-sm text-white/70">
                  <Home className="h-4 w-4 text-[#d3aa5d]" />
                  Typical Size:{" "}
                  <span className="font-semibold text-white">
                    {selected.size}
                  </span>
                </div>
              </div>
            </div>

            {/* ================= RIGHT CONTENT ================= */}
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">

              {/* Ideal For */}
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#f5efe4]">
                  <Users className="h-5 w-5 text-[#b2873a]" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                    Ideal For
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#171717]">
                    {selected.idealFor}
                  </p>
                </div>

              </div>

              {/* Description */}
              <p className="mt-7 text-sm leading-7 text-gray-500 sm:text-base">
                {selected.description}
              </p>

              {/* Features */}
              <div className="mt-7 border-t border-gray-100 pt-6">

                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                  Why choose this configuration?
                </p>

                <div className="mt-4 space-y-3">

                  {selected.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#b58a3a]" />

                      <span className="text-sm text-gray-600">
                        {feature}
                      </span>
                    </div>
                  ))}

                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <button className="group flex items-center justify-center gap-2 rounded-lg bg-[#b58a3a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c69d50]">
                  Explore {selected.id} Properties

                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                <button className="group flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#b58a3a] hover:text-[#a17a2d]">
                  View All

                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

              </div>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM MESSAGE ================= */}
        <div className="mt-7 flex flex-col items-center justify-center gap-2 text-center sm:flex-row">

          <Home className="h-4 w-4 text-[#b58a3a]" />

          <p className="text-sm text-gray-500">
            Not sure which BHK is right for you?
          </p>

          <button className="text-sm font-bold text-[#a17a2d] underline underline-offset-4 hover:text-[#8c6824]">
            Get personalised recommendations
          </button>

        </div>

      </div>
    </section>
  );
}