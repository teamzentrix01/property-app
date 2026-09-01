"use client";

import React, { useState } from "react";
import {
  MapPin,
  Heart,
  ArrowRight,
  BadgeCheck,
  Building2,
  Store,
  BriefcaseBusiness,
} from "lucide-react";

const projects = [
  {
    id: 1,
    name: "EBD 114",
    location: "Sector 114, Dwarka Expressway",
    city: "Gurugram, Haryana",
    price: "₹3.23 - 6.60 Cr",
    type: "SCO Plots",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=90",
    tag: "Featured",
    developer: "EBD",
  },
  {
    id: 2,
    name: "DLF Central 67",
    location: "Sector 67, Golf Course Extension Road",
    city: "Gurugram, Haryana",
    price: "₹7.50 - 26.41 Cr",
    type: "SCO / Commercial",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=90",
    tag: "Premium",
    developer: "DLF",
  },
  {
    id: 3,
    name: "Microtek Grandfront",
    location: "Sector 81, New Gurgaon",
    city: "Gurugram, Haryana",
    price: "₹3.96 - 5.16 Cr",
    type: "SCO Plots",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=90",
    tag: "Investment Pick",
    developer: "Microtek",
  },
  {
    id: 4,
    name: "Aarize South Drive",
    location: "Sector 69, Southern Peripheral Road",
    city: "Gurugram, Haryana",
    price: "₹3.99 - 6.24 Cr",
    type: "SCO / Commercial",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=90",
    tag: "Hot Project",
    developer: "Aarize",
  },
];

export default function SCOProjects() {
  const [liked, setLiked] = useState([]);

  const toggleLike = (id) => {
    setLiked((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section className="w-full bg-[#f7f7f7] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">

        {/* ================= HEADER ================= */}
        <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            {/* Label */}
            <div className="mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#b58a3a]" />

              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#a17a2d]">
                Shop Cum Office Collection
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl lg:text-[42px]">
              SCO Projects in{" "}
              <span className="text-[#b2873a]">
                Gurugram
              </span>
            </h2>

            {/* Description */}
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              Explore premium Shop-Cum-Office plots in Gurugram's
              high-growth commercial corridors, ideal for business and
              long-term investment.
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

        {/* ================= PROJECT CARDS ================= */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {projects.map((project) => (
            <article
              key={project.id}
              className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_5px_22px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.12)]"
            >

              {/* ================= IMAGE ================= */}
              <div className="relative h-[245px] overflow-hidden">

                <img
                  src={project.image}
                  alt={project.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/20" />

                {/* Tag */}
                <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-md bg-[#b58a3a] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg">
                  <Store className="h-3 w-3" />
                  {project.tag}
                </div>

                {/* RERA */}
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-md bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-green-700 shadow">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  RERA
                </div>

                {/* Wishlist */}
                <button
                  onClick={() => toggleLike(project.id)}
                  className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-110"
                  aria-label="Add to wishlist"
                >
                  <Heart
                    className={`h-4 w-4 transition ${
                      liked.includes(project.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600"
                    }`}
                  />
                </button>

                {/* Price */}
                <div className="absolute bottom-4 left-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/65">
                    Starting From
                  </p>

                  <p className="mt-0.5 text-xl font-bold text-white">
                    {project.price}
                  </p>
                </div>
              </div>

              {/* ================= CONTENT ================= */}
              <div className="p-5">

                {/* Developer */}
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b2873a]">
                  {project.developer}
                </p>

                {/* Project Name */}
                <h3 className="mt-1 line-clamp-1 text-lg font-bold text-[#171717] transition group-hover:text-[#b2873a]">
                  {project.name}
                </h3>

                {/* Location */}
                <div className="mt-2 flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#b2873a]" />

                  <p className="line-clamp-2 text-xs leading-5 text-gray-500">
                    {project.location}, {project.city}
                  </p>
                </div>

                {/* Divider */}
                <div className="my-4 h-px bg-gray-100" />

                {/* Property Type */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-400">
                    Property Type
                  </span>

                  <span className="text-right text-xs font-semibold text-gray-700">
                    {project.type}
                  </span>
                </div>

                {/* Investment */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Investment
                  </span>

                  <span className="text-xs font-semibold text-[#a17a2d]">
                    High Potential
                  </span>
                </div>

                {/* RERA */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Project Status
                  </span>

                  <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    RERA Verified
                  </span>
                </div>

                {/* Button */}
                <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#b2873a] py-2.5 text-sm font-semibold text-[#a17a2d] transition-all duration-300 hover:bg-[#b2873a] hover:text-white">
                  View Details

                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* ================= BOTTOM CTA ================= */}
        <div className="relative mt-10 overflow-hidden rounded-2xl bg-[#181818]">

          {/* Decorative circles */}
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-[#b58a3a]/20" />

          <div className="absolute -right-5 -top-10 h-44 w-44 rounded-full border border-[#b58a3a]/15" />

          <div className="relative z-10 flex flex-col gap-6 px-6 py-8 sm:px-9 lg:flex-row lg:items-center lg:justify-between lg:px-12">

            <div>
              <div className="flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4 text-[#d3aa5d]" />

                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#d3aa5d]">
                  SCO Investment
                </span>
              </div>

              <h3 className="mt-2 text-2xl font-bold text-white">
                Build your business at a prime location.
              </h3>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
                Discover strategically located SCO plots suitable for
                retail, offices, showrooms and modern business spaces.
              </p>
            </div>

            <button className="group flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#b58a3a] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#c69d50]">
              Explore SCO Projects

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}