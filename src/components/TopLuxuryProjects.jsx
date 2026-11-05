"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  Crown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import SaveListingButton from "@/components/SaveListingButton";
import { useRotatingCitySection } from "@/hooks/useRotatingCitySection";

export default function TopLuxuryProjects({ groupedData = {}, listings = [] }) {
  const [clientData, setClientData] = useState(() => {
    if (Object.keys(groupedData || {}).length > 0) return groupedData;
    const grp = {};
    (listings || []).forEach((l) => {
      const c = l.city?.trim();
      if (c) {
        if (!grp[c]) grp[c] = [];
        grp[c].push(l);
      }
    });
    return grp;
  });

  useEffect(() => {
    if (Object.keys(groupedData || {}).length === 0) {
      fetch("/api/homepage/rotating-sections")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.luxury && Object.keys(data.luxury).length > 0) {
            setClientData(data.luxury);
          }
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

  const projects = activeProperties.slice(0, 4).map((listing) => ({
    id: listing.id,
    name: listing.title,
    location: `${listing.area}, ${listing.city}`,
    price: formatPrice(listing.price, listing.purpose),
    type: listing.propertyType,
    image: listing.photos?.[0]?.url || "/file.svg",
    tag: "Ultra Luxury",
  }));

  return (
    <section className="w-full bg-[#fcfbf9] py-16 sm:py-20 lg:py-12">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
        {/* ================= HEADER ================= */}
        <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Crown className="h-4 w-4 text-[#b58a3a]" />

              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#b58a3a]">
                Premium Collection
              </span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl lg:text-[42px]">
              Top Luxury Projects in{" "}
              <span className="text-[#c41920] transition-opacity duration-300">
                {activeCity}
              </span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              Explore {activeCity}&apos;s most prestigious addresses, crafted for
              buyers who expect exceptional design, space and lifestyle.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop arrows */}
            {hasMultipleCities && (
              <div className="hidden gap-2 md:flex">
                <button
                  type="button"
                  onClick={prevCity}
                  aria-label="Previous city"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:border-[#b58a3a] hover:bg-[#b58a3a] hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={nextCity}
                  aria-label="Next city"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:border-[#b58a3a] hover:bg-[#b58a3a] hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* View All */}
            <Link
              href={`/properties?city=${encodeURIComponent(activeCity)}&category=luxury`}
              className="group flex w-fit items-center gap-2 text-sm font-semibold text-[#222] transition hover:text-[#b58a3a]"
            >
              View All in {activeCity}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* ================= CARDS ================= */}
        <div
          className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 transition-opacity duration-300 ${
            isTransitioning ? "opacity-30" : "opacity-100"
          }`}
        >
          {projects.length === 0 ? (
            <div className="col-span-full py-12 text-center text-sm text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
              No luxury projects available in {activeCity} right now.
            </div>
          ) : (
            projects.map((project) => (
              <article
                key={project.id}
                className="card-red-hover group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_5px_22px_rgba(0,0,0,0.06)] transition-all duration-300 hover:bg-[#c41920] hover:border-[#c41920] hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.12)]"
              >
                {/* IMAGE */}
                <div className="relative h-[175px] overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />

                  {/* Badge */}
                  <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-md border border-white/20 bg-black/50 px-3 py-1.5 backdrop-blur-md">
                    <Crown className="h-3.5 w-3.5 text-[#e1bb70]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#f5ebd7]">
                      {project.tag}
                    </span>
                  </div>

                  {/* Wishlist */}
                  <SaveListingButton
                    listingId={project.id}
                    className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-110"
                  />

                  {/* Price */}
                  <div className="absolute bottom-4 left-4">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-white/70">
                      Starting Price
                    </p>
                    <p className="mt-0.5 text-xl font-bold text-white">
                      {project.price}
                    </p>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-4">
                  {/* Location */}
                  <div className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#c41920]" />
                    <p className="line-clamp-1 text-xs text-gray-500">
                      {project.location}
                    </p>
                  </div>

                  {/* Price */}
                  <p className="mt-1 text-lg font-bold text-[#c41920]">
                    {project.price}
                  </p>

                  {/* Title */}
                  <h3 className="mt-1 line-clamp-1 text-lg font-bold text-[#171717] transition group-hover:text-[#c41920]">
                    {project.name}
                  </h3>

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
                        Classification
                      </span>
                      <span className="text-xs font-semibold text-[#b58a3a]">
                        Ultra Luxury
                      </span>
                    </div>
                  </div>

                  {/* Button */}
                  <Link
                    href={`/listings/${project.id}`}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#c41920] py-2.5 text-sm font-semibold text-[#c41920] transition-all duration-300 hover:bg-[#c41920] hover:text-white"
                  >
                    View Project
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>

        {/* ================= BOTTOM LUXURY CTA ================= */}
        <div className="mt-12 overflow-hidden rounded-xl bg-gradient-to-r from-[#171717] via-[#222222] to-[#121212] p-8 text-white sm:p-10 border border-white/10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#e1bb70]">
                Luxury Living in {activeCity}
              </span>

              <h3 className="mt-2 text-2xl font-bold sm:text-3xl">
                Experience Unmatched Sophistication & Space
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                Exclusive high-end residences with bespoke interiors and world-class amenities in {activeCity}.
              </p>
            </div>

            <Link
              href={`/properties?city=${encodeURIComponent(activeCity)}&category=luxury`}
              className="flex w-fit items-center gap-2 rounded-lg bg-[#b58a3a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c99f4d]"
            >
              Explore {activeCity} Luxury
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
