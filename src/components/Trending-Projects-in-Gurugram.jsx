"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Building2,
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
    eligibleCities,
    isTransitioning,
    nextCity,
    prevCity,
    setCityByName,
    hasMultipleCities,
    pauseRotation,
    resumeRotation,
  } = useRotatingCitySection({
    initialGroupedData: clientData,
    rotationIntervalMs: 5000,
  });

  return (
    <section
      onMouseEnter={pauseRotation}
      onMouseLeave={resumeRotation}
      className="w-full bg-white py-12 sm:py-16 border-b border-gray-100"
    >
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
        
        {/* ================= HEADER ================= */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
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

            <p className="mt-2 max-w-2xl text-sm text-gray-500 sm:text-base">
              Discover the most sought-after residential projects and premium properties in {activeCity}.
            </p>
          </div>

          {/* Desktop Right: Controls & View All */}
          <div className="flex items-center gap-3">
            <Link
              href={`/properties?city=${encodeURIComponent(activeCity)}`}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#c41920] hover:text-[#8e1016] transition"
            >
              <span>View all in {activeCity}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {hasMultipleCities && (
              <div className="hidden gap-2 md:flex ml-2">
                <button
                  type="button"
                  onClick={prevCity}
                  aria-label="Previous city"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-[#c41920] text-white transition hover:bg-[#a3141a] cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={nextCity}
                  aria-label="Next city"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-[#c41920] text-white transition hover:bg-[#a3141a] cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================= CITY PILLS / TABS (CLICKABLE TO SEARCH/FILTER) ================= */}
        {eligibleCities.length > 0 && (
          <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1 shrink-0 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-gray-400" /> Cities:
            </span>
            {eligibleCities.map((cityName) => {
              const isActive = activeCity.toLowerCase() === cityName.toLowerCase();
              return (
                <button
                  key={cityName}
                  type="button"
                  onClick={() => setCityByName(cityName)}
                  className={`inline-flex items-center gap-1.5 shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#c41920] text-white shadow-sm ring-2 ring-red-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                  }`}
                >
                  <MapPin className={`h-3 w-3 ${isActive ? "text-white" : "text-[#c41920]"}`} />
                  <span>{cityName}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ================= PROJECT CARDS ================= */}
        <div
          className={`transition-opacity duration-300 ${
            isTransitioning ? "opacity-30" : "opacity-100"
          } ${
            activeProperties.length
              ? "grid grid-flow-col auto-cols-[100%] gap-5 overflow-x-auto pb-2 sm:auto-cols-[calc((100%_-_20px)/2)] lg:auto-cols-[calc((100%_-_60px)/4)]"
              : "grid grid-cols-1 gap-5"
          }`}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {activeProperties.length ? (
            activeProperties.map((listing) => (
              <PropertyCard
                key={listing.id}
                listing={listing}
                variant="trending"
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-500">
              No trending projects available in {activeCity} at the moment.
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
