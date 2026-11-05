/* ============================================
   sw.js — Service Worker (PWA Offline Support)
   Sie Perlengkapan KIR | Camp Riset 2026

   Strategi Cache:
   - App Shell (HTML, CSS, JS) → Cache First
   - CDN Libraries → Cache First
   - Fallback ke jaringan jika cache miss
   ============================================ */

const CACHE_NAME    = 'kir-perlengkapan-v1';
const CACHE_TIMEOUT = 5000; // ms — timeout fetch ke network

/** Daftar file yang di-cache saat Service Worker diinstall (App Shell) */
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/db.js',
  '/app.js',
  '/firebase-sync.js',
  '/manifest.json'
];

/* ============================================
   INSTALL — cache semua asset statis
   ============================================ */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()) // Aktifkan SW baru segera
  );
});

/* ============================================
   ACTIVATE — hapus cache versi lama
   ============================================ */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim()) // Ambil kontrol semua tab
  );
});

/* ============================================
   FETCH — Strategi: Cache First, fallback Network
   ============================================ */
self.addEventListener('fetch', (event) => {
  // Hanya handle request GET
  if (event.request.method !== 'GET') return;

  // Jangan intercept request ke Firebase / API eksternal
  const url = new URL(event.request.url);
  if (url.hostname.includes('firebaseio.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('firestore.googleapis.com')) {
    return; // Biarkan browser handle langsung
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Cache hit — langsung kembalikan dari cache
        return cachedResponse;
      }

      // Cache miss — ambil dari network, lalu simpan ke cache
      return fetch(event.request)
        .then(networkResponse => {
          // Hanya cache response yang valid
          if (!networkResponse || networkResponse.status !== 200 ||
              networkResponse.type === 'error') {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone));

          return networkResponse;
        })
        .catch(() => {
          // Offline & tidak ada cache → kembalikan halaman utama sebagai fallback
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
