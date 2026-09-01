"use client";

import React, { useState } from "react";
import {
  MapPin,
  Heart,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Crown,
  ConciergeBell,
  Car,
} from "lucide-react";

const residences = [
  {
    id: 1,
    name: "BPTP DownTown 66",
    location: "Sector 66, Golf Course Extension Road",
    city: "Gurugram, Haryana",
    price: "₹5.20 - 5.80 Cr",
    type: "Luxury Residences",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
    brand: "BPTP",
    tag: "Branded Residence",
  },
  {
    id: 2,
    name: "M3M Brabus Residences",
    location: "Sector 58, Golf Course Extension Road",
    city: "Gurugram, Haryana",
    price: "₹20 - 28 Cr",
    type: "Ultra Luxury Residences",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
    brand: "M3M × BRABUS",
    tag: "Ultra Luxury",
  },
  {
    id: 3,
    name: "Trump Residences",
    location: "Sector 69",
    city: "Gurugram, Haryana",
    price: "₹9.27 - 14.81 Cr",
    type: "Branded Luxury Homes",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85",
    brand: "Trump",
    tag: "Signature Collection",
  },
  {
    id: 4,
    name: "M3M Elie Saab at SCDA",
    location: "Sector 111, Dwarka Expressway",
    city: "Gurugram, Haryana",
    price: "₹14.60 - 16.16 Cr",
    type: "Designer Residences",
    image:
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85",
    brand: "M3M × Elie Saab",
    tag: "Designer Living",
  },
];

export default function BrandedResidences() {
  const [liked, setLiked] = useState([]);

  const toggleLike = (id) => {
    setLiked((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section className="w-full bg-[#f7f6f3] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Crown className="h-4 w-4 text-[#b58a3a]" />

              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#a17a2d]">
                100acress Private Collection
              </span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl lg:text-[42px]">
              Branded Residences in{" "}
              <span className="text-[#b2873a]">
                Gurugram
              </span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              Discover signature residences created in collaboration with
              globally recognised luxury brands and premium developers.
            </p>
          </div>

          {/* View All */}
          <button className="group flex w-fit items-center gap-2 text-sm font-semibold text-[#222] transition hover:text-[#b2873a]">
            View All Projects

            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>

        {/* =====================================================
            PROPERTY CARDS
        ====================================================== */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {residences.map((residence) => (
            <div
              key={residence.id}
              className="group overflow-hidden rounded-xl border border-[#e9e5dc] bg-white shadow-[0_5px_25px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.12)]"
            >

              {/* IMAGE */}
              <div className="relative h-[250px] overflow-hidden">

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

                  <span className="text-[10px] font-bold uppercase tracking-wide text-white">
                    {residence.tag}
                  </span>
                </div>

                {/* RERA */}
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-md bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-green-700 shadow">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  RERA
                </div>

                {/* Wishlist */}
                <button
                  onClick={() => toggleLike(residence.id)}
                  className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-110"
                  aria-label="Add to wishlist"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      liked.includes(residence.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600"
                    }`}
                  />
                </button>

                {/* Price */}
                <div className="absolute bottom-4 left-4">
                  <p className="text-[10px] uppercase tracking-widest text-white/65">
                    Starting From
                  </p>

                  <p className="mt-0.5 text-xl font-bold text-white">
                    {residence.price}
                  </p>
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-5">

                {/* Brand */}
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b2873a]">
                  {residence.brand}
                </p>

                {/* Name */}
                <h3 className="mt-1 text-lg font-bold text-[#171717] transition group-hover:text-[#b2873a]">
                  {residence.name}
                </h3>

                {/* Location */}
                <div className="mt-2 flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#b2873a]" />

                  <p className="line-clamp-2 text-xs leading-5 text-gray-500">
                    {residence.location}, {residence.city}
                  </p>
                </div>

                <div className="my-4 h-px bg-gray-100" />

                {/* Property Type */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Property Type
                  </span>

                  <span className="text-right text-xs font-semibold text-gray-700">
                    {residence.type}
                  </span>
                </div>

                {/* RERA */}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Status
                  </span>

                  <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    RERA Verified
                  </span>
                </div>

                {/* Button */}
                <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#b2873a] py-2.5 text-sm font-semibold text-[#a17a2d] transition-all duration-300 hover:bg-[#b2873a] hover:text-white">
                  View Residence

                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* =====================================================
            PRIVATE COLLECTION BANNER
        ====================================================== */}
        <div className="relative mt-10 overflow-hidden rounded-2xl bg-[#171717]">

          {/* Background */}
          <img
            src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1800&q=85"
            alt="Luxury branded residence"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#111] via-[#171717]/90 to-transparent" />

          {/* Content */}
          <div className="relative z-10 px-6 py-10 sm:px-10 lg:px-14 lg:py-12">

            <div className="max-w-3xl">

              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-[#d3aa5d]" />

                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#d3aa5d]">
                  100acress Private Collection
                </span>
              </div>

              <h3 className="mt-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                Where Branded Residences Meet
                <span className="block text-[#d3aa5d]">
                  Architectural Masterpieces
                </span>
              </h3>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
                Indulge in a curated selection of signature branded
                residences crafted with world-class design, premium
                amenities and bespoke lifestyle experiences.
              </p>

              {/* Features */}
              <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3">

                <div className="flex items-center gap-2 text-sm text-white/80">
                  <ConciergeBell className="h-4 w-4 text-[#d3aa5d]" />
                  Concierge Services
                </div>

                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Car className="h-4 w-4 text-[#d3aa5d]" />
                  Valet Services
                </div>

                <div className="flex items-center gap-2 text-sm text-white/80">
                  <BadgeCheck className="h-4 w-4 text-[#d3aa5d]" />
                  RERA Verified
                </div>

              </div>

              {/* CTA */}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                <button className="group flex items-center justify-center gap-2 rounded-lg bg-[#b58a3a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c69d50]">
                  Explore Residences

                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button className="rounded-lg border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-black">
                  Get Instant Callback
                </button>

              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}