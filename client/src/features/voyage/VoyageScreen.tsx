import BottomNav from '@/shared/ui/BottomNav'

interface Port {
  name: string
  date: string
  notes?: string
}

export default function VoyageScreen() {
  const ports: Port[] = [
    { name: 'Rome (Civitavecchia)', date: 'June 23', notes: 'Embarkation' },
    { name: 'Amalfi', date: 'June 24' },
    { name: 'Sicily', date: 'June 25' },
    { name: 'Malta', date: 'June 26' },
    { name: 'Sea Day', date: 'June 27' },
    { name: 'Mykonos', date: 'June 28' },
    { name: 'Santorini', date: 'June 29' },
    { name: 'Crete', date: 'June 30' },
    { name: 'Sea Day', date: 'July 1' },
    { name: 'Cyprus', date: 'July 2' },
    { name: 'Rome (Civitavecchia)', date: 'July 3', notes: 'Disembarkation' },
  ]

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
      <div className="px-8 py-8 border-b border-between">
        <p className="text-gold font-display-light text-3xl text-center mb-2">
          Silver Muse
        </p>
        <p className="text-gold font-display-light text-lg text-center mb-4">
          Mediterranean
        </p>
        <p className="text-dusk font-ui font-ui-light text-sm text-center">
          June 23 – July 3, 2026
        </p>
      </div>

      {/* Port List */}
      <div className="px-6 py-8 space-y-3">
        {ports.map((port, idx) => (
          <div
            key={idx}
            className="bg-layer rounded-lg p-5 border border-between hover:border-gold hover:bg-hover transition-colors duration-300"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-vellum font-display-light text-lg">
                {port.name}
              </p>
              {port.notes && (
                <span className="text-gold font-ui font-ui-xlight text-xs tracking-wider uppercase bg-hover px-2 py-1 rounded">
                  {port.notes}
                </span>
              )}
            </div>
            <p className="text-dusk font-ui font-ui-light text-sm">
              {port.date}
            </p>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
