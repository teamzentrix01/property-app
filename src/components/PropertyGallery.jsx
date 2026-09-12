"use client";

import { useEffect, useState, useRef } from "react";
import { Images, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export default function PropertyGallery({ photos = [], title }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const thumbnailsRef = useRef(null);

  const count = photos.length;

  const getUrl = (p) => (typeof p === "string" ? p : p?.url || "");

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex !== null) {
        if (e.key === "Escape") setLightboxIndex(null);
        if (e.key === "ArrowLeft") {
          setLightboxIndex((prev) => (prev - 1 + count) % count);
        }
        if (e.key === "ArrowRight") {
          setLightboxIndex((prev) => (prev + 1) % count);
        }
      } else if (count > 1) {
        if (e.key === "ArrowLeft") {
          setSelectedIndex((prev) => (prev - 1 + count) % count);
        }
        if (e.key === "ArrowRight") {
          setSelectedIndex((prev) => (prev + 1) % count);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, count]);

  if (!count) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-3xl border border-gray-200/80 bg-gradient-to-b from-gray-50 to-gray-100 text-gray-400 shadow-inner md:h-[420px]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs text-gray-400 mb-3">
          <Images className="h-7 w-7" />
        </div>
        <p className="text-sm font-medium text-gray-500">Photographs arriving shortly</p>
        <p className="text-xs text-gray-400 mt-1">Verified on-ground site visit available</p>
      </div>
    );
  }

  const currentPhotoUrl = getUrl(photos[selectedIndex] || photos[0]);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 rounded-3xl bg-gray-900/5 p-2 sm:p-3 border border-gray-200/80 shadow-sm">
        {/* =========================================
            MAIN FULL IMAGE VIEW (Left/Center)
        ========================================== */}
        <div className="relative flex-1 h-[340px] sm:h-[420px] md:h-[500px] lg:h-[520px] overflow-hidden rounded-2xl bg-black group select-none">
          {/* Ambient blurred backdrop */}
          <img
            src={currentPhotoUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
          />

          {/* Main Photo (Click to open fullscreen) */}
          <img
            key={currentPhotoUrl}
            src={currentPhotoUrl}
            alt={`${title} - Photo ${selectedIndex + 1}`}
            className="relative z-10 h-full w-full object-cover cursor-pointer transition duration-300 group-hover:scale-[1.01]"
            onClick={() => setLightboxIndex(selectedIndex)}
          />

          {/* Subtle gradient overlays */}
          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-transparent to-black/25" />

          {/* Top Info Bar */}
          <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
            <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/15">
              {selectedIndex + 1} / {count}
            </span>

            <button
              type="button"
              onClick={() => setLightboxIndex(selectedIndex)}
              className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md border border-white/15 transition hover:bg-[#c41920] hover:border-[#c41920]"
              title="View fullscreen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>
          </div>

          {/* Navigation Arrows on Main Photo */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev - 1 + count) % count);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 transition hover:bg-[#c41920] hover:border-[#c41920] hover:scale-110 active:scale-95"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev + 1) % count);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 transition hover:bg-[#c41920] hover:border-[#c41920] hover:scale-110 active:scale-95"
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Bottom Controls Bar */}
          <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
            <span className="text-xs font-medium text-white/90 drop-shadow-sm flex items-center gap-1.5">
              <span className="hidden sm:inline">Click image to enlarge or click any side thumbnail</span>
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(selectedIndex);
              }}
              className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#c41920] px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-[#a8141a] hover:scale-105 active:scale-95"
            >
              <Images className="h-4 w-4" />
              <span>View all {count} photos</span>
            </button>
          </div>
        </div>

        {/* =========================================
            SIDE THUMBNAILS (Clickable Side Rail)
        ========================================== */}
        {count > 1 && (
          <div
            ref={thumbnailsRef}
            className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto md:w-[220px] lg:w-[260px] xl:w-[280px] md:h-[500px] lg:h-[520px] p-1 scrollbar-thin scrollbar-thumb-gray-300"
            style={{ scrollbarWidth: "thin" }}
          >
            {photos.map((photo, index) => {
              const url = getUrl(photo);
              const isCurrent = index === selectedIndex;

              return (
                <button
                  key={photo.id || url || index}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`group/thumb relative shrink-0 overflow-hidden rounded-xl bg-gray-950 text-left transition-all duration-200 focus:outline-none ${
                    isCurrent
                      ? "ring-3 ring-[#c41920] shadow-md scale-[1.01]"
                      : "opacity-75 hover:opacity-100 hover:ring-2 hover:ring-gray-400"
                  } w-[100px] h-[72px] sm:w-[120px] sm:h-[84px] md:w-full md:h-[115px] lg:md:h-[120px]`}
                >
                  <img
                    src={url}
                    alt={`${title} thumbnail ${index + 1}`}
                    className="h-full w-full object-cover transition duration-300 group-hover/thumb:scale-105"
                  />

                  {/* Thumbnail number tag */}
                  <span
                    className={`absolute top-1.5 left-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold backdrop-blur-md ${
                      isCurrent
                        ? "bg-[#c41920] text-white"
                        : "bg-black/60 text-white/90"
                    }`}
                  >
                    #{index + 1}
                  </span>

                  {/* Active Indicator Overlay */}
                  {isCurrent && (
                    <div className="absolute inset-0 border-2 border-[#c41920] rounded-xl pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================
          FULLSCREEN LIGHTBOX MODAL
      ========================================== */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 text-white">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
                {lightboxIndex + 1} / {count}
              </span>
              <p className="hidden sm:block text-xs font-medium text-white/70 truncate max-w-md">
                {title}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Central Viewer */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4 sm:p-8">
            <img
              src={getUrl(photos[lightboxIndex])}
              alt={`${title} fullscreen photo ${lightboxIndex + 1}`}
              className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl transition-all duration-300"
            />

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setLightboxIndex((prev) => (prev - 1 + count) % count)}
                  className="absolute left-4 sm:left-8 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white border border-white/10 backdrop-blur-md transition hover:bg-[#c41920] hover:scale-105"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxIndex((prev) => (prev + 1) % count)}
                  className="absolute right-4 sm:right-8 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white border border-white/10 backdrop-blur-md transition hover:bg-[#c41920] hover:scale-105"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip in Lightbox */}
          {count > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-3 px-4 border-t border-white/10 bg-black/40">
              {photos.map((p, idx) => {
                const url = getUrl(p);
                const isSelected = idx === lightboxIndex;
                return (
                  <button
                    key={p.id || url || idx}
                    type="button"
                    onClick={() => {
                      setLightboxIndex(idx);
                      setSelectedIndex(idx);
                    }}
                    className={`relative shrink-0 h-14 w-20 rounded-lg overflow-hidden transition-all duration-150 ${
                      isSelected
                        ? "ring-2 ring-[#c41920] scale-105 opacity-100"
                        : "opacity-50 hover:opacity-90"
                    }`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
