import { useEffect, useState } from 'react'
import { api } from '@/shared/lib/api'
import BottomNav from '@/shared/ui/BottomNav'

interface Port {
  name: string
  date: string
  type: string
  notes: string
}

interface Itinerary {
  voyage_name: string
  ship: string
  cabin: string
  route: string
  embark_date: string
  disembark_date: string
  full_journey_days: number
  full_journey_start: string
  ports: Port[]
}

const TYPE_STYLES: Record<string, { badge: string; border: string }> = {
  'pre-cruise': { badge: 'bg-ether/20 text-ether', border: 'border-ether/30' },
  embark:       { badge: 'bg-gold/20 text-gold', border: 'border-gold/50' },
  disembark:    { badge: 'bg-gold/20 text-gold', border: 'border-gold/50' },
  port:         { badge: 'bg-witness/20 text-witness', border: 'border-witness/30' },
  sea:          { badge: 'bg-between text-dusk', border: 'border-between' },
  excursion:    { badge: 'bg-gold/20 text-gold', border: 'border-gold/30' },
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function typeLabel(type: string) {
  if (type === 'pre-cruise') return 'PRE-CRUISE'
  if (type === 'sea') return 'SEA DAY'
  return type.toUpperCase()
}

export default function VoyageScreen() {
  const [data, setData] = useState<Itinerary | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.get<Itinerary>('/api/itinerary').then(setData).catch(() => setError(true))
  }, [])

  return (
    <div className="min-h-dvh bg-vault pb-24 animate-fade-in">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-between">
        <div className="flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="13" r="8" />
            <path d="M 12 1 L 12 5 M 12 21 L 12 25 M 1 13 L 5 13 M 23 13 L 27 13" />
          </svg>
        </div>
        <h1 className="font-display-light text-gold text-2xl text-center tracking-widest">
          THE VOYAGE
        </h1>
      </div>

      {/* Voyage Hero */}
      {data && (
        <div className="px-8 py-8 border-b border-between">
          <p className="text-gold font-display-light text-3xl text-center mb-1">
            {data.ship}
          </p>
          <p className="text-gold font-display-light text-lg text-center mb-3">
            {data.route}
          </p>
          <p className="text-dusk font-ui font-ui-light text-sm text-center mb-1">
            {formatDate(data.full_journey_start)} &ndash; {formatDate(data.disembark_date)}
          </p>
          <p className="text-ember font-ui font-ui-xlight text-xs text-center">
            {data.full_journey_days} days &middot; Cabin {data.cabin}
          </p>
        </div>
      )}

      {/* Loading / Error */}
      {!data && !error && (
        <div className="px-8 py-16 text-center">
          <p className="text-dusk font-ui font-ui-light text-sm animate-pulse">Loading your voyage...</p>
        </div>
      )}
      {error && (
        <div className="px-8 py-16 text-center">
          <p className="text-witness font-ui font-ui-light text-sm">Could not load itinerary. Please try again.</p>
        </div>
      )}

      {/* Port List */}
      {data && (
        <div className="px-6 py-6 space-y-3">
          {data.ports.map((port, idx) => {
            const style = TYPE_STYLES[port.type] ?? TYPE_STYLES.sea
            return (
              <div
                key={idx}
                className={`bg-layer rounded-lg p-5 border ${style.border} hover:bg-hover transition-colors duration-300`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-vellum font-display-light text-lg flex-1 mr-3">
                    {port.name}
                  </p>
                  <span className={`${style.badge} font-ui font-ui-xlight text-[10px] tracking-wider uppercase px-2 py-1 rounded shrink-0`}>
                    {typeLabel(port.type)}
                  </span>
                </div>
                <p className="text-dusk font-ui font-ui-light text-sm mb-1">
                  {formatDate(port.date)}
                </p>
                {port.notes && (
                  <p className="text-ember font-ui font-ui-xlight text-xs leading-relaxed">
                    {port.notes}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
