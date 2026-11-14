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

export default function BrandedResidences({ groupedData = {}, listings = [] }) {
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
    if (Object.keys(groupedData || {}).length > 0) {
      setClientData(groupedData);
    } else {
      fetch("/api/homepage/rotating-sections")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.branded && Object.keys(data.branded).length > 0) {
            setClientData(data.branded);
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

  const residences = activeProperties.slice(0, 4).map((listing) => ({
    id: listing.id,
    name: listing.title,
    location: listing.area,
    city: listing.city,
    price: formatPrice(listing.price, listing.purpose),
    type: listing.propertyType,
    image: listing.photos?.[0]?.url || "/file.svg",
    brand: listing.propertyType || "Exclusive",
    tag: "Branded Residence",
  }));

  return (
    <section className="w-full bg-[#f7f6f3] py-16 sm:py-20 lg:py-12">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
        {/* ================= HEADER ================= */}
        <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Crown className="h-4 w-4 text-[#b58a3a]" />

              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#b58a3a]">
                Bhoomi Private Collection
              </span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl lg:text-[42px]">
              Branded Residences in{" "}
              <span className="text-[#c41920] transition-opacity duration-300">
                {activeCity}
              </span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              Discover signature residences created in collaboration with
              globally recognised luxury brands and premium developers in {activeCity}.
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
              href={`/properties?city=${encodeURIComponent(activeCity)}&category=branded`}
              className="group flex w-fit items-center gap-2 text-sm font-semibold text-[#222] transition hover:text-[#b58a3a]"
            >
              View All in {activeCity}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* ================= PROPERTY CARDS ================= */}
        <div
          className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 transition-opacity duration-300 ${
            isTransitioning ? "opacity-30" : "opacity-100"
          }`}
        >
          {residences.length === 0 ? (
            <div className="col-span-full py-12 text-center text-sm text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
              No branded residences available in {activeCity} right now.
            </div>
          ) : (
            residences.map((residence) => (
              <div
                key={residence.id}
                className="card-red-hover group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_5px_25px_rgba(0,0,0,0.05)] transition-all duration-250 hover:border-[#c41920]/40 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* IMAGE */}
                <div className="relative h-[175px] overflow-hidden">
                  <img
                    src={residence.image}
                    alt={residence.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/25" />

                  {/* Brand Badge */}
                  <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-md border border-white/20 bg-black/50 px-3 py-1.5 backdrop-blur-md">
                    <Crown className="h-3.5 w-3.5 text-[#e1bb70]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#f5ebd7]">
                      {residence.brand}
                    </span>
                  </div>

                  {/* Wishlist */}
                  <SaveListingButton
                    listingId={residence.id}
                    className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-110"
                  />

                  {/* Price */}
                  <div className="absolute bottom-4 left-4">
                    <p className="text-[10px] uppercase tracking-wider text-white/70">
                      Signature Price
                    </p>
                    <p className="text-xl font-bold text-white">
                      {residence.price}
                    </p>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-4">
                  {/* Location */}
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0 text-[#c41920]" />
                    <p className="line-clamp-1 text-xs text-gray-500">
                      {residence.location}, {residence.city}
                    </p>
                  </div>

                  {/* Price */}
                  <p className="mt-1 text-lg font-bold text-[#c41920]">
                    {residence.price}
                  </p>

                  {/* Title */}
                  <h3 className="line-clamp-1 text-lg font-bold text-[#171717] transition group-hover:text-[#c41920]">
                    {residence.name}
                  </h3>

                  {/* Divider */}
                  <div className="my-4 h-px bg-gray-100" />

                  {/* Residence Type */}
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">
                      Residence Type
                    </span>
                    <span className="text-xs font-semibold text-gray-700">
                      {residence.type}
                    </span>
                  </div>

                  {/* Experience */}
                  <div className="mt-2 flex justify-between">
                    <span className="text-xs text-gray-400">
                      Exclusivity
                    </span>
                    <span className="text-xs font-semibold text-[#b58a3a]">
                      {residence.tag}
                    </span>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/listings/${residence.id}`}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#fff1f2] border border-[#c41920]/20 py-2.5 text-sm font-semibold text-[#c41920] transition-colors duration-200 hover:bg-[#c41920] hover:text-white"
                  >
                    Explore Residence
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ================= BOTTOM LUXURY BANNER ================= */}
        <div className="mt-14 overflow-hidden rounded-2xl bg-gradient-to-r from-[#171717] via-[#222222] to-[#121212] p-8 text-white sm:p-10 border border-white/10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#e1bb70]">
                Curated Luxury in {activeCity}
              </span>

              <h3 className="mt-2 text-2xl font-bold sm:text-3xl">
                Where Branded Residences Meet Architectural Masterpieces
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                Live among extraordinary communities offering bespoke hospitality, private amenities and prestigious addresses in {activeCity}.
              </p>
            </div>

            <Link
              href={`/properties?city=${encodeURIComponent(activeCity)}&category=branded`}
              className="flex w-fit items-center gap-2 rounded-lg bg-[#b58a3a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c99f4d]"
            >
              Explore {activeCity} Residences
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
