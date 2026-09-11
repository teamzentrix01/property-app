"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PropertyActions({ listing, compact = false }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(
    `Hi, I am interested in ${listing.title} at ${listing.area}, ${listing.city}. Please share complete details and your best quote.`,
  );
  const [status, setStatus] = useState("");
  const phone = String(listing.phone || listing.contactNumber || "")
    .replace(/\D/g, "")
    .slice(-10);
  const whatsapp = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
  useEffect(() => {
    fetch("/api/saved", { credentials: "include", cache: "no-store" })
      .then((response) => response.ok ? response.json() : { ids: [] })
      .then((data) => setSaved((data.ids || []).includes(listing.id)))
      .catch(() => setSaved(false));
  }, [listing.id]);
  async function save() {
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
    if (navigator.share) return navigator.share({ title: listing.title, text: `View ${listing.title} in ${listing.area}, ${listing.city}`, url }).catch(() => {});
    await navigator.clipboard?.writeText(url);
    setStatus("Property link copied.");
  }
  if (compact)
    return (
      <button
        type="button"
        onClick={save}
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
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-green-700 py-3 text-center text-sm font-bold text-white shadow-sm transition duration-200 hover:bg-green-800"
        >
          Get Best Quote on WhatsApp
        </a>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`tel:${phone}`}
            className="btn btn-primary"
          >
            Call Now
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn btn-tertiary"
          >
            Schedule Visit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={save} className="btn btn-secondary">
            {saved ? "Saved ✓" : "Save Property"}
          </button>
          <button type="button" onClick={share} className="rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50">
            Share
          </button>
        </div>
        {status && !open && <p className="text-center text-xs font-semibold text-green-800">{status}</p>}
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
            <h3 className="font-display text-2xl font-bold text-gray-950">Request a Visit</h3>
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
              <p className="mt-2.5 text-center text-xs font-semibold text-green-800">{status}</p>
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
