/** @type {import('tailwindcss').Config} */
// REVERIE Design Tokens — Luna Voss, A6 · 26 MAR 2026
// Emotional register: RECOGNIZED
// "A beautifully organized journal handed to you by someone who loves you."
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds — "the dark of a candlelit room, not a server rack"
        vault:   '#151220', // Primary BG — deep but not pitch black
        page:    '#1E1A2E', // Surface 1 — card resting place
        layer:   '#2A243C', // Surface 2 — modals, drawers
        hover:   '#342D4A', // Surface 3 — touch states, focus rings
        between: '#322A44', // Divider — separates without cutting

        // Accents
        gold:     '#E8C07A', // Candlelight — brightened for legibility on vault
        'gold-glow': 'rgba(232, 192, 122, 0.14)', // Ambient corona
        ether:    '#9B8EC4', // Twilight — muted lavender, the dream-state
        witness:  '#C4847A', // The Witness — dusty rose, the human note

        // Text
        vellum:   '#EDE8DE', // Primary — aged cream, never clinical white
        dusk:     '#B0A090', // Secondary — warm taupe, lightened for legibility
        ember:    '#6A6060', // Muted — metadata, timestamps, lightened
      },
      fontFamily: {
        // Cormorant: anything the user *feels*
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        // Outfit: anything the user *does*
        ui: ['Outfit', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        'display-light': '300',
        'ui-xlight': '200',
        'ui-light': '300',
      },
      boxShadow: {
        gold: '0 0 24px rgba(201, 168, 124, 0.15)',
        'gold-sm': '0 0 12px rgba(201, 168, 124, 0.10)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'rise': 'rise 0.5s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        rise: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      }
    }
  },
  plugins: []
}
