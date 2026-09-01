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
    name: "DLF The Arbour",
    location: "Sector 63, Gurugram",
    price: "₹7.50 Cr",
    type: "Luxury Apartments",
    area: "3950 - 4500 Sq.Ft.",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85",
    tag: "Trending",
  },
  {
    id: 2,
    name: "M3M Golf Hills",
    location: "Sector 79, Gurugram",
    price: "₹2.75 Cr",
    type: "Premium Apartments",
    area: "1650 - 2500 Sq.Ft.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85",
    tag: "Hot Project",
  },
  {
    id: 3,
    name: "Smart World The Edition",
    location: "Sector 66, Gurugram",
    price: "₹4.25 Cr",
    type: "Luxury Apartments",
    area: "2400 - 3200 Sq.Ft.",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85",
    tag: "Popular",
  },
  {
    id: 4,
    name: "Godrej Vriksha",
    location: "Sector 103, Gurugram",
    price: "₹2.90 Cr",
    type: "Luxury Residences",
    area: "1800 - 2800 Sq.Ft.",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85",
    tag: "New Launch",
  },
];

export default function TrendingProjects() {
  const [liked, setLiked] = useState([]);
  const [startIndex, setStartIndex] = useState(0);

  const toggleLike = (id) => {
    setLiked((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const nextProjects = () => {
    setStartIndex((prev) =>
      prev >= projects.length - 1 ? 0 : prev + 1
    );
  };

  const previousProjects = () => {
    setStartIndex((prev) =>
      prev <= 0 ? projects.length - 1 : prev - 1
    );
  };

  return (
    <section className="w-full bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">

        {/* ================= HEADER ================= */}
        <div className="mb-8 flex items-end justify-between">

          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-[2px] w-8 bg-[#c49a4a]" />

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#a27b35]">
                Explore Gurugram
              </span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl lg:text-[40px]">
              Trending Projects in{" "}
              <span className="text-[#b2873a]">
                Gurugram
              </span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm text-gray-500 sm:text-base">
              Discover the most sought-after residential projects
              and premium properties in Gurugram.
            </p>
          </div>

          {/* Desktop arrows */}
          <div className="hidden gap-2 md:flex">
            <button
              onClick={previousProjects}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-[#b2873a] hover:bg-[#b2873a] hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={nextProjects}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-[#b2873a] hover:bg-[#b2873a] hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ================= PROJECT CARDS ================= */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {projects.map((project) => (
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
                <button
                  onClick={() => toggleLike(project.id)}
                  className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-110"
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

                <h3 className="text-lg font-bold text-[#171717] transition group-hover:text-[#b2873a]">
                  {project.name}
                </h3>

                {/* Location */}
                <div className="mt-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-[#b2873a]" />

                  <p className="text-xs text-gray-500">
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
                <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#b2873a] py-2.5 text-sm font-semibold text-[#a17a2d] transition-all duration-300 hover:bg-[#b2873a] hover:text-white">
                  View Details

                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ================= MOBILE ARROWS ================= */}
        <div className="mt-6 flex justify-center gap-2 md:hidden">

          <button
            onClick={previousProjects}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={nextProjects}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

        </div>

        {/* ================= BOTTOM CTA ================= */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-xl bg-[#f8f6f1] px-6 py-6 sm:flex-row sm:px-8">

          <div>
            <h3 className="text-lg font-bold text-[#1c1c1c]">
              Looking for a property in Gurugram?
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Explore thousands of verified properties across Gurugram.
            </p>
          </div>

          <button className="flex items-center gap-2 rounded-lg bg-[#b2873a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#96702c]">
            Explore Gurugram
            <ArrowRight className="h-4 w-4" />
          </button>

        </div>
      </div>
    </section>
  );
}