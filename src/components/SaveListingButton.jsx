"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// A single in-memory snapshot prevents every home-card heart from issuing its
// own GET, while the source of truth remains the authenticated /api/saved API.
let savedIds = new Set();
let initialLoad;
let lastAuthChange = 0;
const listeners = new Set();

function publish() {
  listeners.forEach((listener) => listener(new Set(savedIds)));
}

async function loadSavedIds() {
  if (!initialLoad) {
    initialLoad = fetch("/api/saved", { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        // Do not cache an anonymous result: after the login redirect, the
        // same client session must fetch the newly authenticated saved list.
        if (response.status === 401) {
          initialLoad = null;
          return new Set();
        }
        if (!response.ok) throw new Error("Unable to load saved properties");
        const data = await response.json();
        return new Set(data.ids || []);
      })
      .then((ids) => { savedIds = ids; publish(); return ids; })
      .catch(() => { initialLoad = null; return new Set(); });
  }
  return initialLoad;
}

export default function SaveListingButton({ listingId, className = "", iconClassName = "h-4 w-4", ariaLabel = "Save property" }) {
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(() => savedIds.has(listingId));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const listener = (ids) => setSaved(ids.has(listingId));
    const refreshForAuthChange = (event) => {
      if (event.timeStamp !== lastAuthChange) {
        lastAuthChange = event.timeStamp;
        savedIds = new Set();
        initialLoad = null;
        publish();
      }
      loadSavedIds().then(listener);
    };
    listeners.add(listener);
    window.addEventListener("bhoomi-auth-changed", refreshForAuthChange);
    loadSavedIds().then(listener);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("bhoomi-auth-changed", refreshForAuthChange);
    };
  }, [listingId]);

  async function toggle(event) {
    event.preventDefault();
    event.stopPropagation();
    if (saving || !listingId) return;
    setSaving(true);
    const method = saved ? "DELETE" : "POST";
    const response = await fetch(saved ? `/api/saved?listingId=${encodeURIComponent(listingId)}` : "/api/saved", {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...(saved ? {} : { body: JSON.stringify({ listingId }) }),
    }).catch(() => null);
    if (!response || response.status === 401) {
      router.push(`/login?next=${encodeURIComponent(pathname || "/")}`);
      setSaving(false);
      return;
    }
    if (response.ok) {
      if (saved) savedIds.delete(listingId);
      else savedIds.add(listingId);
      publish();
    }
    setSaving(false);
  }

  return <button type="button" onClick={toggle} disabled={saving} aria-label={saved ? "Remove saved property" : ariaLabel} aria-pressed={saved} className={className}>
    <Heart className={`${iconClassName} ${saved ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
  </button>;
}
