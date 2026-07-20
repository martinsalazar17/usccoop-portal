// Minimal service worker — exists mainly to satisfy PWA installability
// requirements (Chrome/Android require an active service worker to show
// the install prompt). It caches only this shell page, icons, and manifest.
//
// Note: the actual order form runs inside an embedded Google page
// (a different origin), which browsers don't allow service workers to
// cache or intercept. So this does NOT make the order form itself work
// offline — only the app shell (icon, loading screen) installs/caches.

const CACHE_NAME = 'usccoop-shell-v1';
const SHELL_FILES = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle same-origin shell requests; let everything else
  // (including the cross-origin Google iframe) pass through normally.
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
