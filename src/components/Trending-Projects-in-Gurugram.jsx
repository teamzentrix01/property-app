"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
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
    <section className="w-full bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">

        <SectionHeading
          eyebrow="Explore your city"
          title={`Trending Projects in ${selectedCity}`}
          description={`Discover homes, plots and commercial spaces in ${selectedCity}.`}
          action={
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={leftArrow}
                aria-label="Previous city"
                className="grid h-10 w-10 place-items-center rounded-full border border-green-700 bg-white text-green-700 shadow-sm transition duration-200 hover:bg-green-700 hover:text-white"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={rightArrow}
                aria-label="Next city"
                className="grid h-10 w-10 place-items-center rounded-full border border-green-700 bg-white text-green-700 shadow-sm transition duration-200 hover:bg-green-700 hover:text-white"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          }
        />
        <div className="mb-6 flex gap-2 border-b border-gray-200" role="group" aria-label="Trending project city">
          {cities.map((city, index) => (
            <button
              key={city}
              type="button"
              aria-pressed={city === selectedCity}
              onClick={() => setCurrentCityIndex(index)}
              className={`rounded-t-xl border-b-2 px-5 py-3 text-sm font-bold transition duration-200 ${
                city === selectedCity
                  ? "border-green-700 bg-[#DCFCE7] text-[#15803D]"
                  : "border-transparent text-gray-600 hover:text-green-700 hover:bg-green-50/50"
              }`}
            >
              {city}
            </button>
          ))}
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
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-slate-50 py-16 px-4 text-center">
              <MapPin className="mb-3 h-10 w-10 text-green-700 opacity-50" />
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

        {/* ================= BOTTOM CTA ================= */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-xl bg-slate-50 px-6 py-6 sm:flex-row sm:px-8">
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
            className="flex items-center gap-2 rounded-lg bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-900"
          >
            Explore {selectedCity}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
