import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '@/shared/lib/api'
import BottomNav from '@/shared/ui/BottomNav'

interface Itinerary {
  client_name: string
  voyage_name: string
  ship: string
  cabin: string
  route: string
  embark_date: string
  disembark_date: string
  full_journey_days: number
  full_journey_start: string
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function HorizonScreen() {
  const [data, setData] = useState<Itinerary | null>(null)

  useEffect(() => {
    api.get<Itinerary>('/api/itinerary').then(setData).catch(() => {})
  }, [])

  const firstName = data?.client_name?.split(' ')[0] ?? 'Traveler'
  const ship = data?.ship ?? 'Silver Nova'
  const route = data?.route ?? 'Pacific Crossing'
  const dateRange = data
    ? `${formatDate(data.full_journey_start)} - ${formatDate(data.disembark_date)}`
    : ''
  const journeyLabel = data ? `${data.full_journey_days}-day journey` : ''

  return (
    <div className="min-h-dvh bg-vault pb-24 animate-fade-in">
      {/* Header */}
      <div className="px-8 pt-12 pb-8">
        <div className="mb-12">
          {/* Logo Mark: Crescent + Star */}
          <svg
            className="w-12 h-12 mx-auto mb-4 text-gold"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M 12 24 Q 18 18 24 18 Q 20 24 24 30 Q 18 30 12 24 Z" fill="currentColor" />
            <path d="M 36 12 L 38 20 L 46 20 L 40 25 L 42 33 L 36 28 L 30 33 L 32 25 L 26 20 L 34 20 Z" fill="currentColor" />
          </svg>
          <p className="font-display-light-italic text-gold text-5xl text-center">REVERIE</p>
        </div>

        {/* Greeting */}
        <p className="text-vellum font-display-light text-2xl text-center mb-2">
          Welcome back, {firstName}.
        </p>
        <p className="text-dusk font-ui font-ui-light text-sm text-center">
          Your voyage awaits.
        </p>
      </div>

      {/* Hero: Ship Silhouette */}
      <div className="px-6 mb-8">
        <div
          className="h-48 rounded-lg relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #2A243C 0%, #151220 100%)',
            boxShadow: '0 0 24px rgba(232, 192, 122, 0.08)',
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full text-gold opacity-15"
            viewBox="0 0 320 180"
            preserveAspectRatio="none"
          >
            <path
              d="M 60 140 L 80 80 L 100 90 L 120 70 L 140 85 L 160 65 L 180 80 L 200 70 L 220 85 L 240 80 L 260 140 Z"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
            />
            <line x1="160" y1="65" x2="160" y2="140" stroke="currentColor" strokeWidth="0.5" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gold opacity-40 font-display-light text-lg">{ship}</p>
          </div>
        </div>
      </div>

      {/* Voyage Card */}
      <div className="px-6 mb-8">
        <Link to="/voyage" className="block">
          <div className="bg-layer rounded-lg p-6 glow-gold border border-between hover:border-gold transition-colors duration-300">
            <p className="text-gold font-display-light text-3xl mb-1">{ship}</p>
            <p className="text-gold font-display-light text-lg mb-3">{route}</p>
            {data && (
              <>
                <p className="text-dusk font-ui font-ui-light text-sm mb-1">{dateRange}</p>
                <p className="text-ember font-ui font-ui-xlight text-xs">{journeyLabel} &middot; Cabin {data.cabin}</p>
              </>
            )}
          </div>
        </Link>
      </div>

      {/* CTA Pill */}
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
