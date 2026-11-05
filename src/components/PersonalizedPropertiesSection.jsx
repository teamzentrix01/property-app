"use client";

import React, { useRef } from "react";
import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Compass,
} from "lucide-react";
import PropertyCard from "@/components/PropertyCard";

export default function PersonalizedPropertiesSection({
  userLocationData,
  user,
}) {
  const sliderRef = useRef(null);

  if (!userLocationData) return null;

  const {
    city,
    locality,
    searchedLocation,
    exactProperties = [],
    nearbyProperties = [],
    surroundingCityProperties = [],
    isFallback,
    hasExactMatches,
  } = userLocationData;

  const displayLocation = searchedLocation || city || "Your Location";

  // Combine listings to show in prioritized order
  const displayListings = [
    ...exactProperties,
    ...nearbyProperties,
    ...surroundingCityProperties,
  ].slice(0, 12);

  if (displayListings.length === 0) return null;

  const handleScroll = (direction) => {
    if (sliderRef.current) {
      const scrollOffset = direction === "left" ? -320 : 320;
      sliderRef.current.scrollBy({ left: scrollOffset, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full bg-white py-14 sm:py-16 border-b border-gray-100 overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fff1f2] border border-[#c41920]/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#c41920] mb-2.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Personalized for You</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#180e0f] tracking-tight">
              {hasExactMatches ? (
                <>
                  Properties in <span className="text-[#c41920]">{displayLocation}</span>
                </>
              ) : (
                <>
                  Recommended Properties Near{" "}
                  <span className="text-[#c41920]">{displayLocation}</span>
                </>
              )}
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-gray-500 max-w-2xl">
              {hasExactMatches
                ? `Explore available verified listings in and around ${displayLocation}.`
                : `Currently no exact listings in ${displayLocation}. Automatically showing closest verified properties from nearby cities and localities.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/properties?city=${encodeURIComponent(city || "")}`}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#c41920] hover:underline"
            >
              <span>View All Near {city || "You"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                aria-label="Previous"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-2xs hover:border-[#c41920] hover:text-[#c41920] transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                aria-label="Next"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-2xs hover:border-[#c41920] hover:text-[#c41920] transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Fallback notification banner if exact location has 0 properties */}
        {isFallback && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs sm:text-sm text-blue-900 flex items-start gap-3 shadow-2xs">
            <Compass className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                No direct properties listed in {displayLocation} right now.
              </p>
              <p className="text-blue-700/90 text-xs mt-0.5">
                Don&apos;t worry! We found closest matching properties in adjacent hubs and nearby sectors for you.
              </p>
            </div>
          </div>
        )}

        {/* Property Cards Slider */}
        <div
          ref={sliderRef}
          className="flex gap-5 overflow-x-auto scrollbar-none pb-4 pt-1 items-stretch"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {displayListings.map((listing) => (
            <div
              key={listing.id}
              className="w-[280px] sm:w-[310px] shrink-0"
            >
              <PropertyCard
                listing={listing}
                badge={listing.locationBadge}
                variant="dashboard"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

