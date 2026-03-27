import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  define: {
    // Hardcode API URL so it works even if Cloudflare env var is missing
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'https://api-reverie.d2mluxury.quest'
    ),
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // REVERIE API — StaleWhileRevalidate so cached data serves instantly at sea
            urlPattern: /^https:\/\/api-reverie\.d2mluxury\.quest\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'reverie-api-v1',
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days — survives the whole voyage
              }
            }
          },
          {
            // Static assets (images) — CacheFirst, long TTL
            urlPattern: /\.(?:png|jpg|jpeg|webp|svg|pdf)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets-v1',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/]
      },
      manifest: {
        name: 'REVERIE — Dreams2Memories',
        short_name: 'REVERIE',
        description: 'Your journeys, remembered as you dreamed them.',
        theme_color: '#0C0A0F',
        background_color: '#0C0A0F',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query']
        }
      }
    }
  }
})
