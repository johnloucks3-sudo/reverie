import { useNavigate } from 'react-router-dom'
import BottomNav from '@/shared/ui/BottomNav'

export default function ChamberScreen() {
  const navigate = useNavigate()

  const handleSignOut = () => {
    localStorage.removeItem('jwt')
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-vault pb-24 animate-fade-in">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-between">
        <div className="flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="currentColor">
            <path d="M 7 10 V 7 C 7 5 8 3 10 3 H 14 C 16 3 17 5 17 7 V 10 M 6 10 H 18 C 19 10 20 11 20 12 V 20 C 20 21 19 22 18 22 H 6 C 5 22 4 21 4 20 V 12 C 4 11 5 10 6 10 Z" />
          </svg>
        </div>
        <h1 className="font-display-light text-gold text-2xl text-center tracking-widest">
          THE CHAMBER
        </h1>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        <p className="text-dusk font-display-light-italic text-lg text-center mb-12">
          Your private room.
        </p>

        {/* Menu Items */}
        <div className="space-y-4">
          {/* Contact Dani */}
          <button
            onClick={() => navigate('/oracle')}
            className="
              w-full bg-layer rounded-lg p-5 border border-between
              hover:border-gold hover:bg-hover
              transition-colors duration-300
              text-left
            "
          >
            <p className="text-vellum font-ui font-ui-light text-base">
              Contact Dani
            </p>
            <p className="text-dusk font-ui font-ui-xlight text-xs mt-1">
              Reach your concierge directly
            </p>
          </button>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="
              w-full bg-layer rounded-lg p-5 border border-between
              hover:border-gold hover:bg-hover
              transition-colors duration-300
              text-left
            "
          >
            <p className="text-vellum font-ui font-ui-light text-base">
              Sign out
            </p>
            <p className="text-dusk font-ui font-ui-xlight text-xs mt-1">
              End your session
            </p>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
