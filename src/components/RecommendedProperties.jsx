"use client";

import React, { useRef } from "react";
import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import SaveListingButton from "@/components/SaveListingButton";

export default function RecommendedProperties({ listings = [], error = false }) {
  const sliderRef = useRef(null);

  // Map ONLY dynamic listings received from the database
  const properties = (listings || []).map((listing) => ({
    id: listing.id,
    name: listing.title,
    location: listing.area || listing.city || "Gurugram",
    city: listing.city || "Haryana",
    price: formatPrice(listing.price, listing.purpose),
    image:
      listing.photos?.[0]?.url ||
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85",
    tag: listing.purpose === "RENT" ? "FOR RENT" : "FOUNDER CHOICE",
    rera: Boolean(listing.reraNumber),
  }));

  // Build marquee track using strictly database properties
  let carouselItems = properties;
  if (properties.length > 0) {
    // Duplicate only the database properties so the right-to-left marquee loops seamlessly
    const repeatCount = Math.max(2, Math.ceil(8 / properties.length));
    carouselItems = Array(repeatCount).fill(properties).flat();
  }

  const handleScroll = (direction) => {
    if (sliderRef.current) {
      const scrollOffset = direction === "left" ? -340 : 340;
      sliderRef.current.scrollBy({ left: scrollOffset, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full bg-[#f8f9fa] py-16 sm:py-20 lg:py-12 overflow-hidden ">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">

        {/* =========================================
            SECTION HEADER (Centered as per reference)
        ========================================== */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-[42px]">
            <span className="text-[#c41920]">100acress</span>{" "}
            <span className="text-[#0f172a]">Recommended</span>
          </h2>

          {/* Centered red underline bar */}
          <div className="mx-auto mt-2.5 h-1.5 w-16 rounded-full bg-[#c41920]" />

          {/* Subtitle */}
          <p className="mx-auto mt-3.5 max-w-2xl text-center text-sm leading-relaxed text-gray-500 sm:text-base">
            Discover premium properties handpicked for luxury living and exceptional investment returns
          </p>

          {/* Controls & View All Row */}
          <div className="mt-5 flex items-center justify-between">
            <Link
              href="/properties"
              className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 transition hover:text-[#c41920]"
            >
              View All Properties
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 text-[#c41920]" />
            </Link>

            {/* Slider navigation buttons */}
            {properties.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleScroll("left")}
                  aria-label="Previous property"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-[#c41920] text-gray-700 shadow-sm transition hover:border-[#c41920] hover:bg-[#c41920] hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleScroll("right")}
                  aria-label="Next property"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-[#c41920] text-gray-700 shadow-sm transition hover:border-[#c41920] hover:bg-[#c41920] hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =========================================
            RIGHT-TO-LEFT SLIDING MARQUEE CAROUSEL
            (Strictly Database Properties Only)
        ========================================== */}
        {properties.length > 0 ? (
          <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden py-3">
            {/* Subtle gradient edges for luxury fade effect */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-20 w-8 sm:w-16 bg-gradient-to-r from-[#f8f9fa] to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-20 w-8 sm:w-16 bg-gradient-to-l from-[#f8f9fa] to-transparent" />

            {/* Marquee Track (Smooth right-to-left slide, pauses on hover) */}
            <div
              ref={sliderRef}
              className="animate-slide-left flex gap-5 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {carouselItems.map((property, idx) => (
                <div
                  key={`${property.id}-${idx}`}
                  className="card-property-standard group relative flex flex-col w-[275px] sm:w-[290px] shrink-0 border border-[#c41920] shadow-sm transition-all duration-300 hover:bg-[#c41920] hover:border-white hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* TOP IMAGE */}
                  <div className="relative h-[175px] w-full overflow-hidden bg-slate-100">
                    <Link
                      href={`/listings/${property.id}`}
                      className="block h-full w-full"
                    >
                      {property.image ? (
                        <img
                          src={property.image}
                          alt={property.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-xs text-gray-400">
                          Photo coming soon
                        </div>
                      )}
                    </Link>

                    {/* Top-Left RERA Badge */}
                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-gray-800 shadow-sm backdrop-blur-xs pointer-events-none">
                      <span className="font-bold text-[#c41920]">✓</span>
                      <span>RERA</span>
                    </div>

                    {/* Top-Right Wishlist Button */}
                    <div className="absolute right-3 top-3">
                      <SaveListingButton
                        listingId={property.id}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-sm transition hover:scale-110 hover:text-[#c41920]"
                      />
                    </div>
                  </div>

                  {/* CARD CONTENT */}
                  <div className="flex flex-1 flex-col p-4">
                    {/* Property Name */}
                    <Link href={`/listings/${property.id}`}>
                      <h3 className="line-clamp-1 text-[15px] sm:text-base font-bold text-[#171717] transition-colors group-hover:text-[#c41920]">
                        {property.name}
                      </h3>
                    </Link>

                    {/* Price in Bold Red */}
                    <p className="mt-1 text-base font-bold text-[#c41920] sm:text-lg">
                      {property.price}
                    </p>

                    {/* Location */}
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#c41920]" />
                      <span className="truncate">
                        {property.location}{property.city ? `, ${property.city}` : ""}
                      </span>
                    </div>

                    {/* View Property Button */}
                    <Link
                      href={`/listings/${property.id}`}
                      className="btn-card-action mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all duration-300"
                    >
                      View Property
                      <ArrowRight className="h-3.5 w-3.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Empty state when database has 0 listings */
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center my-4">
            <p className="text-sm font-medium text-gray-500">
              {error
                ? "Properties could not be loaded right now. Please try again shortly."
                : "No properties available in database right now."}
            </p>
          </div>
        )}

        {/* =========================================
            BOTTOM CTA BANNER
        ========================================== */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl bg-[#171717] px-6 py-6 sm:flex-row sm:px-8 border border-white/10 shadow-lg">
          <div>
            <h3 className="text-lg font-bold text-white sm:text-xl">
              Looking for your dream property?
            </h3>
            <p className="mt-1 text-sm text-white/60">
              Explore our handpicked collection of premium properties.
            </p>
          </div>

          <Link
            href="/properties"
            className="flex shrink-0 items-center gap-2 rounded-lg bg-[#c41920] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#a8141a] shadow-md hover:shadow-lg"
          >
            Explore Properties
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
