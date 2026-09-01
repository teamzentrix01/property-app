"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    // A stale service worker can mix an older HTML/RSC payload with the current
    // dev build, which prevents the App Router from initializing correctly.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker?.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      return;
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
