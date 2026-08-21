const CACHE_VERSION = 'al-studio-gestao-v2.0.0';
const STATIC_CACHE = `al-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `al-dynamic-${CACHE_VERSION}`;

// Core assets to pre-cache on install
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/favicon.svg',
];

// Install Event: pre-cache core App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('[SW] Precache failed for some assets, continuing...', err);
      });
    })
  );
  // Do NOT skipWaiting automatically if we want client update notifications
  // Clients will send 'SKIP_WAITING' message when user clicks "Atualizar agora"
});

// Activate Event: clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Message Event: allow client UI to force immediate update
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CHECK_VERSION') {
    event.ports[0]?.postMessage({ version: CACHE_VERSION });
  }
});

// Fetch Event: Offline-first with Stale-While-Revalidate & Network-first fallbacks
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Ignore browser extensions and unsupported protocols
  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) return;

  // 1. Navigation requests (HTML pages) -> Network first, fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // 2. Static Assets (JS, CSS, Fonts, Images, SVG, Manifest) -> Stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          // Network failed, nothing to do if we had cachedResponse
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
