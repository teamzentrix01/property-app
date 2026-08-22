"use client";
import { useState } from "react";
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
  async function save() {
    const res = await fetch(
      `/api/saved${saved ? `?listingId=${listing.id}` : ""}`,
      {
        method: saved ? "DELETE" : "POST",
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
        className={`grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-sm ${saved ? "text-red-500" : "text-ink-soft"}`}
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
      <div className="grid gap-2">
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className="block rounded-xl bg-moss py-3 text-center text-sm font-bold text-white"
        >
          Get best quote on WhatsApp
        </a>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`tel:${phone}`}
            className="rounded-xl bg-ink py-3 text-center text-sm font-bold text-white"
          >
            Call now
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-xl border border-ink/15 py-3 text-sm font-semibold"
          >
            Schedule visit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2"><button type="button" onClick={save} className="rounded-xl border border-moss/20 py-3 text-sm font-semibold text-moss-deep">{saved ? "Saved ✓" : "Save property"}</button><button type="button" onClick={share} className="rounded-xl border border-ink/15 py-3 text-sm font-semibold">Share</button></div>
        {status && !open && <p className="text-center text-xs text-moss-deep">{status}</p>}
      </div>
      {open && (
        <div
          className="fixed inset-0 z-[70] grid place-items-end bg-black/45 p-0 sm:place-items-center sm:p-5"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-white p-6 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl">Request a visit</h3>
            <p className="mt-2 text-sm text-ink-soft">
              The owner or agent will receive this request.
            </p>
            <textarea
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-5 w-full rounded-xl border border-ink/10 p-3 text-sm"
            />
            <button
              type="button"
              onClick={enquire}
              className="mt-3 w-full rounded-xl bg-moss py-3 text-sm font-bold text-white"
            >
              Send request
            </button>
            {status && (
              <p className="mt-3 text-center text-xs text-ink-soft">{status}</p>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-2 w-full py-2 text-sm text-ink-soft"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
