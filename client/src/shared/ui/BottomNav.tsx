import { Link, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const location = useLocation()

  const navItems = [
    { label: 'REVERIE', icon: '◆', path: '/' },
    { label: 'THE VOYAGE', icon: '⚓', path: '/voyage' },
    { label: 'THE ORACLE', icon: '☽', path: '/oracle' },
    { label: 'THE CHAMBER', icon: '🗝', path: '/chamber' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-page border-t border-between safe-area-inset-bottom">
      <div className="flex justify-between px-4 py-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center text-center text-xs font-ui font-ui-light tracking-wider uppercase transition-colors duration-300 ${
                isActive ? 'text-gold' : 'text-ember hover:text-dusk'
              }`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
