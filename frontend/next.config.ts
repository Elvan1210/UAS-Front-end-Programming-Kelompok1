// frontend/next.config.ts

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  // Matikan PWA saat development biar ga bingung sama cache
  disable: process.env.NODE_ENV === "development", 
  
  runtimeCaching: [
    // 1. Gambar Cloudinary: JANGAN CACHE (NetworkOnly)
    // Ini solusi biar ga error "no-response" / CORS di PWA
    {
      urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/,
      handler: "NetworkOnly", 
    },
    // 2. API Railway: JANGAN CACHE (NetworkOnly)
    // Biar data transaksi/menu selalu fresh dari server
    {
      urlPattern: /^https:\/\/.*\.railway\.app\/api\/.*/,
      handler: "NetworkOnly",
    },
    // 3. Font Google: Cache lama gapapa
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 tahun
        },
      },
    },
    // 4. File statis (CSS/JS): Cache sebentar
    {
      urlPattern: /\.(?:css|js|svg|ico)$/, // Hapus jpg/png/webp dari sini biar aman
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, 
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Setting agar Next.js mau menampilkan gambar dari domain luar
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**', // WAJIB: Izinkan semua path/folder
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // Jaga-jaga untuk gambar dummy
        pathname: '**',
      },
    ],
  },
  // Opsi tambahan biar lebih stabil
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);