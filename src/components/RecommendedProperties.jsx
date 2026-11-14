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

  // Build marquee continuous infinite track (repeating cards to fill loop)
  let carouselItems = properties;
  if (properties.length > 0) {
    const repeatCount = Math.max(2, Math.ceil(8 / properties.length));
    carouselItems = Array(repeatCount).fill(properties).flat();
  }

  const handleScroll = (direction) => {
    if (sliderRef.current) {
      const scrollOffset = direction === "left" ? -300 : 300;
      sliderRef.current.scrollBy({ left: scrollOffset, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-100 px-3 py-1 text-xs font-bold text-[#c41920] mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {detectedCity ? `Recommended for ${detectedCity}` : "Curated Especially For You"}
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl text-[#0f172a]">
            Recommended <span className="text-[#c41920]">Properties</span>
            {detectedCity && (
              <span className="block sm:inline sm:ml-2 text-lg sm:text-2xl font-bold text-gray-700">
                in <span className="text-[#c41920]">{detectedCity}</span>
              </span>
            )}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            {detectedCity
              ? `Explore verified properties handpicked in ${detectedCity} and nearby areas.`
              : "Curated especially for you based on popular demand and verified listings."}
          </p>
        </div>

        {/* Slider Nav & View All */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={detectedCity ? `/properties?city=${encodeURIComponent(detectedCity)}` : "/properties"}
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-[#c41920] hover:text-[#8e1016]"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>

          {properties.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleScroll("left")}
                aria-label="Previous property"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-[#c41920] hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleScroll("right")}
                aria-label="Next property"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-[#c41920] hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Properties Horizontal Sliding Track with Right-to-Left Continuous Animation */}
      {properties.length > 0 ? (
        <div className="relative overflow-hidden py-2">
          {/* Edge Gradients for Smooth Infinite Transition */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-6 sm:w-12 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-6 sm:w-12 bg-gradient-to-l from-white to-transparent" />

          <div
            ref={sliderRef}
            className="animate-slide-left flex gap-4 overflow-x-auto pb-4 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden items-stretch"
          >
            {carouselItems.map((property, idx) => (
              <div
                key={`${property.id}-${idx}`}
                className="card-property-standard group relative flex flex-col w-[240px] sm:w-[260px] shrink-0 border border-gray-200 shadow-sm transition-all duration-300 hover:border-[#c41920] hover:-translate-y-1 hover:shadow-lg rounded-2xl overflow-hidden bg-white"
              >
                {/* Property Image */}
                <div className="relative h-[160px] w-full overflow-hidden bg-slate-100">
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

                  {/* Price Badge on Top of Image (99acres style) */}
                  <div className="absolute left-2.5 bottom-2.5 rounded-lg bg-black/75 px-2.5 py-1 text-xs font-black text-white backdrop-blur-xs">
                    {property.price}
                  </div>

                  {/* Top-Left RERA Badge */}
                  <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-gray-800 shadow-sm backdrop-blur-xs pointer-events-none">
                    <span className="font-bold text-[#c41920]">✓</span>
                    <span>RERA</span>
                  </div>

                  {/* Wishlist Button */}
                  <div className="absolute right-2.5 top-2.5">
                    <SaveListingButton
                      listingId={property.id}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-sm transition hover:scale-110 hover:text-[#c41920]"
                    />
                  </div>
                </div>

                {/* Card Information */}
                <div className="flex flex-1 flex-col p-3.5">
                  <Link href={`/listings/${property.id}`} className="block">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[#c41920] transition-colors">
                      {property.name}
                    </h3>
                  </Link>

                  <div className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-500">
                    <MapPin className="h-3 w-3 shrink-0 text-[#c41920]" />
                    <span className="truncate">
                      {property.location}{property.city ? `, ${property.city}` : ""}
                    </span>
                  </div>

                  <div className="mt-auto pt-3 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100">
                    <span>Posted by Owner</span>
                    <Link
                      href={`/listings/${property.id}`}
                      className="font-bold text-[#c41920] hover:underline"
                    >
                      View &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No recommended properties found at the moment.
        </div>
      )}
    </div>
  );
}
