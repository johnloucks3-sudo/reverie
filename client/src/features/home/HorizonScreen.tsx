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

export default function HorizonScreen() {
  const [itin, setItin] = useState<Itinerary | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [countries, setCountries] = useState<string[]>([])

  useEffect(() => {
    api.get<Itinerary>('/api/itinerary').then(setItin).catch(() => {})
    api.get<BookingsResp>('/api/bookings').then(r => setBookings(r.bookings)).catch(() => {})
    api.get<{ stats: { countries: string[] } }>('/api/profile').then(r => setCountries(r.stats.countries)).catch(() => {})
  }, [])

  const firstName = itin?.client_name?.split(' ')[0] ?? 'Traveler'
  const countdown = itin ? daysUntil(itin.full_journey_start) : null
  const totalSpend = bookings.reduce((s, b) => s + b.amount_usd, 0)
  const confirmedCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'paid in full').length

  // Next 3 upcoming ports from today
  const upcoming = (itin?.ports ?? [])
    .filter(p => new Date(p.date + 'T00:00:00') >= new Date(new Date().toDateString()))
    .slice(0, 3)

  return (
    <div className="min-h-dvh bg-vault pb-24 animate-fade-in">
      {/* Header */}
      <div className="px-8 pt-10 pb-6">
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
      </div>

      {/* Countdown Card */}
      {countdown !== null && (
        <div className="px-6 mb-6">
          <div className="bg-layer rounded-xl p-6 border border-between text-center">
            <p className="text-gold font-display text-6xl font-light mb-1">{countdown}</p>
            <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase">
              days until departure
            </p>
            <p className="text-ember font-ui font-ui-xlight text-xs mt-2">
              {itin ? formatDate(itin.full_journey_start) : ''}
              {itin ? ` — ${formatDate(itin.disembark_date)}` : ''}
            </p>
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
