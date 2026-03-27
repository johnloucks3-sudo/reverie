import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'REVERIE', path: '/', icon: 'M 12 24 Q 18 18 24 18 Q 20 24 24 30 Q 18 30 12 24 Z' },
  { label: 'VOYAGE', path: '/voyage', icon: 'M12 1L12 5M12 21L12 25M1 13L5 13M19 13L23 13 M12 5a8 8 0 100 16 8 8 0 000-16z' },
  { label: 'BRIDGE', path: '/bridge', icon: 'M3 17l2-4h14l2 4M5 13l1-6h12l1 6M12 7V3' },
  { label: 'ORACLE', path: '/oracle', icon: 'M 12 2 Q 6 8 6 14 Q 6 20 12 22 Q 18 20 18 14 Q 18 8 12 2 Z' },
  { label: 'CHAMBER', path: '/chamber', icon: 'M 7 10 V 7 C 7 5 8 3 10 3 H 14 C 16 3 17 5 17 7 V 10 M 6 10 H 18 C 19 10 20 11 20 12 V 20 C 20 21 19 22 18 22 H 6 C 5 22 4 21 4 20 V 12 C 4 11 5 10 6 10 Z' },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-page border-t border-between safe-area-inset-bottom z-50">
      <div className="flex justify-between px-2 py-2.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center text-center min-w-0 px-1 transition-colors duration-300 ${
                isActive ? 'text-gold' : 'text-ember hover:text-dusk'
              }`}
            >
              <svg className="w-5 h-5 mb-1" viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                <path d={item.icon} />
              </svg>
              <span className="font-ui font-ui-xlight text-[9px] tracking-wider uppercase leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
