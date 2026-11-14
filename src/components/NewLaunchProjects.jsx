"use client";

import React, { useState, useEffect } from "react";
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
import { useRotatingCitySection } from "@/hooks/useRotatingCitySection";

export default function NewLaunchProjects({ groupedData = {}, listings = [] }) {
  const [clientData, setClientData] = useState(() => {
    if (Object.keys(groupedData || {}).length > 0) return groupedData;
    // Fallback: group the passed listings by city if groupedData wasn't provided
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
    if (Object.keys(groupedData || {}).length > 0) {
      setClientData(groupedData);
    } else {
      fetch("/api/homepage/rotating-sections")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.newLaunch && Object.keys(data.newLaunch).length > 0) {
            setClientData(data.newLaunch);
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
    tag: "New Launch",
  }));

  return (
    <section className="w-full bg-[#f8f8f8] py-16 sm:py-16 lg:py-12">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
        {/* ================= HEADER ================= */}
        <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {/* Small Heading */}
            <div className="mb-3 flex items-center gap-2">
              <span className="h-[2px] w-8 bg-[#b58a3a]" />

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#b58a3a]">
                Latest Launches
              </span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl lg:text-[42px]">
              New Launch Projects in{" "}
              <span className="text-[#c41920] transition-opacity duration-300">
                {activeCity}
              </span>
            </h2>

            {/* Description */}
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              Explore the latest verified property launches across {activeCity}.
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
              href={`/properties?city=${encodeURIComponent(activeCity)}`}
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
              No new launches available in {activeCity} right now.
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="card-red-hover group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-250 hover:border-[#c41920]/40 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* ================= IMAGE ================= */}
                <div className="relative h-[175px] overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/20" />

                  {/* New Launch Badge */}
                  <div className="absolute left-4 top-4 rounded-md bg-[#b58a3a] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg">
                    {project.tag}
                  </div>

                  {/* RERA */}
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-md bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-green-700 shadow">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    RERA
                  </div>

                  {/* Wishlist */}
                  <SaveListingButton
                    listingId={project.id}
                    className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-110"
                  />

                  {/* Price */}
                  <div className="absolute bottom-4 left-4">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-white/70">
                      Starting From
                    </p>

                    <p className="mt-0.5 text-xl font-bold text-white">
                      {project.price}
                    </p>
                  </div>
                </div>

                {/* ================= CONTENT ================= */}
                <div className="p-4">
                  {/* 1. Location */}
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#c41920]" />

                    <p className="line-clamp-2 text-xs leading-5 text-gray-500">
                      {project.location}
                    </p>
                  </div>

                  {/* 2. Price */}
                  <p className="mt-1 text-lg font-bold text-[#c41920]">
                    {project.price}
                  </p>

                  {/* 3. Name */}
                  <h3 className="mt-1 text-lg font-bold text-[#171717] transition group-hover:text-[#c41920]">
                    {project.name}
                  </h3>

                  {/* Divider */}
                  <div className="my-4 h-px bg-gray-100" />

                  {/* Property Type */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Property Type
                    </span>

                    <span className="text-xs font-semibold text-gray-700">
                      {project.type}
                    </span>
                  </div>

                  {/* RERA Status */}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Project Status
                    </span>

                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      RERA Verified
                    </span>
                  </div>

                  {/* Button */}
                  <Link
                    href={`/listings/${project.id}`}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#fff1f2] border border-[#c41920]/20 py-2.5 text-sm font-semibold text-[#c41920] transition-colors duration-200 hover:bg-[#c41920] hover:text-white"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ================= BOTTOM CTA ================= */}
        <div className="mt-10 overflow-hidden rounded-xl bg-[#191919] px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#c49a4a]" />

                <span className="text-xs font-semibold uppercase tracking-wider text-[#c49a4a]">
                  Latest New Launches
                </span>
              </div>

              <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                Be the first to explore new launches in {activeCity}
              </h3>

              <p className="mt-1 text-sm text-white/55">
                Get early access to the latest verified projects and exclusive opportunities.
              </p>
            </div>

            <Link
              href={`/properties?city=${encodeURIComponent(activeCity)}`}
              className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#b58a3a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c49a4a]"
            >
              Explore {activeCity} Launches
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
