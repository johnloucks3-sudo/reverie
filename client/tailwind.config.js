/** @type {import('tailwindcss').Config} */
// REVERIE Design Tokens — Luna Voss, A6 · 26 MAR 2026
// Emotional register: RECOGNIZED
// "A beautifully organized journal handed to you by someone who loves you."
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds — lifted for daylight legibility, keeping the ethereal register
        vault:   '#1E1A30', // Primary BG — deep purple, readable in light
        page:    '#272240', // Surface 1 — card resting place
        layer:   '#33304E', // Surface 2 — modals, drawers
        hover:   '#3E3A5C', // Surface 3 — touch states, focus rings
        between: '#3A3552', // Divider — separates without cutting

        // Accents
        gold:     '#ECC87E', // Candlelight — warm amber
        'gold-glow': 'rgba(236, 200, 126, 0.16)', // Ambient corona
        ether:    '#AAA0D0', // Twilight — brightened lavender
        witness:  '#CC8C84', // The Witness — dusty rose

        // Text — brightened significantly for daylight contrast
        vellum:   '#F4EFE6', // Primary — aged cream
        dusk:     '#CABCAA', // Secondary — warm taupe, legible in sun
        ember:    '#8E8480', // Muted — metadata, timestamps
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
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        rise: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(236, 200, 126, 0)' },
          '50%': { boxShadow: '0 0 22px 5px rgba(236, 200, 126, 0.28)' },
        },
      }
    }
  },
  plugins: []
}
