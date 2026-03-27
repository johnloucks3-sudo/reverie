import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet'
import { api } from '@/shared/lib/api'
import BottomNav from '@/shared/ui/BottomNav'
import 'leaflet/dist/leaflet.css'

interface Waypoint {
  0: number  // lat
  1: number  // lon
  2: string  // label
  3: string  // date
  4: string  // type
}

interface BridgeData {
  ship: {
    name: string; operator: string; gross_tonnage: number
    length_m: number; passengers: number; crew: number
    year_built: number; flag: string
  }
  voyage: {
    route: string; embark_port: string; embark_date: string
    disembark_port: string; disembark_date: string; cruise_nights: number
  }
  progress: {
    phase: string; journey_day: number; total_days: number
    days_remaining: number; days_until_embark: number; progress_pct: number
    current_position: { lat: number; lon: number; label: string }
    next_destination: { label: string | null; date: string | null }
  }
  waypoints: Waypoint[]
  map_config: { center: [number, number]; zoom: number }
}

interface WeatherForecast {
  port: string; date: string; type: string
  lat?: number; lon?: number
  forecast: {
    temp_high_f: number; temp_low_f: number
    wind_max_mph: number; condition: string
    precipitation_in: number
  } | null
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const LOCATION_TZ: Record<string, string> = {
  'Colorado Springs': 'America/Denver',
  'Newport Beach': 'America/Los_Angeles',
  'Honolulu': 'Pacific/Honolulu',
  'Haneda Airport': 'Asia/Tokyo',
  'Tokyo (Odaiba)': 'Asia/Tokyo',
  'Kyoto': 'Asia/Tokyo',
  'Mt. Fuji': 'Asia/Tokyo',
  'Tokyo (Harumi)': 'Asia/Tokyo',
  'Miyako': 'Asia/Tokyo',
  'Pacific Ocean': 'Asia/Tokyo',
  'International Date Line': 'Pacific/Honolulu',
  'North Pacific': 'America/Anchorage',
  'Gulf of Alaska': 'America/Anchorage',
  'Sitka': 'America/Sitka',
  'Juneau': 'America/Sitka',
  'Wrangell': 'America/Sitka',
  'Ketchikan': 'America/Sitka',
  'Inside Passage': 'America/Vancouver',
  'Victoria': 'America/Vancouver',
  'Seattle': 'America/Los_Angeles',
}

function formatClock(tz: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour: 'numeric', minute: '2-digit',
    hour12: true, timeZoneName: 'short',
  }).format(new Date())
}

const SHIP_IMG = 'https://cdn.sanity.io/images/rd0y3pad/production/5946a7b3eb1ac569f3603639c0962c97c1cd9230-4032x3024.jpg?w=1200&q=80&fit=max&auto=format'

const WP_COLORS: Record<string, string> = {
  origin: '#9B8EC4',
  'pre-cruise': '#9B8EC4',
  excursion: '#E8C07A',
  embark: '#E8C07A',
  port: '#C4847A',
  sea: '#6A6060',
  disembark: '#E8C07A',
}

export default function BridgeScreen() {
  const navigate = useNavigate()
  const [data, setData] = useState<BridgeData | null>(null)
  const [weather, setWeather] = useState<WeatherForecast[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    api.get<BridgeData>('/api/bridge').then(setData).catch(() => setError(true))
    api.get<{ forecasts: WeatherForecast[] }>('/api/weather').then(r => setWeather(r.forecasts)).catch(() => {})
  }, [])

  // Build polyline segments (handle date line crossing by splitting)
  const routePositions: [number, number][][] = []
  if (data) {
    let segment: [number, number][] = []
    for (let i = 0; i < data.waypoints.length; i++) {
      const wp = data.waypoints[i]
      const lat = wp[0]
      const lon = wp[1]

      if (segment.length > 0) {
        const prevLon = segment[segment.length - 1][1]
        // If crossing date line (big longitude jump), split the segment
        if (Math.abs(lon - prevLon) > 180) {
          routePositions.push([...segment])
          segment = []
        }
      }
      segment.push([lat, lon])
    }
    if (segment.length > 0) routePositions.push(segment)
  }

  // Port weather lookup
  const weatherByDate = new Map(weather.map(w => [w.date, w]))

  const progress = data?.progress

  return (
    <div className="min-h-dvh bg-vault pb-24 animate-fade-in">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-between">
        <div className="flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 17l2-4h14l2 4" />
            <path d="M5 13l1-6h12l1 6" />
            <path d="M12 7V3" />
            <path d="M8 7V5" />
            <path d="M16 7V5" />
          </svg>
        </div>
        <h1 className="font-display text-gold text-2xl text-center tracking-widest font-light">
          THE BRIDGE
        </h1>
        <p className="text-ember font-ui font-ui-xlight text-xs text-center mt-1">Your position in the world</p>
      </div>

      {/* Progress Bar */}
      {progress && (
        <div className="px-6 py-5 border-b border-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-dusk font-ui font-ui-xlight text-xs uppercase tracking-wider">
              {progress.phase === 'pre-departure' ? 'Pre-departure' :
               progress.phase === 'pre-cruise' ? 'Pre-cruise' :
               progress.phase === 'at-sea' ? 'At Sea' : 'Voyage Complete'}
            </span>
            <span className="text-gold font-ui font-ui-xlight text-xs">
              Day {progress.journey_day} of {progress.total_days}
            </span>
          </div>
          <div className="w-full h-1.5 bg-layer rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-1000"
              style={{ width: `${progress.progress_pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-ember font-ui font-ui-xlight text-[10px]">
              {progress.current_position.label}
            </span>
            {progress.next_destination.label && (
              <span className="text-ember font-ui font-ui-xlight text-[10px]">
                Next: {progress.next_destination.label}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Time Zone Clocks */}
      {progress && (
        <div className="px-6 py-4 border-b border-between">
          <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase mb-3">Current Time</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-layer rounded-lg p-4 border border-between text-center">
              <p className="text-ember font-ui font-ui-xlight text-[10px] uppercase tracking-widest mb-1">Home</p>
              <p className="text-vellum font-ui font-ui-light text-base leading-tight">
                {formatClock('America/Denver')}
              </p>
              <p className="text-dusk font-ui font-ui-xlight text-[9px] mt-0.5">Colorado Springs</p>
            </div>
            <div className="bg-layer rounded-lg p-4 border border-gold/25 text-center">
              <p className="text-ember font-ui font-ui-xlight text-[10px] uppercase tracking-widest mb-1">Here</p>
              <p className="text-gold font-ui font-ui-light text-base leading-tight">
                {formatClock(LOCATION_TZ[progress.current_position.label] ?? 'America/Denver')}
              </p>
              <p className="text-dusk font-ui font-ui-xlight text-[9px] mt-0.5 truncate">
                {progress.current_position.label}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      {data && (
        <div className="px-4 py-4">
          <div className="rounded-xl overflow-hidden border border-between" style={{ height: '280px' }}>
            <MapContainer
              center={data.map_config.center}
              zoom={data.map_config.zoom}
              style={{ height: '100%', width: '100%', background: '#151220' }}
              scrollWheelZoom={false}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {/* Route lines */}
              {routePositions.map((segment, i) => (
                <Polyline
                  key={i}
                  positions={segment}
                  pathOptions={{ color: '#E8C07A', weight: 2, opacity: 0.6, dashArray: '6 4' }}
                />
              ))}
              {/* Waypoint markers */}
              {data.waypoints.map((wp, i) => {
                const isPort = ['port', 'embark', 'disembark', 'excursion'].includes(wp[4])
                const color = WP_COLORS[wp[4]] ?? '#6A6060'
                const w = weatherByDate.get(wp[3])
                return (
                  <CircleMarker
                    key={i}
                    center={[wp[0], wp[1]]}
                    radius={isPort ? 5 : 3}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: isPort ? 0.9 : 0.4,
                      weight: isPort ? 2 : 1,
                    }}
                  >
                    <Popup>
                      <div style={{ color: '#1E1A2E', fontFamily: 'Outfit, sans-serif', fontSize: '12px' }}>
                        <strong>{wp[2]}</strong><br />
                        {formatDate(wp[3])}<br />
                        {w?.forecast && (
                          <span>
                            {w.forecast.condition} &middot; {Math.round(w.forecast.temp_high_f)}&deg;F
                          </span>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })}
              {/* Current position highlight */}
              {progress && (
                <CircleMarker
                  center={[progress.current_position.lat, progress.current_position.lon]}
                  radius={8}
                  pathOptions={{
                    color: '#E8C07A',
                    fillColor: '#E8C07A',
                    fillOpacity: 1,
                    weight: 3,
                  }}
                >
                  <Popup>
                    <div style={{ color: '#1E1A2E', fontFamily: 'Outfit, sans-serif', fontSize: '12px' }}>
                      <strong>You are here</strong><br />
                      {progress.current_position.label}
                    </div>
                  </Popup>
                </CircleMarker>
              )}
            </MapContainer>
          </div>
        </div>
      )}

      {/* Ship Info */}
      {data && (
        <div className="px-6 py-4 border-b border-between">
          <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase mb-3">Ship Details</p>
          <div className="bg-layer rounded-xl border border-between overflow-hidden">
            <div className="relative h-36 bg-vault">
              <img
                src={SHIP_IMG}
                alt="Silver Nova"
                className="w-full h-full object-cover opacity-70"
                onError={e => { e.currentTarget.style.display = 'none' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-layer/90 via-layer/30 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <p className="text-gold font-display text-xl font-light leading-tight">{data.ship.name}</p>
                <p className="text-dusk font-ui font-ui-xlight text-[10px]">{data.ship.operator}</p>
              </div>
            </div>
            <div className="p-5">
            <p className="text-gold font-display text-xl font-light mb-1 sr-only">{data.ship.name}</p>
            <p className="text-dusk font-ui font-ui-xlight text-xs mb-3 sr-only">{data.ship.operator}</p>
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
              <div>
                <p className="text-ember font-ui font-ui-xlight text-[10px] uppercase">Gross Tonnage</p>
                <p className="text-vellum font-ui font-ui-light text-sm">{data.ship.gross_tonnage.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-ember font-ui font-ui-xlight text-[10px] uppercase">Length</p>
                <p className="text-vellum font-ui font-ui-light text-sm">{data.ship.length_m}m / {Math.round(data.ship.length_m * 3.281)}ft</p>
              </div>
              <div>
                <p className="text-ember font-ui font-ui-xlight text-[10px] uppercase">Passengers</p>
                <p className="text-vellum font-ui font-ui-light text-sm">{data.ship.passengers}</p>
              </div>
              <div>
                <p className="text-ember font-ui font-ui-xlight text-[10px] uppercase">Crew</p>
                <p className="text-vellum font-ui font-ui-light text-sm">{data.ship.crew}</p>
              </div>
              <div>
                <p className="text-ember font-ui font-ui-xlight text-[10px] uppercase">Built</p>
                <p className="text-vellum font-ui font-ui-light text-sm">{data.ship.year_built}</p>
              </div>
              <div>
                <p className="text-ember font-ui font-ui-xlight text-[10px] uppercase">Flag</p>
                <p className="text-vellum font-ui font-ui-light text-sm">{data.ship.flag}</p>
              </div>
            </div>
            </div>{/* /p-5 */}
          </div>{/* /card */}
        </div>
      )}

      {/* Voyage Route */}
      {data && (
        <div className="px-6 py-4">
          <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase mb-3">Route</p>
          <div className="bg-layer rounded-xl p-5 border border-between">
            <div className="flex justify-between mb-2">
              <span className="text-ember font-ui font-ui-xlight text-xs">Embark</span>
              <span className="text-vellum font-ui font-ui-light text-sm">{data.voyage.embark_port}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-ember font-ui font-ui-xlight text-xs">Disembark</span>
              <span className="text-vellum font-ui font-ui-light text-sm">{data.voyage.disembark_port}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-ember font-ui font-ui-xlight text-xs">Cruise Nights</span>
              <span className="text-vellum font-ui font-ui-light text-sm">{data.voyage.cruise_nights}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ember font-ui font-ui-xlight text-xs">Route</span>
              <span className="text-dusk font-ui font-ui-xlight text-xs text-right max-w-[60%]">{data.voyage.route}</span>
            </div>
          </div>
        </div>
      )}

      {/* Weather Preview */}
      {weather.length > 0 && (
        <div className="px-6 py-4">
          <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase mb-3">Port Weather</p>
          <div className="space-y-2">
            {weather
              .filter(w => w.forecast && ['port', 'embark', 'disembark', 'excursion'].includes(w.type))
              .slice(0, 8)
              .map((w, i) => (
                <div key={i} className="bg-layer rounded-lg p-3.5 border border-between flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-vellum font-ui font-ui-light text-sm truncate">{w.port}</p>
                    <p className="text-ember font-ui font-ui-xlight text-xs">{formatDate(w.date)}</p>
                  </div>
                  {w.forecast && (
                    <div className="text-right shrink-0">
                      <p className="text-dusk font-ui font-ui-xlight text-xs">{w.forecast.condition}</p>
                      <p className="text-vellum font-ui font-ui-light text-sm">
                        {Math.round(w.forecast.temp_high_f)}&deg; / {Math.round(w.forecast.temp_low_f)}&deg;F
                      </p>
                      <p className="text-ember font-ui font-ui-xlight text-[10px]">
                        Wind {Math.round(w.forecast.wind_max_mph)} mph
                      </p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="px-6 py-4">
        <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase mb-3">Quick Links</p>

        {/* Wayfinder Featured Link */}
        <button
          onClick={() => navigate('/wayfinder')}
          className="w-full bg-layer rounded-xl p-4 border border-[#e60012]/20 hover:border-[#e60012]/40 hover:bg-hover transition-colors duration-300 mb-2.5 text-left"
          style={{ background: 'linear-gradient(135deg, rgba(230,0,18,0.04) 0%, rgba(107,91,149,0.04) 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e60012]/15 border border-[#e60012]/30 flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold bg-[#e60012] rounded-full w-6 h-6 flex items-center justify-center">M</span>
            </div>
            <div className="flex-1">
              <p className="text-vellum font-ui font-ui-light text-sm">Tokyo Wayfinder</p>
              <p className="text-ember font-ui font-ui-xlight text-[10px]">Hilton Odaiba → Shinjuku · 25 min</p>
            </div>
            <svg className="w-4 h-4 text-ember shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <a
            href="https://translate.google.com/?sl=auto&tl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-layer rounded-lg p-4 border border-between hover:border-ether/30 hover:bg-hover transition-colors duration-300 text-center"
          >
            <svg className="w-6 h-6 text-ether mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 5h12M9 3v2M5 5c0 4.5 3.5 8 8 8" />
              <path d="M13 15l3 6 3-6M14 19h4" />
            </svg>
            <p className="text-vellum font-ui font-ui-light text-xs">Translator</p>
            <p className="text-ember font-ui font-ui-xlight text-[9px] mt-0.5">Google Translate</p>
          </a>

          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-layer rounded-lg p-4 border border-between hover:border-ether/30 hover:bg-hover transition-colors duration-300 text-center"
          >
            <svg className="w-6 h-6 text-ether mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2a10 10 0 00-8.66 15l-1.28 4.68 4.68-1.28A10 10 0 1012 2z" />
              <path d="M8 10c0-.55.45-1 1-1s1 .45 1 1-.45 2-1 2m6-2c0-.55-.45-1-1-1s-1 .45-1 1 .45 2 1 2" />
            </svg>
            <p className="text-vellum font-ui font-ui-light text-xs">WhatsApp</p>
            <p className="text-ember font-ui font-ui-xlight text-[9px] mt-0.5">Send message</p>
          </a>

          <a
            href="https://www.cruisemapper.com/ships/Silver-Nova-2045"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-layer rounded-lg p-4 border border-between hover:border-gold/30 hover:bg-hover transition-colors duration-300 text-center"
          >
            <svg className="w-6 h-6 text-gold mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 17l2-4h14l2 4" />
              <path d="M5 13l1-6h12l1 6" />
              <path d="M12 7V3" />
            </svg>
            <p className="text-vellum font-ui font-ui-light text-xs">CruiseMapper</p>
            <p className="text-ember font-ui font-ui-xlight text-[9px] mt-0.5">Live ship tracker</p>
          </a>

          <div className="bg-layer rounded-lg p-4 border border-witness/20 text-center">
            <svg className="w-6 h-6 text-witness mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 9v4M12 17h.01" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            <p className="text-vellum font-ui font-ui-light text-xs">Medical</p>
            <p className="text-ember font-ui font-ui-xlight text-[9px] mt-0.5 leading-relaxed">
              Ship: Deck 4 Med Center<br />Emergency: 911 / 112
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="px-6 py-4 border-t border-between">
        <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase mb-3">Emergency Contacts</p>
        <div className="bg-layer rounded-xl p-5 border border-witness/20 space-y-3.5">
          {[
            { label: 'Ship Medical Center', detail: 'Deck 4 · Call 911 (internal)', note: 'Silver Nova' },
            { label: 'Silversea Guest Services', detail: '+1 800-722-9955', note: '24/7' },
            { label: 'D2M Concierge', detail: '+1 719-291-0742', note: 'John · Dreams2Memories' },
            { label: 'US Embassy Tokyo', detail: '+81 3-3224-5000', note: 'Pre-cruise · Apr 19–23' },
            { label: 'US Consulate Sapporo', detail: '+81 11-641-1115', note: 'Hokkaido coverage' },
            { label: 'Global Emergency', detail: '112', note: 'International SOS' },
          ].map((c, i) => (
            <div key={i} className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-vellum font-ui font-ui-light text-sm truncate">{c.label}</p>
                <p className="text-ember font-ui font-ui-xlight text-[10px]">{c.note}</p>
              </div>
              <p className="text-dusk font-ui font-ui-xlight text-xs text-right shrink-0">{c.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="px-8 py-16 text-center">
          <p className="text-witness font-ui font-ui-light text-sm">Could not load bridge data.</p>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
