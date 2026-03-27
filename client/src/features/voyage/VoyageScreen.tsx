import { useEffect, useState } from 'react'
import { api } from '@/shared/lib/api'
import BottomNav from '@/shared/ui/BottomNav'

interface Port { name: string; date: string; type: string; notes: string }
interface Itinerary {
  voyage_name: string; ship: string; cabin: string; route: string
  embark_date: string; disembark_date: string
  full_journey_days: number; full_journey_start: string; ports: Port[]
}
interface Booking { type: string; description: string; confirmation: string; status: string; amount_usd: number }
interface BookingsResp { bookings: Booking[] }
interface WeatherForecast {
  port: string; date: string; type: string
  forecast: { temp_high_f: number; temp_low_f: number; wind_max_mph: number; condition: string } | null
}
interface WeatherResp { forecasts: WeatherForecast[] }
interface DayDetail {
  excursion?: { title: string; time?: string; duration?: string; conf?: string; operator?: string; cost?: number }
  dining?: { restaurant: string; time: string; cost?: number; status?: string }
}

type Tab = 'itinerary' | 'bookings'

const TYPE_STYLES: Record<string, { badge: string; border: string }> = {
  'pre-cruise': { badge: 'bg-ether/20 text-ether', border: 'border-ether/30' },
  embark:       { badge: 'bg-gold/20 text-gold', border: 'border-gold/50' },
  disembark:    { badge: 'bg-gold/20 text-gold', border: 'border-gold/50' },
  port:         { badge: 'bg-witness/20 text-witness', border: 'border-witness/30' },
  sea:          { badge: 'bg-between text-dusk', border: 'border-between' },
  excursion:    { badge: 'bg-gold/20 text-gold', border: 'border-gold/30' },
}
const BOOKING_COLORS: Record<string, string> = {
  flight: 'text-ether', hotel: 'text-witness', cruise: 'text-gold',
  excursion: 'text-gold', transfer: 'text-dusk',
}

// Pexels CDN helper
const px = (id: number | string, ext = 'jpeg') =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940`

// Port / destination images — canonical IDs from EARA Daily Itinerary A (booking 566904-25)
const PORT_IMAGES: Record<string, string> = {
  'Sitka':    px(34145844),  // EARA canonical
  'Juneau':   px(12897647),  // EARA canonical
  'Wrangell': px(36075386),  // EARA canonical
  'Ketchikan':px(12761922),  // EARA canonical
  'Victoria': px(35380038),  // EARA canonical
  'Kodiak':   px(17444649),  // EARA canonical
  'Yokohama': px(23023919),  // EARA canonical
  'Tokyo':    px(23023919),  // EARA canonical
  'Honolulu': px(4321914),
  'Newport':  px(26761479),
  'Kyoto':    px(16660223),
  'Miyako':   px(7833735),   // EARA canonical
  'Aomori':   px(15925248),  // EARA canonical
  'Seattle':  px(1486733),   // Seattle skyline + Space Needle
  'Fuji':     px(19775493),
  'Hakone':   px(19775493),
}

// Sea day images — context-matched per D2M itinerary production guide
// Date Line day uses EARA canonical ID. Others: ship exterior / dining / seascape context.
const SEA_IMAGES: Record<string, string> = {
  '2026-04-24': px(36145527),   // Silversea ship exterior — first morning at sea
  '2026-04-27': px(5769594),    // Fine dining atmosphere — Kaiseki evening
  '2026-04-28': px(36160120),   // Veranda/balcony suite — S.A.L.T. Chef's Table
  '2026-04-29': px(2852124),    // Pool deck ship life — La Terrazza
  '2026-04-30': px(11679685),   // Date Line crossing — EARA canonical
  '2026-05-01': px(7762062),    // Dramatic North Pacific — La Dame · Gulf of Alaska
  '2026-05-02': px(5769707),    // Ship lounge/interior — Silver Note jazz
  '2026-05-04': px(5379488),    // North Pacific coastal — eve of Alaska
  '2026-05-09': px(36325198),   // Inside Passage scenic
}

// Pre-cruise day images keyed by date (name-match covers Honolulu, Tokyo, Kyoto)
const PRECRUISE_IMAGES: Record<string, string> = {
  '2026-04-10': px(5200278),   // Colorado departure
  '2026-04-11': px(26761479),  // Newport Beach
  '2026-04-12': px(26761479),  // Newport Beach
  '2026-04-18': px(6700045),   // JAL flight HNL→HND
  '2026-04-22': px(19775493),  // Mt Fuji & Hakone
}

function getPortImage(name: string): string | null {
  for (const [key, url] of Object.entries(PORT_IMAGES)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return url
  }
  return null
}
function getImage(port: Port): string | null {
  const byName = getPortImage(port.name)
  if (byName) return byName
  if (port.type === 'sea') return SEA_IMAGES[port.date] ?? px(1560647)
  if (port.type === 'pre-cruise') return PRECRUISE_IMAGES[port.date] ?? null
  return null
}

// Structured day details from Loucks dossier
const DAY_DETAILS: Record<string, DayDetail> = {
  '2026-04-21': { excursion: { title: 'Kyoto Food Tour', time: '10:00 AM', duration: '3h', conf: 'CIT-T123798325', operator: 'City Unscripted · Hiro', cost: 484.96 } },
  '2026-04-22': { excursion: { title: 'Mt. Fuji & Hakone Bus Tour', time: '7:50 AM', conf: 'PE164714008', operator: 'Project Expedition', cost: 365.62 } },
  '2026-04-24': { dining: { restaurant: 'The Grill', time: '18:30', status: 'waitlisted' } },
  '2026-04-25': { excursion: { title: 'Jodogahama & Ryusendo Cave', time: '08:45', duration: '4h', operator: 'Silversea Shore Ex' } },
  '2026-04-27': { dining: { restaurant: 'Kaiseki', time: '18:30', cost: 160 } },
  '2026-04-28': { dining: { restaurant: "S.A.L.T. Chef's Table", time: '18:30', cost: 360 } },
  '2026-04-29': { dining: { restaurant: 'La Terrazza', time: '18:30' } },
  '2026-04-30': { dining: { restaurant: 'The Grill', time: '18:30' } },
  '2026-05-01': { dining: { restaurant: 'La Dame', time: '18:30', cost: 200 } },
  '2026-05-02': { dining: { restaurant: 'Silver Note', time: '18:30' } },
  '2026-05-03': { dining: { restaurant: 'The Grill', time: '18:30' } },
  '2026-05-04': { dining: { restaurant: 'La Terrazza', time: '18:30' } },
  '2026-05-05': {
    excursion: { title: 'Culinary Adventure', time: '10:30', duration: '3h', operator: 'Silversea Shore Ex' },
    dining: { restaurant: 'La Terrazza', time: '19:30' },
  },
  '2026-05-06': {
    excursion: { title: 'Whale Watching', time: '11:00', duration: '4h', operator: 'Silversea Shore Ex' },
    dining: { restaurant: 'La Terrazza', time: '19:30' },
  },
  '2026-05-07': {
    excursion: { title: 'John Muir Hike', time: '14:30', duration: '1h 45m', operator: 'Silversea Shore Ex' },
    dining: { restaurant: 'Kaiseki', time: '19:30', cost: 160 },
  },
  '2026-05-08': {
    excursion: { title: 'By Land & Sea', time: '12:00', duration: '1h 30m', operator: 'Silversea Shore Ex' },
    dining: { restaurant: 'La Terrazza', time: '19:30' },
  },
  '2026-05-09': { dining: { restaurant: 'The Grill', time: '18:30' } },
  '2026-05-10': {
    excursion: { title: 'Horse-Drawn Trolley', time: '10:00', duration: '1h', operator: 'Silversea Shore Ex' },
    dining: { restaurant: 'La Terrazza', time: '19:30' },
  },
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
  const [expandedDate, setExpandedDate] = useState<string | null>(null)

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
        <h1 className="font-display text-gold text-2xl text-center tracking-widest font-light">THE VOYAGE</h1>
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
        {(['itinerary', 'bookings'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-3 text-center font-ui font-ui-light text-xs tracking-widest uppercase transition-colors duration-300 ${
              tab === t ? 'text-gold border-b-2 border-gold' : 'text-ember hover:text-dusk'
            }`}>
            {t === 'itinerary' ? `Itinerary (${itin?.ports.length ?? 0})` : `Bookings (${bookings.length})`}
          </button>
        ))}
      </div>

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
            const thumb = getImage(port)
            const detail = DAY_DETAILS[port.date]
            const isExpanded = expandedDate === port.date

            return (
              <div key={idx} className={`bg-layer rounded-lg border ${style.border} overflow-hidden`}>
                {/* Tappable header */}
                <div
                  className="cursor-pointer select-none"
                  onClick={() => setExpandedDate(isExpanded ? null : port.date)}
                >
                  {/* Image strip */}
                  {thumb && (
                    <div className="relative h-20 bg-vault overflow-hidden">
                      <img
                        src={thumb}
                        alt={port.name}
                        className="w-full h-full object-cover opacity-50"
                        onError={e => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-layer/90 to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
                        <p className="text-vellum font-display text-sm font-light leading-tight">{port.name}</p>
                        <div className="flex items-center gap-1">
                          {detail?.excursion && (
                            <span className="text-[8px] bg-gold/30 text-gold px-1.5 py-0.5 rounded font-bold">⛵</span>
                          )}
                          {detail?.dining && (
                            <span className="text-[8px] bg-ether/30 text-ether px-1.5 py-0.5 rounded font-bold">🍽</span>
                          )}
                          <span className={`${style.badge} font-ui font-ui-xlight text-[9px] tracking-wider uppercase px-2 py-0.5 rounded`}>
                            {typeLabel(port.type)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    {/* Name row (only if no image) */}
                    {!thumb && (
                      <div className="flex justify-between items-start mb-1.5">
                        <p className="text-vellum font-display text-base font-light flex-1 mr-3">{port.name}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          {detail?.excursion && <span className="text-[8px] text-gold font-bold">⛵</span>}
                          {detail?.dining && <span className="text-[8px] text-ether font-bold">🍽</span>}
                          <span className={`${style.badge} font-ui font-ui-xlight text-[10px] tracking-wider uppercase px-2 py-0.5 rounded`}>
                            {typeLabel(port.type)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-1">
                      <p className="text-dusk font-ui font-ui-xlight text-xs">{formatDate(port.date)}</p>
                      <div className="flex items-center gap-2">
                        {w?.forecast && (
                          <p className="text-dusk font-ui font-ui-xlight text-xs">
                            {w.forecast.condition} &middot; {Math.round(w.forecast.temp_high_f)}&deg;/{Math.round(w.forecast.temp_low_f)}&deg;F
                          </p>
                        )}
                        <svg className={`w-3 h-3 text-ember/60 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                    </div>

                    {port.notes && (
                      <p className="text-ember font-ui font-ui-xlight text-xs leading-relaxed">{port.notes}</p>
                    )}
                  </div>
                </div>

                {/* Expanded detail panel */}
                {isExpanded && (
                  <div className="border-t border-between/50 px-4 pb-4 pt-3 space-y-2.5">
                    {detail?.excursion && (
                      <div className="bg-gold/5 rounded-lg p-3 border border-gold/20">
                        <p className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase mb-1.5">Shore Excursion</p>
                        <p className="text-vellum font-ui font-ui-light text-sm">{detail.excursion.title}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                          {detail.excursion.time && (
                            <span className="text-dusk font-ui font-ui-xlight text-xs">⏱ {detail.excursion.time}</span>
                          )}
                          {detail.excursion.duration && (
                            <span className="text-dusk font-ui font-ui-xlight text-xs">&middot; {detail.excursion.duration}</span>
                          )}
                          {(detail.excursion.cost ?? -1) >= 0 && (
                            <span className={`font-ui font-ui-xlight text-xs ${detail.excursion.cost === 0 ? 'text-ether' : 'text-gold'}`}>
                              {detail.excursion.cost === 0 ? 'Included' : formatMoney(detail.excursion.cost!)}
                            </span>
                          )}
                        </div>
                        {detail.excursion.operator && (
                          <p className="text-ember font-ui font-ui-xlight text-[10px] mt-1">{detail.excursion.operator}</p>
                        )}
                        {detail.excursion.conf && (
                          <p className="text-ember/60 font-ui font-ui-xlight text-[10px]">Conf: {detail.excursion.conf}</p>
                        )}
                      </div>
                    )}

                    {detail?.dining && (
                      <div className="bg-ether/5 rounded-lg p-3 border border-ether/20">
                        <p className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase mb-1.5">Dining Reservation</p>
                        <p className="text-vellum font-ui font-ui-light text-sm">{detail.dining.restaurant}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                          <span className="text-dusk font-ui font-ui-xlight text-xs">{detail.dining.time}</span>
                          {(detail.dining.cost ?? 0) > 0 && (
                            <span className="text-gold font-ui font-ui-xlight text-xs">{formatMoney(detail.dining.cost!)}</span>
                          )}
                          {detail.dining.status && (
                            <span className="text-witness font-ui font-ui-xlight text-xs uppercase tracking-wide">{detail.dining.status}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {w?.forecast && (
                      <div className="rounded-lg p-3 border border-between/50 bg-between/20">
                        <p className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase mb-2">Weather Detail</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <p className="text-vellum font-ui font-ui-light text-sm">
                              {Math.round(w.forecast.temp_high_f)}&deg; / {Math.round(w.forecast.temp_low_f)}&deg;
                            </p>
                            <p className="text-ember font-ui font-ui-xlight text-[10px]">Hi / Lo °F</p>
                          </div>
                          <div>
                            <p className="text-vellum font-ui font-ui-light text-sm">{w.forecast.condition}</p>
                            <p className="text-ember font-ui font-ui-xlight text-[10px]">Sky</p>
                          </div>
                          <div>
                            <p className="text-vellum font-ui font-ui-light text-sm">{w.forecast.wind_max_mph} mph</p>
                            <p className="text-ember font-ui font-ui-xlight text-[10px]">Wind</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!detail && !w?.forecast && (
                      <p className="text-ember/40 font-ui font-ui-xlight text-xs text-center py-1">No additional details on file</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Bookings Tab */}
      {tab === 'bookings' && (
        <div className="px-5 py-5">
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
          <div className="space-y-2.5">
            {bookings.map((b, idx) => (
              <div key={idx} className="bg-layer rounded-lg p-4 border border-between hover:bg-hover transition-colors duration-300">
                <div className="flex items-start gap-3">
                  <span className={`${BOOKING_COLORS[b.type] ?? 'text-dusk'} font-ui font-ui-xlight text-[10px] tracking-wider uppercase bg-hover px-2 py-0.5 rounded shrink-0 mt-0.5`}>
                    {b.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-vellum font-ui font-ui-light text-sm leading-snug">{b.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-dusk font-ui font-ui-xlight text-xs">{b.confirmation}</span>
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
