"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Mic,
  ChevronDown,
  Map as MapIcon,
} from "lucide-react";

export default function HeroSection() {
  const router = useRouter();

  // Active Category Tab
  const [activeTab, setActiveTab] = useState("Cities");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [showLocations, setShowLocations] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const dropdownRef = useRef(null);

  const tabs = [
    { label: "Cities", key: "Cities" },
    { label: "Apartments", key: "Apartments" },
    { label: "Branded", key: "Branded" },
    { label: "Luxury", key: "Luxury" },
    { label: "Commercial", key: "Commercial" },
    { label: "Rental", key: "Rental" },
    { label: "Villas", key: "Villas" },
    { label: "Plots / Land", key: "Plots" },
    { label: "Farmhouses", key: "Farmhouses" },
  ];

  const propertyTypeOptions = [
    { label: "All Types", value: "" },
    { label: "Apartment / Flat", value: "FLAT" },
    { label: "Independent House", value: "HOUSE" },
    { label: "Luxury Villa", value: "VILLA" },
    { label: "Plots / Land", value: "PLOT" },
    { label: "Commercial Space", value: "COMMERCIAL" },
    { label: "Builder Floor", value: "BUILDER_FLOOR" },
    { label: "Farmhouse", value: "FARMHOUSE" },
  ];

  const locations = {
    Gurugram: [
      "Golf Course Road",
      "Golf Course Extension",
      "Sector 54",
      "Sector 56",
      "Sector 65",
      "Sector 68",
      "Sector 79",
      "Dwarka Expressway",
      "Sohna Road",
    ],
    Delhi: [
      "Dwarka",
      "Rohini",
      "Pitampura",
      "Janakpuri",
      "Saket",
      "Vasant Kunj",
      "Greater Kailash",
      "Rajouri Garden",
    ],
    Noida: [
      "Sector 15",
      "Sector 18",
      "Sector 50",
      "Sector 62",
      "Sector 75",
      "Sector 137",
      "Sector 150",
    ],
    "Greater Noida": [
      "Pari Chowk",
      "Alpha 1",
      "Beta 1",
      "Greater Noida West",
      "Techzone",
      "Gaur City",
    ],
    Moradabad: [
      "New Moradabad",
      "Ram Ganga Vihar",
      "Civil Lines",
      "Delhi Road",
      "Kanth Road",
    ],
    Meerut: [
      "Shastri Nagar",
      "Pallavpuram",
      "Modipuram",
      "Civil Lines",
      "Delhi Road",
    ],
  };

  // Filter location suggestions
  const getLocationSuggestions = () => {
    if (!location.trim()) return [];
    const searchValue = location.toLowerCase().trim();
    const results = [];

    Object.keys(locations).forEach((city) => {
      if (city.toLowerCase().includes(searchValue)) {
        results.push({ name: city, type: "City" });
      }
      locations[city].forEach((area) => {
        if (area.toLowerCase().includes(searchValue)) {
          results.push({ name: area, type: "Area", city });
        }
      });
    });

    return results.slice(0, 8);
  };

  const suggestions = getLocationSuggestions();

  // Close suggestions when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowLocations(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Speech Recognition (Mic)
  const handleVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice search is not supported in your browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setLocation(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Perform search
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();

    if (location.trim()) {
      params.set("search", location.trim());
    }

    if (propertyType) {
      params.set("propertyType", propertyType);
    }

    if (activeTab === "Rental") {
      params.set("purpose", "RENT");
    } else if (activeTab === "Commercial") {
      params.set("category", "COMMERCIAL");
    } else if (activeTab === "Luxury") {
      params.set("category", "LUXURY");
    } else if (activeTab === "Branded") {
      params.set("category", "BRANDED");
    } else if (activeTab === "Villas") {
      params.set("propertyType", "HOUSE");
    } else if (activeTab === "Plots") {
      params.set("propertyType", "PLOT");
    } else if (activeTab === "Apartments") {
      params.set("propertyType", "FLAT");
    }

    router.push(`/properties?${params.toString()}`);
  };

  // Open map view
  const handleOpenMap = () => {
    const params = new URLSearchParams();
    if (location.trim()) params.set("search", location.trim());
    params.set("view", "map");
    router.push(`/properties?${params.toString()}`);
  };

  // Handle Tab Click
  const handleTabClick = (tab) => {
    setActiveTab(tab.key);
    if (tab.key === "Cities") {
      // default
    } else if (tab.key === "Apartments") {
      setPropertyType("FLAT");
    } else if (tab.key === "Villas") {
      setPropertyType("HOUSE");
    } else if (tab.key === "Plots") {
      setPropertyType("PLOT");
    } else if (tab.key === "Commercial") {
      setPropertyType("COMMERCIAL");
    }
  };

  return (
    <section className="relative w-full bg-slate-100/60">
      {/* =========================================================
          SLIM HERO BANNER (IMAGE FROM BHOOMI WEBSITE)
      ========================================================= */}
      <div className="relative h-[270px] sm:h-[310px] md:h-[340px] w-full overflow-hidden">
        {/* Background Image - Bhoomi website luxury property */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=90')",
          }}
        />

        {/* Multi-layer luxury overlay: Dark silk sheen + warm gold/bronze atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/30 via-transparent to-black/60" />

        {/* Subtle decorative grid lines */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_60%,transparent_100%)]" />

        {/* BANNER CONTENT (Title + Luxury Brands strip) */}
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-start px-4 pt-8 sm:pt-11 text-center">
          {/* Main Title: BRANDED RESIDENCES */}
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-normal tracking-[0.2em] sm:tracking-[0.25em] text-[#f2e6cb] drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)] uppercase">
            BRANDED RESIDENCES
          </h1>

          {/* Subtitle with elegant ornament dashes */}
          <div className="mt-1 sm:mt-2 flex items-center gap-3">
            <span className="h-[1px] w-6 sm:w-12 bg-gradient-to-r from-transparent to-[#d4af37]" />
            <p className="text-[10px] sm:text-xs md:text-sm font-semibold tracking-[0.22em] text-[#e0cfab] uppercase">
              EXCEPTIONAL BRANDS. EXTRAORDINARY LIVING
            </p>
            <span className="h-[1px] w-6 sm:w-12 bg-gradient-to-l from-transparent to-[#d4af37]" />
          </div>


        </div>
      </div>

      {/* =========================================================
          SLIM FLOATING SEARCH BAR (EXACTLY LIKE THE REFERENCE IMAGE)
      ========================================================= */}
      <div className="relative z-20 mx-auto max-w-5xl px-4 -mt-12 sm:-mt-14 md:-mt-16 pb-8 sm:pb-12">
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)]">
          {/* CATEGORY TABS ROW */}
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar border-b border-slate-100 pb-2 mb-3.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabClick(tab)}
                  className={`relative shrink-0 pb-1.5 text-xs sm:text-[13px] transition-all duration-200 ${
                    isActive
                      ? "font-bold text-slate-900"
                      : "font-medium text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                  {/* Red underline on active tab like in reference image */}
                  {isActive && (
                    <span className="absolute bottom-[-9px] left-0 right-0 h-[2.5px] rounded-full bg-[#c41920]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* SEARCH INPUT ROW */}
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3"
          >
            {/* 1. Location Input with Pin & Mic */}
            <div
              ref={dropdownRef}
              className="relative flex-1 w-full flex items-center rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 transition-all focus-within:border-[#c41920] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#c41920]/10"
            >
              <MapPin className="h-4 w-4 shrink-0 text-slate-400 mr-2.5" />
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setShowLocations(true);
                }}
                onFocus={() => {
                  if (location.trim()) setShowLocations(true);
                }}
                placeholder="Search City, Locality or Project..."
                className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-none"
              />

              {/* Mic Icon */}
              <button
                type="button"
                onClick={handleVoiceSearch}
                title={isListening ? "Listening..." : "Search by voice"}
                className={`ml-2 shrink-0 p-1 rounded-lg transition-colors ${
                  isListening
                    ? "text-[#c41920] animate-pulse bg-red-50"
                    : "text-slate-400 hover:text-[#c41920]"
                }`}
              >
                {isListening ? (
                  <Mic className="h-4 w-4 text-[#c41920]" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>

              {/* Suggestions Dropdown */}
              {showLocations && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[110%] z-50 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setLocation(item.name);
                        setShowLocations(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs sm:text-sm hover:bg-red-50/70 hover:text-[#c41920] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium text-slate-800">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {item.type === "City" ? "City" : item.city}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. All Types Select Dropdown */}
            <div className="relative w-full sm:w-44 shrink-0 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 transition-all focus-within:border-[#c41920] focus-within:bg-white">
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-xs sm:text-sm font-medium text-slate-800 outline-none"
              >
                {propertyTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>

            {/* 3. Red Search Button */}
            <button
              type="submit"
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-[#c41920] hover:bg-[#b0161c] px-6 sm:px-7 py-2.5 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>

            {/* 4. Red Map Button */}
            <button
              type="button"
              onClick={handleOpenMap}
              title="View on Map"
              className="hidden sm:flex shrink-0 items-center justify-center rounded-xl bg-[#c41920] hover:bg-[#b0161c] p-2.5 text-white shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <MapIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
