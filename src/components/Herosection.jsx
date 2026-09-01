"use client";

import React, { useState } from "react";
import {
  Search,
  MapPin,
  ChevronDown,
  Home,
  Building2,
  KeyRound,
} from "lucide-react";

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState("Buy");
  const [propertyType, setPropertyType] = useState("Property Type");
  const [location, setLocation] = useState("");

  return (
    <section className="relative min-h-[650px] w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=90')",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[650px] max-w-7xl flex-col items-center justify-center px-5 pt-16 text-center">

        {/* Small Top Label */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          Verified Properties Across India
        </div>

        {/* Main Heading */}
        <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Find Your
          <span className="block text-[#f4b942]">
            Dream Property
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
          Discover verified homes, luxury apartments, plots and commercial
          properties at the right price and the right location.
        </p>

        {/* Search Card */}
        <div className="mt-9 w-full max-w-5xl rounded-2xl bg-white p-3 shadow-2xl">

          {/* Tabs */}
          <div className="flex items-center justify-center gap-2 border-b border-gray-200 pb-3 sm:justify-start">
            {["Buy", "Rent", "Commercial"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${activeTab === tab
                    ? "bg-[#111827] text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Fields */}
          <div className="mt-3 flex flex-col gap-3 lg:flex-row">

            {/* Location */}
            <div className="relative flex flex-1 items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left transition hover:border-gray-300">
              <MapPin className="mr-3 h-5 w-5 shrink-0 text-[#e4a928]" />

              <div className="flex-1">
                <p className="text-xs font-medium text-gray-400">
                  Location
                </p>

                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Search city, locality or project"
                  className="mt-1 w-full bg-transparent text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Property Type */}
            <div className="relative flex flex-1 items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left">
              <Home className="mr-3 h-5 w-5 shrink-0 text-[#e4a928]" />

              <div className="flex-1">
                <p className="text-xs font-medium text-gray-400">
                  Property Type
                </p>

                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="mt-1 w-full cursor-pointer appearance-none bg-transparent pr-5 text-sm font-medium text-gray-800 outline-none"
                >
                  <option>Property Type</option>
                  <option>Apartment</option>
                  <option>Independent House</option>
                  <option>Villa</option>
                  <option>Residential Plot</option>
                  <option>Builder Floor</option>
                  <option>Commercial Property</option>
                  <option>Shop</option>
                  <option>Office Space</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={() => {
                console.log({
                  activeTab,
                  location,
                  propertyType,
                });
              }}
              className="flex min-h-[58px] items-center justify-center gap-2 rounded-xl bg-[#e5a92f] px-8 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#d9981f] hover:shadow-xl active:scale-[0.98] lg:min-w-[150px]"
            >
              <Search className="h-5 w-5" />
              Search
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white hover:text-gray-900">
            <Building2 className="h-4 w-4" />
            New Projects
          </button>

          <button className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white hover:text-gray-900">
            <KeyRound className="h-4 w-4" />
            Resale Properties
          </button>

          <button className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-lg transition hover:bg-[#e5a92f] hover:text-white">
            Post Property FREE
          </button>
        </div>

        {/* Trust Stats */}
        <div className="mt-10 grid grid-cols-3 gap-8 border-t border-white/20 pt-6 text-white">
          <div>
            <p className="text-xl font-bold sm:text-2xl">50K+</p>
            <p className="mt-1 text-xs text-white/70 sm:text-sm">
              Properties
            </p>
          </div>

          <div>
            <p className="text-xl font-bold sm:text-2xl">25K+</p>
            <p className="mt-1 text-xs text-white/70 sm:text-sm">
              Happy Customers
            </p>
          </div>

          <div>
            <p className="text-xl font-bold sm:text-2xl">100%</p>
            <p className="mt-1 text-xs text-white/70 sm:text-sm">
              Verified
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}