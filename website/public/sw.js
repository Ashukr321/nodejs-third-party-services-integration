// Offline support: pages network-first (fresh content, cached copy when offline),
// hashed build assets and icons cache-first. Bump VERSION to drop old caches.
const VERSION = "v1";
const CACHE = `node-integrations-${VERSION}`;
const PRECACHE = ["/", "/offline", "/manifest.webmanifest", "/icons/icon-192x192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  const immutable = url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/");
  if (immutable) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) caches.open(CACHE).then((c) => c.put(request, res.clone()));
            return res;
          }),
      ),
    );
    return;
  }

  // pages, RSC payloads, search index: network first, fall back to cache, then the offline page
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
        }
        return res;
      })
      .catch(async () => (await caches.match(request)) || (request.mode === "navigate" ? caches.match("/offline") : Response.error())),
  );
});
