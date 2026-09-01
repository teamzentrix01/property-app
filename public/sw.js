const CACHE = "bhoomi-static-v2";
const STATIC_ASSETS = ["/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Never cache documents or Next.js data requests. Mixing a cached document
// with a newer dev build can leave the App Router uninitialized.
self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (STATIC_ASSETS.includes(url.pathname)) {
    e.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
    return;
  }
});
