"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Calendar, Heart, Share2, MessageCircle } from "lucide-react";

export default function PropertyActions({ listing, compact = false, isLoggedIn = false }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(isLoggedIn);
  const [message, setMessage] = useState(
    `Hi, I am interested in ${listing.title} at ${listing.area}, ${listing.city}. Please share complete details and your best quote.`,
  );
  const [status, setStatus] = useState("");
  const phone = String(listing.phone || listing.contactNumber || "")
    .replace(/\D/g, "")
    .slice(-10);
  const whatsapp = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

  useEffect(() => {
    const handleOpenInquiry = () => {
      if (!userLoggedIn) {
        router.push(`/login?next=/listings/${listing.id}`);
      } else {
        setOpen(true);
      }
    };
    window.addEventListener("open-property-inquiry", handleOpenInquiry);
    return () => window.removeEventListener("open-property-inquiry", handleOpenInquiry);
  }, [userLoggedIn, listing.id, router]);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUserLoggedIn(true);
        } else if (data && !data.user) {
          setUserLoggedIn(false);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/saved", { credentials: "include", cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { ids: [] }))
      .then((data) => setSaved((data.ids || []).includes(listing.id)))
      .catch(() => setSaved(false));
  }, [listing.id]);

  async function save() {
    if (!userLoggedIn) {
      return router.push(`/login?next=/listings/${listing.id}`);
    }
    const res = await fetch(
      `/api/saved${saved ? `?listingId=${listing.id}` : ""}`,
      {
        method: saved ? "DELETE" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...(saved ? {} : { body: JSON.stringify({ listingId: listing.id }) }),
      },
    );
    if (res.status === 401)
      return router.push(`/login?next=/listings/${listing.id}`);
    if (res.ok) setSaved(!saved);
  }

  async function enquire() {
    if (!userLoggedIn) {
      return router.push(`/login?next=/listings/${listing.id}`);
    }
    setStatus("Sending…");
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: listing.id, message }),
    });
    if (res.status === 401)
      return router.push(`/login?next=/listings/${listing.id}`);
    const data = await res.json();
    setStatus(
      res.ok
        ? "Request sent. The seller can contact you from your profile details."
        : data.error || "Could not send request",
    );
    if (res.ok) setTimeout(() => setOpen(false), 1600);
  }

  async function share() {
    const url = `${window.location.origin}/listings/${listing.id}`;
    if (navigator.share)
      return navigator
        .share({
          title: listing.title,
          text: `View ${listing.title} in ${listing.area}, ${listing.city}`,
          url,
        })
        .catch(() => {});
    await navigator.clipboard?.writeText(url);
    setStatus("Property link copied.");
  }

  if (compact)
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!userLoggedIn) {
            return router.push(`/login?next=/listings/${listing.id}`);
          }
          save();
        }}
        aria-label="Save property"
        className={`grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-sm ${saved ? "text-red-600" : "text-red-600"}`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
        </svg>
      </button>
    );

  return (
    <>
      <div className="grid gap-2.5">
        {!userLoggedIn ? (
          <button
            type="button"
            onClick={() => router.push(`/login?next=/listings/${listing.id}`)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 py-3 text-center text-sm font-bold text-white shadow-sm transition duration-200 hover:bg-green-800"
          >
            <MessageCircle className="h-4 w-4 text-white shrink-0" />
            <span>Get Best Quote on WhatsApp</span>
          </button>
        ) : (
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 py-3 text-center text-sm font-bold text-white shadow-sm transition duration-200 hover:bg-green-800"
          >
            <MessageCircle className="h-4 w-4 text-white shrink-0" />
            <span>Get Best Quote on WhatsApp</span>
          </a>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          {!userLoggedIn ? (
            <button
              type="button"
              onClick={() => router.push(`/login?next=/listings/${listing.id}`)}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#c41920] px-3 py-3 text-center text-xs sm:text-sm font-extrabold text-white shadow-sm transition-all duration-200 hover:bg-[#a51319] hover:shadow-md active:scale-95"
            >
              <Phone className="h-4 w-4 shrink-0 text-white" />
              <span>Call Now</span>
            </button>
          ) : (
            <a
              href={`tel:${phone}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#c41920] px-3 py-3 text-center text-xs sm:text-sm font-extrabold text-white shadow-sm transition-all duration-200 hover:bg-[#a51319] hover:shadow-md active:scale-95"
            >
              <Phone className="h-4 w-4 shrink-0 text-white" />
              <span>Call Now</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => {
              if (!userLoggedIn) {
                return router.push(`/login?next=/listings/${listing.id}`);
              }
              setOpen(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-3 text-center text-xs sm:text-sm font-extrabold text-white shadow-sm transition-all duration-200 hover:bg-black hover:shadow-md active:scale-95"
          >
            <Calendar className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Schedule Visit</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (!userLoggedIn) {
                return router.push(`/login?next=/listings/${listing.id}`);
              }
              save();
            }}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-center text-xs sm:text-sm font-extrabold transition-all duration-200 active:scale-95 shadow-sm ${
              saved
                ? "bg-rose-700 text-white hover:bg-rose-800"
                : "bg-rose-50 border border-rose-200/90 text-rose-700 hover:bg-rose-100/90 hover:border-rose-300 hover:shadow-xs"
            }`}
          >
            <Heart
              className={`h-4 w-4 shrink-0 ${saved ? "fill-white text-white" : "fill-rose-500/20 text-rose-600"}`}
            />
            <span>{saved ? "Saved ✓" : "Save Property"}</span>
          </button>

          <button
            type="button"
            onClick={share}
            className="flex items-center justify-center gap-2 rounded-xl bg-sky-50 border border-sky-200/90 px-3 py-3 text-center text-xs sm:text-sm font-extrabold text-sky-800 transition-all duration-200 hover:bg-sky-100/90 hover:border-sky-300 hover:shadow-xs active:scale-95 shadow-sm"
          >
            <Share2 className="h-4 w-4 shrink-0 text-sky-600" />
            <span>Share</span>
          </button>
        </div>

        {status && !open && (
          <p className="text-center text-xs font-semibold text-green-800">
            {status}
          </p>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[70] grid place-items-end bg-black/50 p-0 backdrop-blur-sm sm:place-items-center sm:p-5"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl border border-gray-200 bg-white p-6 shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl font-bold text-gray-950">
              Request a Visit
            </h3>
            <p className="mt-1.5 text-sm text-gray-500">
              The owner or expert will receive your visit inquiry.
            </p>
            <textarea
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-4 w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-800 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
            />
            <button
              type="button"
              onClick={enquire}
              className="mt-3.5 w-full rounded-xl bg-green-700 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-800"
            >
              Send Request
            </button>
            {status && (
              <p className="mt-2.5 text-center text-xs font-semibold text-green-800">
                {status}
              </p>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-2 w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
