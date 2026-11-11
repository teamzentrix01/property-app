"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Loader2, 
  ChevronDown, 
  Building2, 
  Compass, 
  ArrowRight,
  Sparkles,
  Search
} from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { detectCity, saveUserCity } from "@/lib/detectCity";
import { CITIES, getNearbyCitySuggestions, normalizeCityName } from "@/constants/cities";

export default function NearbyPropertiesSection() {
  const [city, setCity] = useState("");
  const [source, setSource] = useState("none"); // "saved" | "gps" | "ip" | "none"
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [nearbySuggestions, setNearbySuggestions] = useState([]);

  // Auto-detect city on page load
  useEffect(() => {
    let isMounted = true;

    async function initCity() {
      setLoading(true);
      try {
        const detected = await detectCity();
        if (!isMounted) return;

        const currentCity = detected.city || "Moradabad";
        setCity(currentCity);
        setSource(detected.source);
        setNearbySuggestions(getNearbyCitySuggestions(currentCity));

        await fetchPropertiesForCity(currentCity);
      } catch (err) {
        console.error("City detection error:", err);
        if (isMounted) {
          setCity("Moradabad");
          setSource("none");
          await fetchPropertiesForCity("Moradabad");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initCity();

    // Listen to custom city change event if changed anywhere in app
    const handleCityChanged = (e) => {
      const newCity = e.detail?.city;
      if (newCity && newCity !== city) {
        setCity(newCity);
        setSource("saved");
        setNearbySuggestions(getNearbyCitySuggestions(newCity));
        fetchPropertiesForCity(newCity);
      }
    };

    window.addEventListener("bhoomi-city-changed", handleCityChanged);
    return () => {
      isMounted = false;
      window.removeEventListener("bhoomi-city-changed", handleCityChanged);
    };
  }, []);

  // Force re-detect GPS live location (bypassing saved localStorage)
  const handleDetectLiveGPS = async () => {
    setLoading(true);
    setDropdownOpen(false);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("userCity");
      }
      const detected = await detectCity({ forceGps: true });
      const currentCity = detected.city || "Moradabad";
      setCity(currentCity);
      setSource(detected.source);
      setNearbySuggestions(getNearbyCitySuggestions(currentCity));
      await fetchPropertiesForCity(currentCity);
    } catch (err) {
      console.warn("GPS live detection failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch properties from GET /api/properties?city=
  const fetchPropertiesForCity = async (cityName) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties?city=${encodeURIComponent(cityName)}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      } else {
        setProperties([]);
      }
    } catch (e) {
      console.error("Fetch properties error:", e);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // User manually selects a city from dropdown or nearby suggestions
  const handleCitySelect = (selectedCityName) => {
    const normalized = normalizeCityName(selectedCityName) || selectedCityName;
    saveUserCity(normalized); // Saves to localStorage so auto-detect won't overwrite
    setCity(normalized);
    setSource("saved");
    setDropdownOpen(false);
    setNearbySuggestions(getNearbyCitySuggestions(normalized));
    fetchPropertiesForCity(normalized);
  };

  return (
    <section className="w-full bg-[#fbf9f9] py-10 sm:py-14 border-t border-b border-gray-200/70">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-zinc-900 to-[#8e1016] p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-red-300 backdrop-blur-md mb-3 border border-white/10">
                <Compass className="h-3.5 w-3.5 text-red-400" />
                <span>City Property Explorer</span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Showing properties in <span className="text-white underline decoration-[#c41920] decoration-4 underline-offset-4">{city || "Your City"}</span>
                {source === "ip" && (
                  <span className="ml-2 text-xs font-normal text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 align-middle">
                    (approximate)
                  </span>
                )}
              </h2>

              <p className="mt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Discover verified residential plots, apartments, and commercial projects located in {city}.
              </p>
            </div>

            {/* Change City Dropdown Selector */}
            <div className="relative shrink-0 z-30">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs sm:text-sm font-bold text-gray-900 shadow-xl hover:bg-gray-50 active:scale-95 transition cursor-pointer"
              >
                <MapPin className="h-4 w-4 text-[#c41920]" />
                <span>Change City ({city || "Select"})</span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 w-72 max-h-80 overflow-y-auto rounded-2xl bg-white p-2 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
                    {/* Live GPS Re-detect Option */}
                    <div className="p-1 border-b border-gray-100">
                      <button
                        type="button"
                        onClick={handleDetectLiveGPS}
                        className="w-full flex items-center gap-2 rounded-xl bg-red-50 p-2.5 text-xs font-bold text-[#c41920] hover:bg-[#c41920] hover:text-white transition cursor-pointer"
                      >
                        <Compass className="h-4 w-4 shrink-0 animate-spin-slow" />
                        <span>Detect My Live GPS Location</span>
                      </button>
                    </div>

                    <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Select Your City
                      </p>
                      <span className="text-[10px] text-gray-400">{CITIES.length} cities</span>
                    </div>
                    <div className="space-y-0.5 mt-1">
                      {CITIES.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleCitySelect(c.name)}
                          className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold text-left transition cursor-pointer ${
                            c.name.toLowerCase() === city.toLowerCase()
                              ? "bg-red-50 text-[#c41920] font-bold"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span>{c.name}</span>
                          <span className="text-[10px] text-gray-400">{c.state}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-gray-100 animate-pulse border border-gray-200/60" />
            ))}
          </div>
        )}

        {/* Loaded Results */}
        {!loading && properties.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-display text-xl font-bold text-gray-900">
                  {properties.length} Verified Properties in {city}
                </h3>
              </div>
              <Link 
                href={`/properties?city=${encodeURIComponent(city)}`}
                className="text-xs font-bold text-[#c41920] hover:underline inline-flex items-center gap-1"
              >
                <span>View all in {city}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((p) => (
                <PropertyCard key={p.id} listing={p} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State with Nearby City Suggestions */}
        {!loading && properties.length === 0 && (
          <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-8 sm:p-12 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4">
              <Building2 className="h-7 w-7 text-amber-600" />
            </div>

            <h3 className="font-display text-xl font-bold text-gray-900">
              No active properties found in {city} right now
            </h3>
            <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
              We are constantly expanding our verified listings. In the meantime, explore properties in nearby cities:
            </p>

            {/* Paas ki Cities ke suggestions */}
            {nearbySuggestions.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Nearby City Suggestions:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {nearbySuggestions.map((suggestedCity) => (
                    <button
                      key={suggestedCity}
                      type="button"
                      onClick={() => handleCitySelect(suggestedCity)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2 text-xs font-bold text-gray-800 hover:border-[#c41920] hover:bg-red-50 hover:text-[#c41920] transition cursor-pointer shadow-2xs"
                    >
                      <MapPin className="h-3.5 w-3.5 text-[#c41920]" />
                      <span>{suggestedCity}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 rounded-xl bg-[#c41920] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#8e1016] transition shadow-xs"
              >
                <span>Browse All Properties Across India</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
