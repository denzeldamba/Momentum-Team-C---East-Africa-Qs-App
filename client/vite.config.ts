import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true, 
      },
      workbox: {
        // Includes all built assets (JS, CSS, HTML) in the offline cache
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        
        runtimeCaching: [
          {
            /**
             * 1. SUPABASE AUTH CACHE
             * This allows the app to "remember" the session offline.
             */
            urlPattern: /^https:\/\/.*\.supabase\.co\/auth\/v1\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-auth-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            /**
             * 2. ASSETS & NAVIGATION CACHE
             * Using a simpler regex that matches local paths to avoid
             * 'window' or 'self' reference errors.
             */
            urlPattern: /\.(?:js|css|html|png|jpg|jpeg|svg|gif)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "qs-static-assets",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
      manifest: {
        name: "East African QS Pocket Knife",
        short_name: "QS App",
        description: "Offline-First Quantity Surveying App for East Africa",
        theme_color: "#09090b",
        background_color: "#09090b",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "/icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});