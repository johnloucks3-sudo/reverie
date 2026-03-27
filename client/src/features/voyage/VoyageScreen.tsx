import { useEffect, useState } from 'react'
import { api } from '@/shared/lib/api'
import BottomNav from '@/shared/ui/BottomNav'

interface Port { name: string; date: string; type: string; notes: string }
interface Itinerary {
  voyage_name: string; ship: string; cabin: string; route: string
  embark_date: string; disembark_date: string
  full_journey_days: number; full_journey_start: string; ports: Port[]
}
interface Booking {
  type: string; description: string; confirmation: string
  status: string; amount_usd: number
}
interface BookingsResp { bookings: Booking[] }
interface WeatherForecast {
  port: string; date: string; type: string
  forecast: { temp_high_f: number; temp_low_f: number; wind_max_mph: number; condition: string } | null
}
interface WeatherResp { forecasts: WeatherForecast[] }

type Tab = 'itinerary' | 'bookings'

const TYPE_STYLES: Record<string, { badge: string; border: string }> = {
  'pre-cruise': { badge: 'bg-ether/20 text-ether', border: 'border-ether/30' },
  embark:       { badge: 'bg-gold/20 text-gold', border: 'border-gold/50' },
  disembark:    { badge: 'bg-gold/20 text-gold', border: 'border-gold/50' },
  port:         { badge: 'bg-witness/20 text-witness', border: 'border-witness/30' },
  sea:          { badge: 'bg-between text-dusk', border: 'border-between' },
  excursion:    { badge: 'bg-gold/20 text-gold', border: 'border-gold/30' },
}

// Port thumbnail images — matched by partial port name
const PORT_IMAGES: Record<string, string> = {
  'Sitka':    'https://upload.wikimedia.org/wikipedia/commons/5/5d/Mount_Edgecumbe_with_Sitka_Houses_-_panoramio.jpg',
  'Juneau':   'https://upload.wikimedia.org/wikipedia/commons/0/05/Glaciar_Mendenhall%2C_Juneau%2C_Alaska%2C_Estados_Unidos%2C_2017-08-17%2C_DD_02.jpg',
  'Wrangell': 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Wrangell%2C_Alaska.jpg',
  'Ketchikan':'https://upload.wikimedia.org/wikipedia/commons/8/86/Ketchikan_Alaska.jpg',
  'Victoria': 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Victoria_BC_Harbour.jpg',
  'Tokyo':    'https://upload.wikimedia.org/wikipedia/commons/b/b0/Shibuya_and_Shinjuku_from_Yebisu_Garden_Place_Tower%2C_Ebisu%2C_Tokyo%2C_Japan%2C_2024_May.jpg',
  'Honolulu': 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Aerial_view_of_Waikiki_Beach_and_Honolulu%2C_Hawaii%2C_Highsmith.jpg',
  'Newport':  'https://upload.wikimedia.org/wikipedia/commons/6/6b/Newport_Beach_Pier.jpg',
  'Kyoto':    'https://upload.wikimedia.org/wikipedia/commons/5/58/Fushimi_Inari_Taisha_%289498035523%29.jpg',
  'Miyako':   'https://upload.wikimedia.org/wikipedia/commons/a/a7/Jodogahama_beach.jpg',
  'Seattle':  'https://upload.wikimedia.org/wikipedia/commons/e/e3/Seattle_Kerry_Park_Skyline.jpg',
}

function getPortImage(name: string): string | null {
  for (const [key, url] of Object.entries(PORT_IMAGES)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return url
  }
  return null
}

const BOOKING_COLORS: Record<string, string> = {
  flight: 'text-ether',
  hotel: 'text-witness',
  cruise: 'text-gold',
  excursion: 'text-gold',
  transfer: 'text-dusk',
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
function typeLabel(type: string) {
  if (type === 'pre-cruise') return 'PRE-CRUISE'
  if (type === 'sea') return 'SEA DAY'
  return type.toUpperCase()
}
function formatMoney(n: number) {
  if (n === 0) return 'Included'
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
}

export default function VoyageScreen() {
  const [itin, setItin] = useState<Itinerary | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [weather, setWeather] = useState<Map<string, WeatherForecast>>(new Map())
  const [error, setError] = useState(false)
  const [tab, setTab] = useState<Tab>('itinerary')

  useEffect(() => {
    api.get<Itinerary>('/api/itinerary').then(setItin).catch(() => setError(true))
    api.get<BookingsResp>('/api/bookings').then(r => setBookings(r.bookings)).catch(() => {})
    api.get<WeatherResp>('/api/weather')
      .then(r => setWeather(new Map(r.forecasts.map(f => [f.date, f]))))
      .catch(() => {})
  }, [])

  const totalSpend = bookings.reduce((s, b) => s + b.amount_usd, 0)

  return (
    <div className="min-h-dvh bg-vault pb-24 animate-fade-in">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-between">
        <div className="flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="13" r="8" />
            <path d="M 12 1 L 12 5 M 12 21 L 12 25 M 1 13 L 5 13 M 23 13 L 19 13" />
          </svg>
        </div>
        <h1 className="font-display text-gold text-2xl text-center tracking-widest font-light">
          THE VOYAGE
        </h1>
      </div>

      {/* Voyage Hero */}
      {itin && (
        <div className="px-8 py-6 border-b border-between">
          <p className="text-gold font-display text-2xl text-center font-light mb-1">{itin.ship}</p>
          <p className="text-ether font-display text-base text-center font-light mb-3">{itin.route}</p>
          <p className="text-dusk font-ui font-ui-xlight text-sm text-center mb-1">
            {formatDate(itin.full_journey_start)} &ndash; {formatDate(itin.disembark_date)}
          </p>
          <p className="text-ember font-ui font-ui-xlight text-xs text-center">
            {itin.full_journey_days} days &middot; Cabin {itin.cabin}
          </p>
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex border-b border-between">
        <button
          onClick={() => setTab('itinerary')}
          className={`flex-1 py-3 text-center font-ui font-ui-light text-xs tracking-widest uppercase transition-colors duration-300 ${
            tab === 'itinerary' ? 'text-gold border-b-2 border-gold' : 'text-ember hover:text-dusk'
          }`}
        >
          Itinerary ({itin?.ports.length ?? 0})
        </button>
        <button
          onClick={() => setTab('bookings')}
          className={`flex-1 py-3 text-center font-ui font-ui-light text-xs tracking-widest uppercase transition-colors duration-300 ${
            tab === 'bookings' ? 'text-gold border-b-2 border-gold' : 'text-ember hover:text-dusk'
          }`}
        >
          Bookings ({bookings.length})
        </button>
      </div>

      {/* Loading / Error */}
      {!itin && !error && (
        <div className="px-8 py-16 text-center">
          <p className="text-dusk font-ui font-ui-light text-sm animate-pulse">Loading your voyage...</p>
        </div>
      )}
      {error && (
        <div className="px-8 py-16 text-center">
          <p className="text-witness font-ui font-ui-light text-sm">Could not load itinerary.</p>
        </div>
      )}

      {/* Itinerary Tab */}
      {tab === 'itinerary' && itin && (
        <div className="px-5 py-5 space-y-2.5">
          {itin.ports.map((port, idx) => {
            const style = TYPE_STYLES[port.type] ?? TYPE_STYLES.sea
            const w = weather.get(port.date)
            const thumb = getPortImage(port.name)
            return (
              <div
                key={idx}
                className={`bg-layer rounded-lg border ${style.border} hover:bg-hover transition-colors duration-300 overflow-hidden`}
              >
                {thumb && ['port', 'embark', 'disembark', 'excursion'].includes(port.type) && (
                  <div className="relative h-20 bg-vault">
                    <img
                      src={thumb}
                      alt={port.name}
                      className="w-full h-full object-cover opacity-50"
                      onError={e => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-layer/80 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
                      <p className="text-vellum font-display text-sm font-light leading-tight">{port.name}</p>
                      <span className={`${style.badge} font-ui font-ui-xlight text-[9px] tracking-wider uppercase px-2 py-0.5 rounded`}>
                        {typeLabel(port.type)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-4">
                {!thumb || !['port', 'embark', 'disembark', 'excursion'].includes(port.type) ? (
                  <div className="flex justify-between items-start mb-1.5">
                    <p className="text-vellum font-display text-base font-light flex-1 mr-3">
                      {port.name}
                    </p>
                    <span className={`${style.badge} font-ui font-ui-xlight text-[10px] tracking-wider uppercase px-2 py-0.5 rounded shrink-0`}>
                      {typeLabel(port.type)}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between items-center mb-1">
                  <p className="text-dusk font-ui font-ui-xlight text-xs">
                    {formatDate(port.date)}
                  </p>
                  {w?.forecast && (
                    <p className="text-dusk font-ui font-ui-xlight text-xs">
                      {w.forecast.condition} &middot; {Math.round(w.forecast.temp_high_f)}&deg;/{Math.round(w.forecast.temp_low_f)}&deg;F
                    </p>
                  )}
                </div>
                {port.notes && (
                  <p className="text-ember font-ui font-ui-xlight text-xs leading-relaxed">
                    {port.notes}
                  </p>
                )}
                </div>{/* /p-4 */}
              </div>
            )
          })}
        </div>
      )}

      {/* Bookings Tab */}
      {tab === 'bookings' && (
        <div className="px-5 py-5">
          {/* Total */}
          <div className="bg-layer rounded-xl p-5 border border-gold/30 mb-4 text-center"
            style={{ boxShadow: '0 0 20px rgba(232, 192, 122, 0.06)' }}>
            <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase mb-1">Total Investment</p>
            <p className="text-gold font-display text-3xl font-light">{formatMoney(totalSpend)}</p>
            <p className="text-ember font-ui font-ui-xlight text-xs mt-1">
              {bookings.filter(b => b.status === 'paid in full').length > 0
                ? `${bookings.filter(b => b.status === 'paid in full').length} paid in full · ${bookings.filter(b => b.status === 'confirmed').length} confirmed`
                : `All ${bookings.length} confirmed`
              }
            </p>
          </div>

          {/* Booking Cards */}
          <div className="space-y-2.5">
            {bookings.map((b, idx) => (
              <div
                key={idx}
                className="bg-layer rounded-lg p-4 border border-between hover:bg-hover transition-colors duration-300"
              >
                <div className="flex items-start gap-3">
                  <span className={`${BOOKING_COLORS[b.type] ?? 'text-dusk'} font-ui font-ui-xlight text-[10px] tracking-wider uppercase bg-hover px-2 py-0.5 rounded shrink-0 mt-0.5`}>
                    {b.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-vellum font-ui font-ui-light text-sm leading-snug">{b.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-dusk font-ui font-ui-xlight text-xs">
                        {b.confirmation}
                      </span>
                      <span className={`font-ui font-ui-xlight text-xs ${b.status === 'paid in full' ? 'text-gold' : 'text-dusk'}`}>
                        {b.amount_usd > 0 ? formatMoney(b.amount_usd) : 'Included'}
                      </span>
                    </div>
                    <span className={`inline-block mt-1 font-ui font-ui-xlight text-[10px] tracking-wider uppercase px-2 py-0.5 rounded ${
                      b.status === 'paid in full' ? 'bg-gold/15 text-gold' : 'bg-ether/15 text-ether'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
