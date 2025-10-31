const CACHE_NAME = 'kasir-umkm-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/menu',
  '/login',
  '/register',
  '/dashboard'
];

// Install service worker dan cache semua file di atas
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app shell...');
      return cache.addAll(urlsToCache);
    })
  );
});

// Aktifkan service worker dan hapus cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('Hapus cache lama:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// Fetch event: ambil dari cache kalau offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).catch(() =>
          caches.match('/offline.html')
        )
      );
    })
  );
});
