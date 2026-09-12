"use client";

import { useEffect, useState } from "react";
import { Images, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export default function PropertyGallery({ photos = [], title }) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowLeft" && active !== null) {
        setActive((prev) => (prev - 1 + photos.length) % photos.length);
      }
      if (e.key === "ArrowRight" && active !== null) {
        setActive((prev) => (prev + 1) % photos.length);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [active, photos.length]);

  if (!photos.length) {
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

  const count = photos.length;

  return (
    <>
      <div
        className={`group relative grid overflow-hidden rounded-3xl border border-gray-200/70 bg-gray-900 shadow-md ${
          count === 1
            ? "grid-cols-1"
            : count === 2
            ? "grid-cols-1 md:grid-cols-[1.35fr_1fr] gap-1.5"
            : "grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-1.5"
        }`}
      >
        {/* Main / Left Big Photo */}
        <button
          type="button"
          onClick={() => setActive(0)}
          className={`relative overflow-hidden bg-gray-950 text-left transition ${
            count === 1
              ? "h-[360px] sm:h-[440px] md:h-[500px]"
              : count === 2
              ? "h-[320px] sm:h-[400px] md:h-[480px]"
              : "row-span-2 h-[340px] sm:h-[420px] md:h-[480px]"
          }`}
        >
          <img
            src={photos[0].url}
            alt={title}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none opacity-60" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 pointer-events-none">
            <span className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
              <Maximize2 className="h-3.5 w-3.5" />
              Click to enlarge
            </span>
          </div>
        </button>

        {/* Second Photo if 2 photos */}
        {count === 2 && (
          <button
            type="button"
            onClick={() => setActive(1)}
            className="relative hidden h-[480px] overflow-hidden bg-gray-950 md:block"
          >
            <img
              src={photos[1].url}
              alt={`${title} photo 2`}
              className="h-full w-full object-cover transition duration-700 ease-out hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />
          </button>
        )}

        {/* Right Stack for 3+ photos */}
        {count >= 3 && (
          <div className="hidden grid-rows-2 gap-1.5 md:grid">
            {photos.slice(1, 3).map((p, i) => (
              <button
                type="button"
                key={p.id || p.url}
                onClick={() => setActive(i + 1)}
                className="relative h-[236px] overflow-hidden bg-gray-950"
              >
                <img
                  src={p.url}
                  alt={`${title} photo ${i + 2}`}
                  className="h-full w-full object-cover transition duration-700 ease-out hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />
              </button>
            ))}
          </div>
        )}

        {/* Floating View All Button */}
        <button
          type="button"
          onClick={() => setActive(0)}
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-4 py-2.5 text-xs font-bold text-white shadow-xl backdrop-blur-md transition duration-200 hover:bg-black/90 hover:scale-[1.02]"
        >
          <Images className="h-4 w-4 text-[#ff4d4f]" />
          <span>
            View all {count} photo{count !== 1 ? "s" : ""}
          </span>
        </button>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {active !== null && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 text-white">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">
                {active + 1} / {count}
              </span>
              <p className="hidden sm:block text-xs font-medium text-white/70 truncate max-w-md">
                {title}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Central Viewer */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4 sm:p-8">
            <img
              src={photos[active].url}
              alt={`${title} fullscreen photo ${active + 1}`}
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl transition-all duration-300"
            />

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActive((active - 1 + count) % count)}
                  className="absolute left-4 sm:left-8 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white border border-white/10 backdrop-blur-md transition hover:bg-[#c41920] hover:scale-105"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setActive((active + 1) % count)}
                  className="absolute right-4 sm:right-8 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white border border-white/10 backdrop-blur-md transition hover:bg-[#c41920] hover:scale-105"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
