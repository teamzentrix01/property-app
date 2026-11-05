"use client";

import React, { useState } from "react";
import { MapPin, SlidersHorizontal, X, Check, Sparkles } from "lucide-react";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { useRouter } from "next/navigation";

export default function HomeLocationBar({ user, initialLocation }) {
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState(
    initialLocation || user?.preferredLocation || user?.preferredCity || ""
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState(currentLocation);
  const [selectedCity, setSelectedCity] = useState(user?.preferredCity || "");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // If user is not logged in, don't show the bar
  if (!user) return null;

  const hasLocation = Boolean(currentLocation);

  const handleSave = async () => {
    if (!selectedLoc.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          preferredLocation: selectedLoc,
          preferredCity: selectedCity || selectedLoc,
        }),
      });

      if (res.ok) {
        setCurrentLocation(selectedLoc);
        setSavedSuccess(true);
        setTimeout(() => {
          setModalOpen(false);
          setSavedSuccess(false);
          window.dispatchEvent(new Event("bhoomi-location-changed"));
          router.refresh();
        }, 600);
      }
    } catch (e) {
      console.error("Failed to save location", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="w-full bg-gradient-to-r from-[#fff8f8] via-white to-[#fff1f2] border-y border-[#c41920]/15 py-3 px-4 shadow-2xs">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#c41920]/10 text-[#c41920]">
              <Sparkles className="h-4 w-4 text-[#c41920]" />
            </span>
            {hasLocation ? (
              <p className="text-gray-700 font-medium">
                Showing personalized properties near{" "}
                <span className="font-bold text-[#c41920] underline decoration-[#c41920]/40 decoration-2 underline-offset-2">
                  {currentLocation}
                </span>
              </p>
            ) : (
              <p className="text-gray-700 font-medium">
                Set your preferred location to discover tailored property recommendations around you.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#c41920]/30 bg-white px-3 py-1.5 text-xs font-bold text-[#c41920] shadow-2xs transition hover:bg-[#c41920] hover:text-white"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>{hasLocation ? "Change Location" : "Set Preferred Location"}</span>
          </button>
        </div>
      </div>

      {/* Change Location Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 sm:p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 text-[#c41920]">
              <MapPin className="h-5 w-5" />
              <h3 className="font-display text-xl font-bold text-gray-950">
                {hasLocation ? "Change Preferred Location" : "Select Your Preferred Location"}
              </h3>
            </div>

            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              Choose your city or sector. Bhoomi will automatically prioritize properties in this area, including nearby localities and adjacent cities if exact matches are unavailable.
            </p>

            <div className="mt-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                City, Locality, or Sector
              </label>
              <LocationAutocomplete
                value={selectedLoc}
                placeholder="Search Noida, Delhi, Moradabad, Meerut, etc."
                onChange={(text, item) => {
                  setSelectedLoc(text);
                  if (item?.city) setSelectedCity(item.city);
                }}
                onSelect={(item) => {
                  setSelectedLoc(item.fullAddress || item.label);
                  setSelectedCity(item.city || "");
                }}
              />
            </div>

            <div className="mt-6 flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !selectedLoc.trim()}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#c41920] py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[#a8141a] disabled:opacity-50"
              >
                {savedSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Location Saved!</span>
                  </>
                ) : saving ? (
                  "Updating recommendations…"
                ) : (
                  "Save & Personalize"
                )}
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

