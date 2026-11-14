"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import SaveListingButton from "@/components/SaveListingButton";

export default function RecommendedProperties({ listings = [], error = false }) {
  const sliderRef = useRef(null);
  const [currentListings, setCurrentListings] = useState(listings);
  const [detectedCity, setDetectedCity] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Auto-adapt listings when user's location is detected or stored
  useEffect(() => {
    // 1. Check user city from localStorage "userCity"
    let userCity = "";
    try {
      const savedCity = localStorage.getItem("userCity");
      if (savedCity && savedCity.trim()) {
        userCity = savedCity.trim();
      }
    } catch (e) {}

    const loadRecommendations = (targetCity) => {
      if (targetCity) {
        setDetectedCity(targetCity);
        setLoadingLocation(true);
        fetch(`/api/properties/recommended?city=${encodeURIComponent(targetCity)}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.listings && data.listings.length > 0) {
              setCurrentListings(data.listings);
            }
          })
          .catch(() => {})
          .finally(() => setLoadingLocation(false));
      } else {
        setDetectedCity("");
        setCurrentListings(listings);
      }
    };

    loadRecommendations(userCity);

    // Listen to live city change events
    const handleCityChanged = (e) => {
      const newCity = e.detail?.city;
      if (newCity) {
        loadRecommendations(newCity);
      }
    };

    window.addEventListener("bhoomi-city-changed", handleCityChanged);
    return () => {
      window.removeEventListener("bhoomi-city-changed", handleCityChanged);
    };
  }, [listings]);

  // Map dynamic listings received from the database
  const properties = (currentListings || []).map((listing) => ({
    id: listing.id,
    name: listing.title,
    location: listing.area || listing.city || "Prime Location",
    city: listing.city || "",
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
    <section className="w-full bg-[#f8f9fa] py-16 sm:py-20 lg:py-12 overflow-hidden border-b border-gray-100">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">

        {/* =========================================
            SECTION HEADER
        ========================================== */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-100 px-3 py-1 text-xs font-bold text-[#c41920] mb-2.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {detectedCity ? `Recommended for ${detectedCity}` : "Tailored Recommendations"}
            </span>
          </div>

          <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-[42px]">
            <span className="text-[#c41920]">Bhoomi</span>{" "}
            <span className="text-[#0f172a]">Recommended</span>
            {detectedCity && (
              <span className="block sm:inline sm:ml-2 text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700">
                in & around <span className="text-[#c41920] underline decoration-red-200">{detectedCity}</span>
              </span>
            )}
          </h2>

          {/* Centered red underline bar */}
          <div className="mx-auto mt-2.5 h-1.5 w-16 rounded-full bg-[#c41920]" />

          {/* Subtitle */}
          <p className="mx-auto mt-3.5 max-w-2xl text-center text-sm leading-relaxed text-gray-500 sm:text-base">
            {detectedCity
              ? `Discover handpicked verified properties in ${detectedCity} and nearest surrounding areas.`
              : "Discover premium properties handpicked for luxury living and exceptional investment returns."}
          </p>

          {/* Controls & View All Row */}
          <div className="mt-5 flex items-center justify-between">
            <Link
              href={detectedCity ? `/properties?city=${encodeURIComponent(detectedCity)}` : "/properties"}
              className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 transition hover:text-[#c41920]"
            >
              View All {detectedCity ? `${detectedCity} Properties` : "Properties"}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 text-[#c41920]" />
            </Link>

            {/* Slider navigation buttons */}
            {properties.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleScroll("left")}
                  aria-label="Previous property"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-[#c41920] text-white shadow-sm transition hover:bg-[#8e1016]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleScroll("right")}
                  aria-label="Next property"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-[#c41920] text-white shadow-sm transition hover:bg-[#8e1016]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =========================================
            SLIDING MARQUEE CAROUSEL
        ========================================== */}
        {properties.length > 0 ? (
          <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden py-6">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-20 w-8 sm:w-16 bg-gradient-to-r from-[#f8f9fa] to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-20 w-8 sm:w-16 bg-gradient-to-l from-[#f8f9fa] to-transparent" />

            <div
              ref={sliderRef}
              className="animate-slide-left flex gap-5 px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto scrollbar-none items-stretch"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {carouselItems.map((property, idx) => (
                <div
                  key={`${property.id}-${idx}`}
                  className="card-property-standard group relative flex flex-col w-[275px] sm:w-[290px] shrink-0 border border-gray-200 shadow-sm transition-all duration-250 bg-white hover:-translate-y-1 hover:shadow-lg hover:border-[#c41920]/40 rounded-2xl overflow-hidden"
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
                  <div className="flex flex-1 flex-col p-4 bg-white">
                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 transition-colors">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#c41920]" />
                      <span className="truncate">
                        {property.location}{property.city ? `, ${property.city}` : ""}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="mt-1.5 text-sm font-bold text-gray-900 transition-colors line-clamp-1">
                      {property.name}
                    </h3>

                    {/* Price */}
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-[10px] font-medium text-gray-400 block uppercase">
                          Starting From
                        </span>
                        <span className="text-base font-extrabold text-[#c41920]">
                          {property.price}
                        </span>
                      </div>

                      <Link
                        href={`/listings/${property.id}`}
                        className="rounded-lg bg-[#fff1f2] text-[#c41920] hover:bg-[#c41920] hover:text-white px-3 py-1.5 text-xs font-bold transition-colors duration-200 shadow-xs"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-sm text-gray-500">
            No recommended properties found.
          </div>
        )}
      </div>
    </section>
  );
}
