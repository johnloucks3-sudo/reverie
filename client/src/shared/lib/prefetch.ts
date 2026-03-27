/**
 * Offline prefetch — hit all static API endpoints on first load so the
 * service worker caches them. At sea with no internet, these serve instantly.
 */

const STATIC_ENDPOINTS = [
  '/api/itinerary',
  '/api/bookings',
  '/api/profile',
  '/api/documents',
  '/api/bridge',
  '/api/weather',
  '/api/journal',
  '/api/sea-letters',
]

export async function prefetchVoyageData(): Promise<void> {
  const token = localStorage.getItem('reverie_token')
  if (!token) return

  const base = import.meta.env.VITE_API_URL ?? ''
  const headers = { Authorization: `Bearer ${token}` }

  // Fire all fetches concurrently — don't await, just warm the cache
  STATIC_ENDPOINTS.forEach(path => {
    fetch(`${base}${path}`, { headers }).catch(() => {/* offline — no-op */})
  })
}
