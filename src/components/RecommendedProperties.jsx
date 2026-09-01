"use client";

import React, { useState } from "react";
import {
  MapPin,
  ArrowRight,
  Heart,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  Maximize,
} from "lucide-react";

const properties = [
  {
    id: 1,
    name: "Tonino Lamborghini Residences",
    location: "Sector 71, Southern Peripheral Road",
    city: "Gurugram, Haryana",
    price: "₹4.49 Cr",
    priceRange: "₹4.49 - 6.15 Cr",
    area: "12.4 Acres",
    possession: "Jan 2033",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85",
    tag: "Founder Choice",
    rera: true,
  },
  {
    id: 2,
    name: "Oberoi Three Sixty North",
    location: "Sector 58, Golf Course Extension Road",
    city: "Gurugram, Haryana",
    price: "₹22 Cr",
    priceRange: "₹22 - 34 Cr",
    area: "14.86 Acres",
    possession: "Mar 2032",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85",
    tag: "Luxury Pick",
    rera: true,
  },
  {
    id: 3,
    name: "Godrej Samaris",
    location: "Sector 53, Golf Course Road",
    city: "Gurugram, Haryana",
    price: "₹9.69 Cr",
    priceRange: "₹9.69 - 12.38 Cr",
    area: "7.5 Acres",
    possession: "Aug 2033",
    image:
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=85",
    tag: "Premium Choice",
    rera: true,
  },
  {
    id: 4,
    name: "M3M Elie Saab at SCDA",
    location: "Sector 111, Dwarka Expressway",
    city: "Gurugram, Haryana",
    price: "₹14.60 Cr",
    priceRange: "₹14.60 - 16.16 Cr",
    area: "15.99 Acres",
    possession: "Feb 2032",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85",
    tag: "Ultra Luxury",
    rera: true,
  },
  {
    id: 5,
    name: "M3M Brabus Residences",
    location: "Sector 58, Golf Course Extension Road",
    city: "Gurugram, Haryana",
    price: "₹20 Cr",
    priceRange: "₹20 - 28 Cr",
    area: "Luxury Residence",
    possession: "Mar 2032",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85",
    tag: "Branded Residence",
    rera: true,
  },
  {
    id: 6,
    name: "BPTP DownTown 66",
    location: "Sector 66, Golf Course Extension Road",
    city: "Gurugram, Haryana",
    price: "₹5.20 Cr",
    priceRange: "₹5.20 - 5.80 Cr",
    area: "Premium Project",
    possession: "Ready Soon",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85",
    tag: "Hot Property",
    rera: true,
  },
];

export default function RecommendedProperties() {
  const [activeCard, setActiveCard] = useState(0);
  const [liked, setLiked] = useState([]);

  const toggleLike = (id) => {
    setLiked((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const nextSlide = () => {
    setActiveCard((prev) =>
      prev >= properties.length - 1 ? 0 : prev + 1
    );
  };

  const previousSlide = () => {
    setActiveCard((prev) =>
      prev <= 0 ? properties.length - 1 : prev - 1
    );
  };

  return (
    <section className="w-full bg-[#f7f7f7] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">

        {/* =========================================
            SECTION HEADER
        ========================================== */}
        <div className="mb-9 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>
            {/* Small label */}
            <div className="mb-3 flex items-center gap-2">
              <span className="h-[2px] w-8 bg-[#d9a441]" />

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#a17a2d]">
                100acress Exclusive
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl lg:text-[42px]">
              bhoomi{" "}
              <span className="text-[#b2873a]">
                Recommended
              </span>
            </h2>

            {/* Description */}
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              Discover premium properties handpicked for luxury living
              and exceptional investment returns.
            </p>
          </div>

          {/* View All */}
          <button className="group flex w-fit items-center gap-2 text-sm font-semibold text-[#222] transition hover:text-[#b2873a]">
            View All Properties

            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>

        {/* =========================================
            DESKTOP CONTROLS
        ========================================== */}
        <div className="mb-5 hidden items-center justify-end gap-2 md:flex">
          <button
            onClick={previousSlide}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-[#b2873a] hover:bg-[#b2873a] hover:text-white"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={nextSlide}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-[#b2873a] hover:bg-[#b2873a] hover:text-white"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* =========================================
            PROPERTY CARDS
        ========================================== */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {properties.slice(0, 4).map((property) => (
            <div
              key={property.id}
              className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.10)]"
            >

              {/* =====================================
                  IMAGE
              ====================================== */}
              <div className="relative h-[245px] overflow-hidden">

                <img
                  src={property.image}
                  alt={property.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />

                {/* Tag */}
                <div className="absolute left-4 top-4 rounded-md bg-[#b58a3a] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg">
                  {property.tag}
                </div>

                {/* RERA */}
                {property.rera && (
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-md bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-[#176b3a] shadow">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    RERA
                  </div>
                )}

                {/* Wishlist */}
                <button
                  onClick={() => toggleLike(property.id)}
                  className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-110"
                  aria-label="Add to wishlist"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      liked.includes(property.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600"
                    }`}
                  />
                </button>

                {/* Starting Price */}
                <div className="absolute bottom-4 left-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-white/75">
                    Starting From
                  </p>

                  <p className="mt-0.5 text-xl font-bold text-white">
                    {property.price}
                  </p>
                </div>
              </div>

              {/* =====================================
                  CONTENT
              ====================================== */}
              <div className="p-5">

                {/* Property Name */}
                <h3 className="line-clamp-1 text-lg font-bold text-[#171717] transition group-hover:text-[#b2873a]">
                  {property.name}
                </h3>

                {/* Location */}
                <div className="mt-2 flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#b2873a]" />

                  <p className="line-clamp-2 text-xs leading-5 text-gray-500">
                    {property.location}, {property.city}
                  </p>
                </div>

                {/* Divider */}
                <div className="my-4 h-px bg-gray-100" />

                {/* Property Details */}
                <div className="grid grid-cols-3 gap-2">

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Maximize className="h-3.5 w-3.5" />

                      <span className="text-[10px]">
                        Area
                      </span>
                    </div>

                    <span className="mt-1 text-xs font-semibold text-gray-700">
                      {property.area}
                    </span>
                  </div>

                  <div className="flex flex-col border-x border-gray-100 px-3">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <CalendarDays className="h-3.5 w-3.5" />

                      <span className="text-[10px]">
                        Possession
                      </span>
                    </div>

                    <span className="mt-1 text-xs font-semibold text-gray-700">
                      {property.possession}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Building2 className="h-3.5 w-3.5" />

                      <span className="text-[10px]">
                        Status
                      </span>
                    </div>

                    <span className="mt-1 text-xs font-semibold text-green-600">
                      RERA
                    </span>
                  </div>

                </div>

                {/* Bottom Action */}
                <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#b2873a] py-2.5 text-sm font-semibold text-[#9b752f] transition-all duration-300 hover:bg-[#b2873a] hover:text-white">
                  View Property

                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* =========================================
            MOBILE SLIDER BUTTONS
        ========================================== */}
        <div className="mt-6 flex justify-center gap-2 md:hidden">

          <button
            onClick={previousSlide}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={nextSlide}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

        </div>

        {/* =========================================
            BOTTOM CTA
        ========================================== */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-xl bg-[#181818] px-6 py-6 sm:flex-row sm:px-8">

          <div>
            <h3 className="text-lg font-bold text-white sm:text-xl">
              Looking for your dream property?
            </h3>

            <p className="mt-1 text-sm text-white/60">
              Explore our handpicked collection of premium properties.
            </p>
          </div>

          <button className="flex shrink-0 items-center gap-2 rounded-lg bg-[#b58a3a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c59b4d]">
            Explore Properties
            <ArrowRight className="h-4 w-4" />
          </button>

        </div>
      </div>
    </section>
  );
}