import { useState } from 'react'
import BottomNav from '@/shared/ui/BottomNav'

// ── Tokyo Odaiba → Shinjuku (full route map) ──────────────────────────────
interface Stop {
  code: string; en: string; jp: string; line: 'rinkai' | 'saikyo'
  transfers?: string; isOrigin?: boolean; isDest?: boolean; isTransfer?: boolean
}
const SHINJUKU_STOPS: Stop[] = [
  { code: 'R-04', en: 'Tokyo Teleport', jp: '東京テレポート', line: 'rinkai', isOrigin: true, transfers: '5 min walk from Hilton Odaiba' },
  { code: 'R-05', en: 'Tennozu Isle', jp: '天王洲アイル', line: 'rinkai', transfers: 'Tokyo Monorail' },
  { code: 'R-06', en: 'Shinagawa Seaside', jp: '品川シーサイド', line: 'rinkai' },
  { code: 'R-07', en: 'Oimachi', jp: '大井町', line: 'rinkai', transfers: 'JR Keihin-Tohoku · Tokyu Oimachi' },
  { code: 'R-08', en: 'Osaki', jp: '大崎', line: 'rinkai', isTransfer: true, transfers: 'Train continues as JR Saikyo — stay on board' },
  { code: 'JA 09', en: 'Ebisu', jp: '恵比寿', line: 'saikyo', transfers: 'JR Yamanote · Hibiya H-02' },
  { code: 'JA 10', en: 'Shibuya', jp: '渋谷', line: 'saikyo', transfers: 'JR Yamanote · Ginza G-01 · Hanzomon Z-01 · Tokyu · Keio' },
  { code: 'JA 11', en: 'Shinjuku', jp: '新宿', line: 'saikyo', isDest: true, transfers: 'JR Yamanote · Marunouchi M-08 · Oedo E-27 · Odakyu · Keio' },
]
const LINE_COLORS = { rinkai: '#00b2e5', saikyo: '#00ac6b' }
const SHINJUKU_STEPS = [
  { text: 'Walk from **Hilton Odaiba** to **Tokyo Teleport Station 東京テレポート** — 5 min, follow signs to Rinkai Line' },
  { text: 'Tap in with **Suica / PASMO** — platform toward **Osaki 大崎方面**' },
  { text: 'Board a **through-service train to Shinjuku** — display says **新宿方面**' },
  { text: 'At **Osaki R-08**, train becomes JR Saikyo — **stay on board**, do not get off' },
  { text: 'Ride to **Shinjuku JA 11** — 7 stops total, ~25 min. Tap out at the gate.' },
]

// ── Pre-built Tokyo route database ───────────────────────────────────────
interface Route {
  id: string; from: string; to: string; duration: string; cost: string; mode: string; steps: string[]
}
const ROUTES: Route[] = [
  {
    id: 'shinjuku',
    from: 'Odaiba / Hilton',
    to: 'Shinjuku 新宿',
    duration: '~25 min',
    cost: '¥490 (~$3.30)',
    mode: 'TWR → JR',
    steps: [], // rendered as full route map
  },
  {
    id: 'shibuya',
    from: 'Odaiba / Hilton',
    to: 'Shibuya 渋谷',
    duration: '~22 min',
    cost: '¥440 (~$3.00)',
    mode: 'TWR → JR Saikyo',
    steps: [
      'Walk to **Tokyo Teleport R-04** — 5 min from Hilton Odaiba',
      'Rinkai Line toward **Osaki** — at Osaki, stays on as JR Saikyo',
      'Exit at **Shibuya JA 10** — 6 stops total',
      'Hachiko Exit for shopping / Scramble Crossing · use Suica/PASMO tap-in/out',
    ],
  },
  {
    id: 'ginza',
    from: 'Odaiba / Hilton',
    to: 'Ginza 銀座',
    duration: '~30 min',
    cost: '¥370 (~$2.50)',
    mode: 'Rinkai → Yurakucho Line',
    steps: [
      'Walk to **Tokyo Teleport R-04** — 5 min',
      'Rinkai Line to **Shin-Kiba R-03** (3 stops) — transfer to **Tokyo Metro Yurakucho Line Y-24**',
      'Yurakucho Line toward **Ikebukuro** — exit at **Tsukishima Y-21** or **Shintomicho Y-20**',
      'From Shintomicho: 5 min walk to Ginza main strip. Alternatively, take taxi from Odaiba (~¥2,000).',
    ],
  },
  {
    id: 'akihabara',
    from: 'Odaiba / Hilton',
    to: 'Akihabara 秋葉原',
    duration: '~35 min',
    cost: '¥400 (~$2.70)',
    mode: 'Rinkai → Keiyo Line',
    steps: [
      'Walk to **Tokyo Teleport R-04** — 5 min',
      'Rinkai Line to **Shin-Kiba R-03** — transfer to **JR Keiyo Line (Y)**',
      'JR Keiyo Line to **Tatsumi Y-30** → transfer to **JR Sobu Line** → **Akihabara**',
      'Or: Rinkai to Osaki → JR Yamanote to **Akihabara** (~40 min, ¥490). Slower but no navigation.',
    ],
  },
  {
    id: 'asakusa',
    from: 'Odaiba / Hilton',
    to: 'Asakusa 浅草',
    duration: '~45 min',
    cost: '¥640 (~$4.30)',
    mode: 'Yurikamome + Metro',
    steps: [
      'Walk to **Daiba Station** (Yurikamome Line) — 8 min from Hilton',
      'Yurikamome toward **Shimbashi 新橋** — 25 min',
      'At Shimbashi: **Ginza Line G-08** toward **Asakusa** (5 stops)',
      'Exit **Asakusa G-19** — Senso-ji Temple is 5 min walk north. IC card accepted throughout.',
    ],
  },
  {
    id: 'harajuku',
    from: 'Odaiba / Hilton',
    to: 'Harajuku / Meiji Jingu',
    duration: '~30 min',
    cost: '¥490 (~$3.30)',
    mode: 'TWR → JR Saikyo',
    steps: [
      'Walk to **Tokyo Teleport R-04** — 5 min',
      'Same Shinjuku route — exit one stop early at **Harajuku JA 09** (JR Yamanote transfer)',
      'Or: ride to **Ebisu JA 09** and change to JR Yamanote southbound 1 stop to **Harajuku**',
      'Takeshita Street entrance is 1 min from Harajuku Station east exit. Meiji Shrine is 5 min west.',
    ],
  },
  {
    id: 'harumi-ginza',
    from: 'Harumi Cruise Port',
    to: 'Ginza / Tokyo Station',
    duration: '20 min walk · 15 min taxi',
    cost: 'Free walk · ¥1,500 taxi',
    mode: 'Walk / Taxi',
    steps: [
      '**Harumi Pier** → Ginza: 1.2 km straight walk east along waterfront (20 min)',
      'For Ginza shopping area: walk north from pier along Harumi-dori ~1 km',
      'For **Tokyo Station**: taxi from pier ~¥2,000, 15 min OR walk+Yurakucho Line from Ginza',
      'Taxis queue at pier exit — useful for airport runs after disembark',
    ],
  },
]

function renderBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/)
  return parts.map((p, i) =>
    i % 2 === 1 ? <strong key={i} className="text-vellum">{p}</strong> : <span key={i}>{p}</span>
  )
}

// ── Full Tokyo Shinjuku Route Map ──────────────────────────────────────────
function ShinjukuRouteView({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-dvh bg-vault pb-24 animate-fade-in">
      <div className="px-8 pt-8 pb-4 border-b border-between">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-ember hover:text-dusk transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center flex-1">
            <h1 className="font-display text-gold text-xl tracking-widest font-light">WAYFINDER</h1>
            <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase mt-0.5">東京 · Odaiba → Shinjuku</p>
          </div>
          <div className="w-5" />
        </div>
      </div>

      <div className="px-5 py-5 space-y-2.5">
        {/* Origin → Destination */}
        <div className="bg-layer rounded-lg p-4 border border-[#4ade80]/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#4ade80]/15 border border-[#4ade80]/40 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-[#4ade80]" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6" /></svg>
          </div>
          <div>
            <p className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase">Hilton Odaiba · 現在地</p>
            <p className="text-vellum font-display text-base font-light">Tokyo Teleport</p>
            <p className="text-dusk font-ui font-ui-xlight text-xs">東京テレポート · <span className="text-[#00b2e5] font-semibold">R-04</span> · Rinkai Line</p>
          </div>
        </div>
        <div className="bg-layer rounded-lg p-4 border border-[#f472b6]/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#f472b6]/15 border border-[#f472b6]/40 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-[#f472b6]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L8 12h8L12 2z" /></svg>
          </div>
          <div>
            <p className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase">Destination · 目的地</p>
            <p className="text-vellum font-display text-base font-light">Shinjuku Station</p>
            <p className="text-dusk font-ui font-ui-xlight text-xs">新宿駅 · <span className="text-[#00ac6b] font-semibold">JA 11</span> · JR Saikyo Line</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-5 mb-5">
        <div className="rounded-xl p-4 border border-[#00b2e5]/20"
          style={{ background: 'linear-gradient(135deg, rgba(0,178,229,0.06) 0%, rgba(0,172,107,0.06) 100%)' }}>
          <div className="grid grid-cols-4 divide-x divide-white/10">
            {[['~25','Minutes'],['7','Stops'],['¥490','Fare ~$3.30'],['TWR/JR','Lines']].map(([v, l]) => (
              <div key={l} className="text-center px-2">
                <p className="text-vellum font-display text-xl font-light">{v}</p>
                <p className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Route map */}
      <div className="px-5 mb-5">
        <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase mb-3 px-1">Route Map · 路線図</p>
        <div className="bg-layer rounded-xl border border-between overflow-hidden relative">
          <div className="absolute left-[26px] top-6 bottom-6 w-1 rounded-full"
            style={{ background: 'linear-gradient(to bottom, #4ade80 0%, #00b2e5 8%, #00b2e5 55%, #00ac6b 60%, #00ac6b 92%, #f472b6 100%)' }} />
          <div className="py-3">
            {SHINJUKU_STOPS.map((stop, i) => (
              <div key={stop.code} className="flex items-center relative">
                <div className="w-[52px] flex justify-center shrink-0 z-10">
                  <div className={`rounded-full ${
                    stop.isOrigin ? 'w-[18px] h-[18px] bg-[#4ade80] shadow-[0_0_12px_rgba(74,222,128,0.5)]'
                    : stop.isDest ? 'w-[18px] h-[18px] bg-[#f472b6] shadow-[0_0_12px_rgba(244,114,182,0.5)]'
                    : stop.isTransfer ? 'w-4 h-4 bg-vault border-[3px]'
                    : 'w-3 h-3'
                  } border-2 border-layer`}
                  style={!stop.isOrigin && !stop.isDest ? { backgroundColor: stop.isTransfer ? undefined : LINE_COLORS[stop.line], borderColor: stop.isTransfer ? LINE_COLORS[stop.line] : undefined } : undefined}
                  />
                </div>
                <div className={`flex-1 py-2.5 pr-4 ${i < SHINJUKU_STOPS.length - 1 ? 'border-b border-between/50' : ''}`}>
                  <p className="font-ui font-bold text-[9px] tracking-wider" style={{ color: LINE_COLORS[stop.line] }}>
                    {stop.code}
                    {stop.isOrigin && <span className="ml-1 text-[8px]">· RINKAI LINE りんかい線</span>}
                    {stop.isTransfer && <span className="ml-1 text-[8px]">· LINE CHANGE (STAY ON TRAIN)</span>}
                    {stop.isDest && <span className="ml-1 text-[8px]">· TERMINAL</span>}
                  </p>
                  <p className={`font-ui font-ui-light text-sm ${
                    stop.isOrigin ? 'text-[#4ade80] font-semibold' : stop.isDest ? 'text-[#f472b6] font-semibold' : 'text-vellum'
                  }`}>
                    {stop.en}
                    {stop.isOrigin && <span className="ml-2 text-[8px] tracking-wider uppercase bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30 px-1.5 py-0.5 rounded font-bold align-middle">START HERE</span>}
                    {stop.isTransfer && <span className="ml-2 text-[8px] tracking-wider uppercase bg-gold/15 text-gold border border-gold/30 px-1.5 py-0.5 rounded font-bold align-middle">STAY ON BOARD</span>}
                    {stop.isDest && <span className="ml-2 text-[8px] tracking-wider uppercase bg-[#f472b6]/15 text-[#f472b6] border border-[#f472b6]/30 px-1.5 py-0.5 rounded font-bold align-middle">GET OFF HERE</span>}
                  </p>
                  <p className="text-ember font-ui font-ui-xlight text-xs">{stop.jp}</p>
                  {stop.transfers && (
                    <p className="text-gold font-ui font-ui-xlight text-[10px] mt-0.5">
                      {stop.isOrigin ? '🏨 ' : '↔ '}{stop.transfers}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step by step */}
      <div className="px-5 mb-5">
        <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase mb-3 px-1">Step by Step · 乗り方</p>
        <div className="bg-layer rounded-xl p-4 border border-between space-y-3">
          {SHINJUKU_STEPS.map((inst, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: i < 3 ? '#00b2e5' : '#00ac6b' }}>
                <span className="text-white text-[10px] font-bold">{i + 1}</span>
              </div>
              <p className="text-dusk font-ui font-ui-xlight text-xs leading-relaxed">{renderBold(inst.text)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* IC card */}
      <div className="px-5 mb-5">
        <div className="rounded-xl p-4 border border-gold/20 bg-gold/5 flex items-start gap-3">
          <span className="text-lg shrink-0">💳</span>
          <div>
            <p className="text-vellum font-ui font-ui-light text-xs leading-relaxed">
              <strong>Suica · PASMO · IC cards</strong> accepted on both Rinkai and JR lines.
            </p>
            <p className="text-dusk font-ui font-ui-xlight text-xs mt-1 leading-relaxed">
              Tap in at Tokyo Teleport, tap out at Shinjuku — fare calculated automatically. iPhone: add Suica to Apple Wallet.
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

// ── Simple route detail view ───────────────────────────────────────────────
function SimpleRouteView({ route, onBack }: { route: Route; onBack: () => void }) {
  return (
    <div className="min-h-dvh bg-vault pb-24 animate-fade-in">
      <div className="px-8 pt-8 pb-4 border-b border-between">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-ember hover:text-dusk transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center flex-1">
            <h1 className="font-display text-gold text-xl tracking-widest font-light">WAYFINDER</h1>
            <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase mt-0.5">{route.to}</p>
          </div>
          <div className="w-5" />
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        <div className="bg-layer rounded-xl p-5 border border-between">
          <p className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase mb-1">From</p>
          <p className="text-vellum font-ui font-ui-light text-sm">{route.from}</p>
          <div className="flex items-center gap-1 my-2">
            <div className="h-px flex-1 bg-between" />
            <svg className="w-4 h-4 text-ember" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
            <div className="h-px flex-1 bg-between" />
          </div>
          <p className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase mb-1">To</p>
          <p className="text-gold font-display text-lg font-light">{route.to}</p>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-between/50">
            {[['⏱', route.duration, 'Time'], ['¥', route.cost, 'Cost'], ['🚃', route.mode, 'Mode']].map(([icon, v, l]) => (
              <div key={l} className="text-center">
                <p className="text-lg">{icon}</p>
                <p className="text-vellum font-ui font-ui-light text-xs mt-0.5">{v}</p>
                <p className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-layer rounded-xl p-4 border border-between space-y-3">
          <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase">Steps</p>
          {route.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-gold text-[10px] font-bold">{i + 1}</span>
              </div>
              <p className="text-dusk font-ui font-ui-xlight text-xs leading-relaxed">{renderBold(step)}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-4 border border-gold/20 bg-gold/5 flex items-start gap-3">
          <span className="text-lg shrink-0">💳</span>
          <p className="text-dusk font-ui font-ui-xlight text-xs leading-relaxed">
            <strong className="text-vellum">Suica / PASMO</strong> — tap in at origin, tap out at destination. Add Suica to iPhone Wallet for contactless.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

// ── Main Wayfinder screen ──────────────────────────────────────────────────
export default function WayfinderScreen() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (selectedId === 'shinjuku') return <ShinjukuRouteView onBack={() => setSelectedId(null)} />

  const selected = ROUTES.find(r => r.id === selectedId)
  if (selected) return <SimpleRouteView route={selected} onBack={() => setSelectedId(null)} />

  const filtered = query.trim()
    ? ROUTES.filter(r =>
        r.to.toLowerCase().includes(query.toLowerCase()) ||
        r.from.toLowerCase().includes(query.toLowerCase()) ||
        r.mode.toLowerCase().includes(query.toLowerCase())
      )
    : ROUTES

  return (
    <div className="min-h-dvh bg-vault pb-24 animate-fade-in">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-between">
        <div className="flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </div>
        <h1 className="font-display text-gold text-2xl text-center tracking-widest font-light">WAYFINDER</h1>
        <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase text-center mt-1">東京 · Tokyo Transit</p>
      </div>

      {/* Search */}
      <div className="px-5 pt-5 pb-3">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ember" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search destination..."
            className="w-full bg-layer rounded-xl pl-10 pr-10 py-3 text-vellum font-ui font-ui-light text-sm placeholder-ember/40 border border-between focus:border-gold/40 focus:outline-none transition-colors"
          />
          {query && (
            <button onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ember hover:text-dusk p-1">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Route list */}
      <div className="px-5 pb-5 space-y-2">
        {filtered.map(route => (
          <button
            key={route.id}
            onClick={() => setSelectedId(route.id)}
            className="w-full bg-layer rounded-lg p-4 border border-between hover:bg-hover hover:border-gold/30 transition-colors duration-200 text-left"
          >
            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <p className="text-vellum font-ui font-ui-light text-sm">{route.to}</p>
                  <span className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase bg-between px-1.5 py-0.5 rounded shrink-0">
                    {route.mode}
                  </span>
                </div>
                <p className="text-dusk font-ui font-ui-xlight text-xs">From {route.from}</p>
              </div>
              <div className="text-right ml-3 shrink-0">
                <p className="text-gold font-display text-sm font-light">{route.duration}</p>
                <p className="text-ember font-ui font-ui-xlight text-[10px]">{route.cost}</p>
              </div>
              <svg className="w-4 h-4 text-ember/50 ml-2 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-dusk font-ui font-ui-light text-sm">No routes found</p>
            <p className="text-ember font-ui font-ui-xlight text-xs mt-1">Try "Ginza", "Shibuya", "Asakusa"</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
