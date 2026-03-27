import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '@/shared/lib/api'
import BottomNav from '@/shared/ui/BottomNav'

interface Profile {
  travelers: string[]
  agency: string
  concierge: string
  voyage: {
    name: string; id: string; booking_ref: string; ship: string; cabin: string
    deck: number; embark: string; disembark: string; cruise_nights: number
    full_journey_days: number; route: string
  }
  stats: {
    total_bookings: number; flights: number; hotels: number
    excursions_booked: number; dining_reservations: number
    countries: string[]; ports_of_call: number; sea_days: number
    total_invested_usd: number
  }
}

interface Doc {
  category: string; title: string; detail: string; status: string; ref: string
}
interface DocsResp { documents: Doc[] }

function formatMoney(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
}

export default function ChamberScreen() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [docs, setDocs] = useState<Doc[]>([])

  useEffect(() => {
    api.get<Profile>('/api/profile').then(setProfile).catch(() => {})
    api.get<DocsResp>('/api/documents').then(r => setDocs(r.documents)).catch(() => {})
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('reverie_token')
    navigate('/login', { replace: true })
  }

  const voyage = profile?.voyage
  const stats = profile?.stats

  const DOC_ICONS: Record<string, string> = {
    cruise: 'M3 17l2-4h14l2 4',
    flight: 'M3 12l2-2 4 2 8-6 2 2-8 4-4 2-2-2 4 8 2 4-2 2z',
    hotel: 'M3 21V7h6v6h6V7h6v14',
    excursion: 'M12 2L2 12h3v8h6v-6h2v6h6v-8h3z',
    transfer: 'M5 17h14M7 9l5-5 5 5M12 4v12',
  }

  return (
    <div className="min-h-dvh bg-vault pb-24 animate-fade-in">
      {/* Header */}
      <div className="px-8 pt-8 pb-5 border-b border-between">
        <div className="flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="currentColor">
            <path d="M 7 10 V 7 C 7 5 8 3 10 3 H 14 C 16 3 17 5 17 7 V 10 M 6 10 H 18 C 19 10 20 11 20 12 V 20 C 20 21 19 22 18 22 H 6 C 5 22 4 21 4 20 V 12 C 4 11 5 10 6 10 Z" />
          </svg>
        </div>
        <h1 className="font-display text-gold text-2xl text-center tracking-widest font-light">
          THE CHAMBER
        </h1>
        <p className="text-ember font-ui font-ui-xlight text-xs text-center mt-1">Your private room</p>
      </div>

      {/* Travelers */}
      {profile && (
        <div className="px-6 py-6 border-b border-between">
          <p className="text-vellum font-display text-xl font-light text-center mb-1">
            {profile.travelers.join(' & ')}
          </p>
          <p className="text-dusk font-ui font-ui-xlight text-xs text-center">
            {profile.agency}
          </p>
          <p className="text-ember font-ui font-ui-xlight text-xs text-center mt-1">
            Concierge: {profile.concierge}
          </p>
        </div>
      )}

      {/* Voyage Details */}
      {voyage && (
        <div className="px-6 py-5 border-b border-between">
          <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase mb-3">Voyage Details</p>
          <div className="bg-layer rounded-xl p-5 border border-between space-y-3">
            <div className="flex justify-between">
              <span className="text-ember font-ui font-ui-xlight text-xs">Ship</span>
              <span className="text-vellum font-ui font-ui-light text-sm">{voyage.ship}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ember font-ui font-ui-xlight text-xs">Cabin</span>
              <span className="text-vellum font-ui font-ui-light text-sm">{voyage.cabin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ember font-ui font-ui-xlight text-xs">Deck</span>
              <span className="text-vellum font-ui font-ui-light text-sm">{voyage.deck}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ember font-ui font-ui-xlight text-xs">Booking Ref</span>
              <span className="text-gold font-ui font-ui-light text-sm">{voyage.booking_ref}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ember font-ui font-ui-xlight text-xs">Voyage ID</span>
              <span className="text-dusk font-ui font-ui-xlight text-sm">{voyage.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ember font-ui font-ui-xlight text-xs">Duration</span>
              <span className="text-vellum font-ui font-ui-light text-sm">{voyage.full_journey_days} days ({voyage.cruise_nights} nights aboard)</span>
            </div>
            <div className="border-t border-between pt-3">
              <p className="text-dusk font-ui font-ui-xlight text-xs leading-relaxed">{voyage.route}</p>
            </div>
          </div>
        </div>
      )}

      {/* Trip Stats */}
      {stats && (
        <div className="px-6 py-5 border-b border-between">
          <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase mb-3">Trip Statistics</p>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-layer rounded-lg p-4 border border-between text-center">
              <p className="text-gold font-display text-2xl font-light">{stats.total_bookings}</p>
              <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase">bookings</p>
            </div>
            <div className="bg-layer rounded-lg p-4 border border-between text-center">
              <p className="text-gold font-display text-2xl font-light">{stats.flights}</p>
              <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase">flights</p>
            </div>
            <div className="bg-layer rounded-lg p-4 border border-between text-center">
              <p className="text-gold font-display text-2xl font-light">{stats.hotels}</p>
              <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase">hotels</p>
            </div>
            <div className="bg-layer rounded-lg p-4 border border-between text-center">
              <p className="text-gold font-display text-2xl font-light">{stats.dining_reservations}</p>
              <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase">dining res</p>
            </div>
            <div className="bg-layer rounded-lg p-4 border border-between text-center">
              <p className="text-gold font-display text-2xl font-light">{stats.ports_of_call}</p>
              <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase">ports</p>
            </div>
            <div className="bg-layer rounded-lg p-4 border border-between text-center">
              <p className="text-gold font-display text-2xl font-light">{stats.sea_days}</p>
              <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase">sea days</p>
            </div>
            <div className="bg-layer rounded-lg p-4 border border-between text-center col-span-2">
              <p className="text-gold font-display text-3xl font-light">{formatMoney(stats.total_invested_usd)}</p>
              <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase">total investment</p>
            </div>
          </div>
        </div>
      )}

      {/* Documents Vault */}
      {docs.length > 0 && (
        <div className="px-6 py-5 border-b border-between">
          <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase mb-3">Document Vault</p>
          <div className="space-y-2">
            {docs.map((doc, i) => (
              <div key={i} className="bg-layer rounded-lg p-4 border border-between hover:bg-hover transition-colors duration-300">
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-gold shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d={DOC_ICONS[doc.category] ?? DOC_ICONS.excursion} />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-vellum font-ui font-ui-light text-sm">{doc.title}</p>
                    <p className="text-ember font-ui font-ui-xlight text-xs mt-0.5">{doc.detail}</p>
                    <div className="flex justify-between items-center mt-1.5">
                      <span className="text-dusk font-ui font-ui-xlight text-xs">{doc.ref}</span>
                      <span className={`font-ui font-ui-xlight text-[10px] tracking-wider uppercase px-2 py-0.5 rounded ${
                        doc.status === 'paid in full' ? 'bg-gold/15 text-gold' : 'bg-ether/15 text-ether'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-5 space-y-3">
        <button
          onClick={() => navigate('/oracle')}
          className="w-full bg-layer rounded-lg p-4 border border-between hover:border-gold hover:bg-hover transition-colors duration-300 text-left"
        >
          <p className="text-vellum font-ui font-ui-light text-sm">Contact Dani</p>
          <p className="text-ember font-ui font-ui-xlight text-xs mt-0.5">Reach your concierge directly</p>
        </button>

        <button
          onClick={() => navigate('/journal')}
          className="w-full bg-layer rounded-lg p-4 border border-between hover:border-gold/40 hover:bg-hover transition-colors duration-300 text-left"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gold shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4h16v16H4zM8 8h8M8 12h6M8 16h4" />
            </svg>
            <div>
              <p className="text-vellum font-ui font-ui-light text-sm">Afterglow Journal</p>
              <p className="text-ember font-ui font-ui-xlight text-xs mt-0.5">Capture moments, notes & memories</p>
            </div>
          </div>
        </button>

        <button
          onClick={handleSignOut}
          className="w-full bg-layer rounded-lg p-4 border border-between hover:border-witness/50 hover:bg-hover transition-colors duration-300 text-left"
        >
          <p className="text-vellum font-ui font-ui-light text-sm">Sign out</p>
          <p className="text-ember font-ui font-ui-xlight text-xs mt-0.5">End your session</p>
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
