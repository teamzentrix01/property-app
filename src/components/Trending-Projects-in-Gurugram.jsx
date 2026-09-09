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

const cities = ["Moradabad", "Meerut", "Rampur"];

export default function TrendingProjects() {
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const selectedCity = cities[currentCityIndex];

  const rightArrow = () => {
    setCurrentCityIndex((prev) => (prev + 1) % cities.length);
  };

  const leftArrow = () => {
    setCurrentCityIndex((prev) => (prev - 1 + cities.length) % cities.length);
  };

  const [result, setResult] = useState(null);
  const [retry, setRetry] = useState(0);
  const currentResult = result?.city === selectedCity ? result : null;
  const loading = !currentResult;
  const error = currentResult?.error;
  const projects = currentResult?.listings || [];
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/listings?city=' + encodeURIComponent(selectedCity) + '&cityMatch=exact', {
      signal: controller.signal, cache: "no-store",
    }).then(async (res) => {
      if (!res.ok) throw new Error("Failed to fetch listings");
      const data = await res.json();
      if (!Array.isArray(data.listings)) throw new Error("Invalid listings response");
      if (!controller.signal.aborted) setResult({ city: selectedCity, listings: data.listings.filter((item) =>
        item.status === "APPROVED" && item.city?.trim().toLowerCase() === selectedCity.toLowerCase()
      ) });
    }).catch(() => {
      if (!controller.signal.aborted) setResult({ city: selectedCity, error: true });
    });
    return () => controller.abort();
  }, [selectedCity, retry]);

  return (
    <section className="w-full bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">

        {/* ================= HEADER ================= */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-[2px] w-8 bg-moss" />

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-moss">
                EXPLORE {selectedCity.toUpperCase()}
              </span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl lg:text-[40px]">
              Trending Projects in{" "}
              <span className="text-moss">
                {selectedCity}
              </span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm text-gray-500 sm:text-base">
              Discover the most sought-after residential projects
              and premium properties in {selectedCity}.
            </p>
          </div>

          {/* Desktop arrows */}
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={leftArrow}
              aria-label="Previous city"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-[#b2873a] hover:bg-[#b2873a] hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={rightArrow}
              aria-label="Next city"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-[#b2873a] hover:bg-[#b2873a] hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ================= PROJECT CARDS ================= */}
        <div key={selectedCity} className={projects.length ? "grid grid-flow-col auto-cols-[100%] gap-5 overflow-x-auto pb-2 sm:auto-cols-[calc((100%_-_20px)/2)] lg:auto-cols-[calc((100%_-_60px)/4)]" : "grid grid-cols-1 gap-5"}>
          {loading ? (
            <div className="col-span-full py-16 text-center text-sm text-gray-400">
              Loading properties in {selectedCity}...
            </div>
          ) : error ? (
            <div className="col-span-full py-16 text-center text-sm text-gray-500" role="alert">
              Unable to load properties in {selectedCity}.
              <button type="button" className="ml-2 underline" onClick={() => { setResult(null); setRetry((value) => value + 1); }}>Try again</button>
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-[#fbf9f5] py-16 px-4 text-center">
              <MapPin className="mb-3 h-10 w-10 text-[#b2873a] opacity-50" />
              <p className="text-base font-medium text-gray-700">
                No properties available in {selectedCity} right now.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Please check back later or explore other cities.
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <PropertyCard key={project.id} listing={project} variant="trending" />
            ))
          )}
        </div>

        {/* ================= MOBILE ARROWS ================= */}
        <div className="mt-6 flex justify-center gap-2 md:hidden">
          <button
            type="button"
            onClick={leftArrow}
            aria-label="Previous city"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-[#b2873a] hover:bg-[#b2873a] hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={rightArrow}
            aria-label="Next city"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-[#b2873a] hover:bg-[#b2873a] hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* ================= BOTTOM CTA ================= */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-xl bg-[#f8f6f1] px-6 py-6 sm:flex-row sm:px-8">
          <div>
            <h3 className="text-lg font-bold text-[#1c1c1c]">
              Looking for a property in {selectedCity}?
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Explore thousands of verified properties across {selectedCity}.
            </p>
          </div>

          <Link
            href={`/listings?city=${encodeURIComponent(selectedCity)}`}
            className="flex items-center gap-2 rounded-lg bg-[#b2873a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#96702c]"
          >
            Explore {selectedCity}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
