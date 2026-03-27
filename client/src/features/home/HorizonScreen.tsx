import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '@/shared/lib/api'
import BottomNav from '@/shared/ui/BottomNav'

interface Port { name: string; date: string; type: string; notes: string }
interface Itinerary {
  client_name: string; voyage_name: string; ship: string; cabin: string
  route: string; embark_date: string; disembark_date: string
  full_journey_days: number; full_journey_start: string; ports: Port[]
}
interface Booking {
  type: string; description: string; confirmation: string
  status: string; amount_usd: number
}
interface BookingsResp { bookings: Booking[] }
interface SeaLetter { date: string; day_label: string; location: string; letter: string }
interface SeaLettersResp { letters: SeaLetter[] }

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function daysUntil(iso: string) {
  const now = new Date(); now.setHours(0,0,0,0)
  const target = new Date(iso + 'T00:00:00')
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000))
}

function formatMoney(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const TYPE_ICON: Record<string, string> = {
  flight: 'M3 12l2-2 4 2 8-6 2 2-8 4-4 2-2-2 4 8 2 4-2 2z',
  hotel: 'M3 21V7h6v6h6V7h6v14',
  cruise: 'M3 17l2-4h14l2 4M5 13l1-6h12l1 6M8 7V3h8v4',
  excursion: 'M12 2L2 12h3v8h6v-6h2v6h6v-8h3z',
  transfer: 'M5 17h14M7 9l5-5 5 5M12 4v12',
}

const SHIP_IMG = 'https://cdn.sanity.io/images/rd0y3pad/production/5946a7b3eb1ac569f3603639c0962c97c1cd9230-4032x3024.jpg?w=1200&q=80&fit=max&auto=format'

const TYPE_BADGE: Record<string, string> = {
  embark:    'border-gold/40 text-gold',
  disembark: 'border-gold/40 text-gold',
  port:      'border-ember/40 text-ember',
  sea:       'border-ether/40 text-ether',
  excursion: 'border-ember/40 text-ember',
  'pre-cruise': 'border-dusk/40 text-dusk',
}

const TYPE_LABEL: Record<string, string> = {
  embark: 'Embarkation', disembark: 'Disembarkation',
  port: 'Port Day', sea: 'Day at Sea', excursion: 'Excursion',
  'pre-cruise': 'Pre-Cruise',
}

export default function HorizonScreen() {
  const [itin, setItin] = useState<Itinerary | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [seaLetters, setSeaLetters] = useState<Map<string, SeaLetter>>(new Map())
  const [letterExpanded, setLetterExpanded] = useState(false)

  useEffect(() => {
    api.get<Itinerary>('/api/itinerary').then(setItin).catch(() => {})
    api.get<BookingsResp>('/api/bookings').then(r => setBookings(r.bookings)).catch(() => {})
    api.get<{ stats: { countries: string[] } }>('/api/profile').then(r => setCountries(r.stats.countries)).catch(() => {})
    api.get<SeaLettersResp>('/api/sea-letters').then(r => {
      setSeaLetters(new Map(r.letters.map(l => [l.date, l])))
    }).catch(() => {})
  }, [])

  const firstName = itin?.client_name?.split(' ')[0] ?? 'Traveler'
  const countdown = itin ? daysUntil(itin.full_journey_start) : null

  // Voyage phase calculation
  const todayMidnight = new Date(); todayMidnight.setHours(0,0,0,0)
  const journeyStart = itin ? new Date(itin.full_journey_start + 'T00:00:00') : null
  const disembarkDate = itin ? new Date(itin.disembark_date + 'T00:00:00') : null
  const daysElapsed = journeyStart
    ? Math.floor((todayMidnight.getTime() - journeyStart.getTime()) / 86400000)
    : -1
  const voyageDay = daysElapsed + 1
  const voyageOver = disembarkDate ? todayMidnight > disembarkDate : false

  const todayISO = todayMidnight.toISOString().split('T')[0]
  const todayPort = itin?.ports.find(p => p.date === todayISO) ?? null
  const todayLetter = seaLetters.get(todayISO) ?? null
  const totalSpend = bookings.reduce((s, b) => s + b.amount_usd, 0)
  const confirmedCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'paid in full').length

  // Next 3 upcoming ports from today
  const upcoming = (itin?.ports ?? [])
    .filter(p => new Date(p.date + 'T00:00:00') >= new Date(new Date().toDateString()))
    .slice(0, 3)

  return (
    <div className="min-h-dvh bg-vault pb-24 animate-fade-in">
      {/* Header */}
      <div className="relative px-8 pt-10 pb-6 overflow-hidden">
        <img
          src={SHIP_IMG}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.38] pointer-events-none select-none"
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-vault/40 via-vault/70 to-vault pointer-events-none" />
        <div className="relative z-10">
        <div className="mb-8 text-center">
          <svg className="w-10 h-10 mx-auto mb-3 text-gold" viewBox="0 0 48 48" fill="currentColor">
            <path d="M 12 24 Q 18 18 24 18 Q 20 24 24 30 Q 18 30 12 24 Z" />
            <path d="M 36 12 L 38 20 L 46 20 L 40 25 L 42 33 L 36 28 L 30 33 L 32 25 L 26 20 L 34 20 Z" />
          </svg>
          <p className="font-display text-gold text-4xl italic">REVERIE</p>
        </div>
        <p className="text-vellum font-display text-2xl text-center font-light mb-1">
          Welcome back, {firstName}.
        </p>
        <p className="text-dusk font-ui font-ui-xlight text-sm text-center">
          Your voyage awaits.
        </p>
        </div>{/* /z-10 */}
      </div>

      {/* Countdown / Voyage Day Card */}
      {countdown !== null && (
        <div className="px-6 mb-6">
          <div className="bg-layer rounded-xl p-6 border border-between text-center">
            {countdown > 0 ? (
              <>
                <p className="text-gold font-display text-6xl font-light mb-1">{countdown}</p>
                <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase">
                  days until departure
                </p>
              </>
            ) : voyageOver ? (
              <>
                <p className="text-gold font-display text-2xl font-light mb-2">Voyage Complete</p>
                <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase">
                  The memories are yours
                </p>
              </>
            ) : voyageDay === 1 ? (
              <>
                <p className="text-gold font-display text-5xl font-light mb-2">It begins.</p>
                <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase">
                  Departure Day
                </p>
              </>
            ) : (
              <>
                <p className="text-gold font-display text-6xl font-light mb-1">{voyageDay}</p>
                <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase">
                  Day of {itin?.full_journey_days ?? 32}
                </p>
              </>
            )}
            <p className="text-ember font-ui font-ui-xlight text-xs mt-2">
              {itin ? formatDate(itin.full_journey_start) : ''}
              {itin ? ` — ${formatDate(itin.disembark_date)}` : ''}
            </p>
          </div>
        </div>
      )}

      {/* Today Card */}
      {todayPort && (
        <div className="px-6 mb-6">
          <div className="bg-layer rounded-xl p-5 border border-gold/40"
            style={{ boxShadow: '0 0 20px rgba(232, 192, 122, 0.14)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gold font-ui font-ui-xlight text-[10px] tracking-widest uppercase">Today</span>
              <span className={`font-ui font-ui-xlight text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full border ${TYPE_BADGE[todayPort.type] ?? 'border-dusk/40 text-dusk'}`}>
                {TYPE_LABEL[todayPort.type] ?? todayPort.type}
              </span>
            </div>
            <p className="text-vellum font-display text-xl font-light mb-2">{todayPort.name}</p>
            {todayPort.notes && (
              <p className="text-ember font-ui font-ui-xlight text-xs leading-relaxed">{todayPort.notes}</p>
            )}
          </div>
        </div>
      )}

      {/* Sea Letter */}
      {todayLetter && (
        <div className="px-6 mb-6">
          <div className="bg-layer rounded-xl border border-ether/20"
            style={{ boxShadow: '0 0 24px rgba(141, 165, 185, 0.07)' }}>
            <button
              className="w-full p-5 text-left"
              onClick={() => setLetterExpanded(e => !e)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ether font-ui font-ui-xlight text-[10px] tracking-widest uppercase mb-0.5">
                    Today's Letter
                  </p>
                  <p className="text-vellum font-display text-base font-light">{todayLetter.day_label}</p>
                  <p className="text-dusk font-ui font-ui-xlight text-[10px] mt-0.5">{todayLetter.location}</p>
                </div>
                <svg
                  className={`w-4 h-4 text-ether shrink-0 transition-transform duration-300 ${letterExpanded ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </button>
            {letterExpanded && (
              <div className="px-5 pb-5 border-t border-ether/10">
                <p className="text-vellum font-ui font-ui-light text-sm leading-relaxed whitespace-pre-line pt-4">
                  {todayLetter.letter}
                </p>
                <p className="text-dusk font-ui font-ui-xlight text-[10px] mt-4 text-right tracking-wider">
                  — Dani, Dreams2Memories
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Voyage Card */}
      {itin && (
        <div className="px-6 mb-6">
          <Link to="/voyage" className="block">
            <div className="bg-layer rounded-xl p-6 border border-between hover:border-gold transition-colors duration-300"
              style={{ boxShadow: '0 0 24px rgba(232, 192, 122, 0.08)' }}>
              <p className="text-gold font-display text-2xl font-light mb-1">{itin.ship}</p>
              <p className="text-ether font-display text-base font-light mb-3">{itin.route}</p>
              <div className="flex justify-between text-xs font-ui font-ui-xlight">
                <span className="text-dusk">{itin.full_journey_days} days</span>
                <span className="text-dusk">Cabin {itin.cabin}</span>
              </div>
              <div className="flex justify-between text-xs font-ui font-ui-xlight mt-1">
                <span className="text-ember">{itin.ports.filter(p=>p.type==='port').length} ports</span>
                <span className="text-ember">{itin.ports.filter(p=>p.type==='sea').length} sea days</span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Stats Row */}
      {bookings.length > 0 && (
        <div className="px-6 mb-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-layer rounded-lg p-4 border border-between text-center">
              <p className="text-gold font-display text-2xl font-light">{confirmedCount}</p>
              <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase">bookings</p>
            </div>
            <div className="bg-layer rounded-lg p-4 border border-between text-center">
              <p className="text-gold font-display text-2xl font-light">{countries.length}</p>
              <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase">countries</p>
            </div>
            <div className="bg-layer rounded-lg p-4 border border-between text-center">
              <p className="text-gold font-display text-lg font-light">{formatMoney(totalSpend)}</p>
              <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase">invested</p>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Summary */}
      {bookings.length > 0 && (
        <div className="px-6 mb-6">
          <Link to="/voyage" className="block">
            <div className="bg-layer rounded-xl p-5 border border-between hover:border-gold transition-colors duration-300">
              <p className="text-vellum font-ui font-ui-light text-sm mb-3">Your Bookings</p>
              <div className="space-y-2">
                {bookings.slice(0, 4).map((b, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-gold shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d={TYPE_ICON[b.type] ?? TYPE_ICON.excursion} />
                    </svg>
                    <p className="text-dusk font-ui font-ui-xlight text-xs flex-1 truncate">{b.description}</p>
                    <span className="text-ember font-ui font-ui-xlight text-[10px] shrink-0">{b.confirmation}</span>
                  </div>
                ))}
                {bookings.length > 4 && (
                  <p className="text-gold font-ui font-ui-xlight text-xs text-center pt-1">
                    +{bookings.length - 4} more bookings
                  </p>
                )}
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Next Up */}
      {upcoming.length > 0 && (
        <div className="px-6 mb-6">
          <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase mb-3 px-1">Coming Up</p>
          <div className="space-y-2">
            {upcoming.map((port, i) => (
              <Link to="/voyage" key={i} className="block">
                <div className="bg-layer rounded-lg p-4 border border-between hover:border-gold transition-colors duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 mr-3">
                      <p className="text-vellum font-display text-base font-light">{port.name}</p>
                      {port.notes && (
                        <p className="text-ember font-ui font-ui-xlight text-xs mt-1">{port.notes}</p>
                      )}
                    </div>
                    <span className="text-dusk font-ui font-ui-xlight text-xs shrink-0">{formatDate(port.date)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Ask Dani CTA */}
      <div className="px-6 pb-8">
        <Link
          to="/oracle"
          className="block w-full bg-hover border border-gold rounded-full py-4 px-6 text-center text-vellum font-ui font-ui-light text-sm tracking-wide hover:bg-layer transition-colors duration-300"
        >
          Ask Dani anything about your voyage...
        </Link>
      </div>

      <BottomNav />
    </div>
  )
}
