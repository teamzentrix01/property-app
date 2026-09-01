"use client";

import React, { useState } from "react";
import {
  MapPin,
  Heart,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";

const projects = [
  {
    id: 1,
    name: "BPTP DownTown 66",
    location: "Sector 66, Golf Course Extension Road",
    price: "Price on Request",
    type: "Luxury Apartments",
    image:
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85",
    tag: "New Launch",
  },
  {
    id: 2,
    name: "Experion The Trillion",
    location: "Sector 48, Sohna Road",
    price: "₹6.62 - 8.39 Cr",
    type: "Luxury Apartments",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
    tag: "New Launch",
  },
  {
    id: 3,
    name: "Suncity Monarch",
    location: "Sector 78, Southern Peripheral Road",
    price: "₹3.99 - 5.36 Cr",
    type: "Premium Residences",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
    tag: "Hot Launch",
  },
  {
    id: 4,
    name: "Eldeco Terra & Sol",
    location: "Sector 80, Gurugram",
    price: "₹2.90 - 3.50 Cr",
    type: "Premium Apartments",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85",
    tag: "New Launch",
  },
];

export default function NewLaunchProjects() {
  const [liked, setLiked] = useState([]);

  const toggleLike = (id) => {
    setLiked((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section className="w-full bg-[#f8f8f8] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">

        {/* ================= HEADER ================= */}
        <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            {/* Small Heading */}
            <div className="mb-3 flex items-center gap-2">
              <span className="h-[2px] w-8 bg-[#b58a3a]" />

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#a17a2d]">
                Latest Launches
              </span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl lg:text-[42px]">
              New Launch Projects in{" "}
              <span className="text-[#b2873a]">
                Gurugram
              </span>
            </h2>

            {/* Description */}
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              Explore the latest residential launches from trusted
              developers across Gurugram's prime locations.
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

        {/* ================= CARDS ================= */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {projects.map((project) => (
            <div
              key={project.id}
              className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.11)]"
            >

              {/* ================= IMAGE ================= */}
              <div className="relative h-[245px] overflow-hidden">

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
                <button
                  onClick={() => toggleLike(project.id)}
                  className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-110"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      liked.includes(project.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600"
                    }`}
                  />
                </button>

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
              <div className="p-5">

                {/* Name */}
                <h3 className="text-lg font-bold text-[#171717] transition group-hover:text-[#b2873a]">
                  {project.name}
                </h3>

                {/* Location */}
                <div className="mt-2 flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#b2873a]" />

                  <p className="line-clamp-2 text-xs leading-5 text-gray-500">
                    {project.location}
                  </p>
                </div>

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
                <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#b2873a] py-2.5 text-sm font-semibold text-[#a17a2d] transition-all duration-300 hover:bg-[#b2873a] hover:text-white">
                  View Details

                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ================= BOTTOM CTA ================= */}
        <div className="mt-10 overflow-hidden rounded-xl bg-[#191919] px-6 py-7 sm:px-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#c49a4a]" />

                <span className="text-xs font-semibold uppercase tracking-wider text-[#c49a4a]">
                  Gurugram Real Estate
                </span>
              </div>

              <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                Be the first to explore new launches
              </h3>

              <p className="mt-1 text-sm text-white/55">
                Get early access to the latest projects and exclusive offers.
              </p>
            </div>

            <button className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#b58a3a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c49a4a]">
              Explore New Launches
              <ArrowRight className="h-4 w-4" />
            </button>

          </div>
        </div>

      </div>
    </section>
  );
}