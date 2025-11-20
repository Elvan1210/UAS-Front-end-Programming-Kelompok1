// frontend/next.config.ts

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", 
  
  runtimeCaching: [
    // 1. ATURAN KHUSUS CLOUDINARY (SOLUSI AKAR MASALAH)
    // Paksa PWA untuk TIDAK meng-cache gambar Cloudinary, ambil langsung dari internet.
    {
      urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/,
      handler: "NetworkOnly", 
    },
    // 2. ATURAN UNTUK API SENDIRI
    {
      urlPattern: /^https:\/\/.*\.railway\.app\/api\/.*/,
      handler: "NetworkOnly",
    },
    // 3. Strategi untuk Font Google
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, 
        },
      },
    },
    // 4. Strategi file statis (CSS, JS, dll)
    {
      urlPattern: /\.(?:css|js|svg|ico)$/, // Hapus jpg/png dari sini biar aman
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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

module.exports = withPWA(nextConfig);