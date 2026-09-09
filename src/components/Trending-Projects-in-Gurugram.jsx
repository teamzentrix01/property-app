"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import SaveListingButton from "@/components/SaveListingButton";

const cities = ["Moradabad", "Meerut", "Rampur"];

export default function TrendingProjects({ listings = [] }) {
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const selectedCity = cities[currentCityIndex];

  const rightArrow = () => {
    setCurrentCityIndex((prev) => (prev + 1) % cities.length);
  };

  const leftArrow = () => {
    setCurrentCityIndex((prev) => (prev - 1 + cities.length) % cities.length);
  };

  const [cityListings, setCityListings] = useState(() => {
    return (listings || []).filter(
      (item) =>
        item?.status === "APPROVED" &&
        (item?.city || "").trim().toLowerCase() === cities[0].toLowerCase()
    );
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const propMatches = (listings || []).filter(
      (item) =>
        item?.status === "APPROVED" &&
        (item?.city || "").trim().toLowerCase() === selectedCity.toLowerCase()
    );

    fetch(`/api/listings?city=${encodeURIComponent(selectedCity)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch listings");
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        const matched = (data.listings || []).filter(
          (item) =>
            item?.status === "APPROVED" &&
            (item?.city || "").trim().toLowerCase() === selectedCity.toLowerCase()
        );
        setCityListings(matched);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to load listings for city:", selectedCity, err);
        setCityListings(propMatches);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCity, listings]);

  const projects = cityListings.map((listing) => ({
    id: listing.id,
    name: listing.title,
    location: [listing.area, listing.city].filter(Boolean).join(", "),
    price: formatPrice(listing.price, listing.purpose),
    type: listing.propertyType || "Residential",
    area: listing.sizeValue
      ? `${listing.sizeValue} ${listing.sizeUnit || "sq ft"}`
      : "Area on request",
    image:
      listing.photos?.[0]?.url ||
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85",
    tag: "Trending",
  }));

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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <div className="col-span-full py-16 text-center text-sm text-gray-400">
              Loading properties in {selectedCity}...
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
            projects.slice(0, 4).map((project) => (
              <div
                key={project.id}
                className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.12)]"
              >
                {/* IMAGE */}
                <div className="relative h-[235px] overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />

                  {/* Trending Tag */}
                  <div className="absolute left-4 top-4 rounded-md bg-[#b2873a] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    {project.tag}
                  </div>

                  {/* RERA */}
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-md bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-green-700 shadow-sm">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    RERA
                  </div>

                  {/* Heart */}
                  <SaveListingButton
                    listingId={project.id}
                    className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-110"
                  />

                  {/* Price */}
                  <div className="absolute bottom-4 left-4">
                    <p className="text-[10px] uppercase tracking-wide text-white/70">
                      Starting From
                    </p>

                    <p className="text-xl font-bold text-white">
                      {project.price}
                    </p>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  <Link href={`/listings/${project.id}`}>
                    <h3 className="line-clamp-1 text-lg font-bold text-[#171717] transition group-hover:text-[#b2873a]">
                      {project.name}
                    </h3>
                  </Link>

                  {/* Location */}
                  <div className="mt-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-[#b2873a]" />

                    <p className="line-clamp-1 text-xs text-gray-500">
                      {project.location}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="my-4 h-px bg-gray-100" />

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">
                        Property Type
                      </span>

                      <span className="text-xs font-semibold text-gray-700">
                        {project.type}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">
                        Area
                      </span>

                      <span className="text-xs font-semibold text-gray-700">
                        {project.area}
                      </span>
                    </div>
                  </div>

                  {/* Button */}
                  <Link
                    href={`/listings/${project.id}`}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#b2873a] py-2.5 text-sm font-semibold text-[#b2873a] transition-all duration-300 hover:bg-[#b2873a] hover:text-white"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
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
