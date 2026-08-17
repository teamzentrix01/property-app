const CACHE = "bhoomi-shell-v1";
const SHELL = ["/", "/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Network-first for navigation/API, cache-first for the static shell
self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  if (SHELL.includes(new URL(request.url).pathname)) {
    e.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
    return;
  }

  e.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
