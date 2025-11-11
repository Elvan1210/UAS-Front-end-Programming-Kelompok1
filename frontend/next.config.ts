// frontend/next.config.ts

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  
  // Matikan PWA di mode development (SANGAT DISARANKAN)
  disable: process.env.NODE_ENV === "development", 
  
  // --- BAGIAN ANTI-KONFLIK DAN ANTI-KEPENTAL ---
  runtimeCaching: [
    {
      // 1. STRATEGI UNTUK API KITA (http://localhost:5000)
      // JANGAN PERNAH DI-CACHE - INI YANG PALING PENTING!
      urlPattern: /^http:\/\/localhost:5000\/.*/,
      handler: "NetworkOnly",
    },
    {
      // 2. Strategi untuk Font Google (jika pakai)
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
    {
      // 3. Strategi untuk file statis (CSS, JS, gambar, dll)
      urlPattern: /\.(?:css|js|jpg|jpeg|png|gif|svg|ico|webp)$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tambahkan config Next.js lainnya di sini jika ada
};

// Bungkus export dengan PWA
module.exports = withPWA(nextConfig);