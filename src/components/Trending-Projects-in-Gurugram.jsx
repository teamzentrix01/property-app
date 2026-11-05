"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { useRotatingCitySection } from "@/hooks/useRotatingCitySection";

export default function TrendingProjects({ groupedData = {} }) {
  const [clientData, setClientData] = useState(groupedData);

  useEffect(() => {
    if (Object.keys(groupedData || {}).length === 0) {
      // Client-side fallback fetch
      fetch("/api/homepage/rotating-sections")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.trending) setClientData(data.trending);
        })
        .catch(() => {});
    }
  }, [groupedData]);

  const {
    activeCity,
    activeProperties,
    isTransitioning,
    nextCity,
    prevCity,
    hasMultipleCities,
  } = useRotatingCitySection({
    initialGroupedData: clientData,
    rotationIntervalMs: 60000,
  });

  return (
    <section className="w-full bg-white py-10 sm:py-6">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
        {/* ================= HEADER ================= */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-[2px] w-8 bg-[#c41920]" />

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#c41920]">
                EXPLORE {activeCity.toUpperCase()}
              </span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl lg:text-[40px]">
              Trending Projects in{" "}
              <span className="text-[#c41920] transition-opacity duration-300">
                {activeCity}
              </span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm text-gray-500 sm:text-base">
              Discover the most sought-after residential projects
              and premium properties in {activeCity}.
            </p>
          </div>

          {/* Desktop arrows */}
          {hasMultipleCities && (
            <div className="hidden gap-2 md:flex">
              <button
                type="button"
                onClick={prevCity}
                aria-label="Previous city"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-[#c41920] text-white transition hover:bg-[#a3141a]"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={nextCity}
                aria-label="Next city"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-[#c41920] text-white transition hover:bg-[#a3141a]"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* ================= PROJECT CARDS ================= */}
        <div
          className={`transition-opacity duration-300 ${
            isTransitioning ? "opacity-30" : "opacity-100"
          } ${
            activeProperties.length
              ? "grid grid-flow-col auto-cols-[100%] gap-5 overflow-x-auto pb-2 sm:auto-cols-[calc((100%_-_20px)/2)] lg:auto-cols-[calc((100%_-_60px)/4)]"
              : "grid grid-cols-1 gap-5"
          }`}
        >
          {activeProperties.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-[#fbf9f5] py-16 px-4 text-center">
              <MapPin className="mb-3 h-10 w-10 text-[#c41920] opacity-50" />
              <p className="text-base font-medium text-gray-700">
                No properties available in {activeCity} right now.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Please check back later or explore other cities.
              </p>
            </div>
          ) : (
            activeProperties.map((project) => (
              <PropertyCard key={project.id} listing={project} variant="trending" />
            ))
          )}
        </div>

        {/* ================= MOBILE ARROWS ================= */}
        {hasMultipleCities && (
          <div className="mt-6 flex justify-center gap-2 md:hidden">
            <button
              type="button"
              onClick={prevCity}
              aria-label="Previous city"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-[#c41920] text-white shadow-sm transition hover:bg-[#a3141a]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={nextCity}
              aria-label="Next city"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-[#c41920] text-white shadow-sm transition hover:bg-[#a3141a]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ================= BOTTOM CTA ================= */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-xl bg-[#f8f6f1] px-6 py-6 sm:flex-row sm:px-8">
          <div>
            <h3 className="text-lg font-bold text-[#1c1c1c]">
              Looking for a property in {activeCity}?
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Explore verified properties across {activeCity}.
            </p>
          </div>

          <Link
            href={`/listings?city=${encodeURIComponent(activeCity)}`}
            className="flex items-center gap-2 rounded-lg bg-[#c41920] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#a3141a]"
          >
            Explore {activeCity}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
