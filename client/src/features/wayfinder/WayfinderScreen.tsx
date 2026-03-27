import { useNavigate } from 'react-router-dom'
import BottomNav from '@/shared/ui/BottomNav'

interface Stop {
  code: string
  en: string
  jp: string
  line: 'rinkai' | 'saikyo'
  transfers?: string
  isOrigin?: boolean
  isDest?: boolean
  isTransfer?: boolean
}

const ROUTE_STOPS: Stop[] = [
  { code: 'R-04', en: 'Tokyo Teleport', jp: '東京テレポート', line: 'rinkai', isOrigin: true, transfers: '5 min walk from Hilton Odaiba' },
  { code: 'R-05', en: 'Tennozu Isle', jp: '天王洲アイル', line: 'rinkai', transfers: 'Tokyo Monorail' },
  { code: 'R-06', en: 'Shinagawa Seaside', jp: '品川シーサイド', line: 'rinkai' },
  { code: 'R-07', en: 'Oimachi', jp: '大井町', line: 'rinkai', transfers: 'JR Keihin-Tohoku · Tokyu Oimachi Line' },
  { code: 'R-08', en: 'Osaki', jp: '大崎', line: 'rinkai', isTransfer: true, transfers: 'Train continues as JR Saikyo Line — stay on board' },
  { code: 'JA 09', en: 'Ebisu', jp: '恵比寿', line: 'saikyo', transfers: 'JR Yamanote · Tokyo Metro Hibiya H-02' },
  { code: 'JA 10', en: 'Shibuya', jp: '渋谷', line: 'saikyo', transfers: 'JR Yamanote · Ginza G-01 · Hanzomon Z-01 · Fukutoshin F-16 · Tokyu · Keio Inokashira' },
  { code: 'JA 11', en: 'Shinjuku', jp: '新宿', line: 'saikyo', isDest: true, transfers: 'JR Yamanote · Marunouchi M-08 · Toei Oedo E-27 · Odakyu · Keio' },
]

const LINE_COLORS = {
  rinkai: '#00b2e5',  // TWR Rinkai blue
  saikyo: '#00ac6b',  // JR Saikyo green
}

const INSTRUCTIONS = [
  { text: 'Walk from **Hilton Odaiba** to **Tokyo Teleport Station 東京テレポート** — 5 min, follow signs to Rinkai Line' },
  { text: 'Tap in with **Suica/PASMO** — look for platform toward **Osaki 大崎方面**' },
  { text: 'Board a **through-service train to Shinjuku** (most trains continue onto JR Saikyo Line). If the display says **新宿方面**, you are on the right train.' },
  { text: 'At **Osaki 大崎 (R-08)**, the train becomes JR Saikyo Line — **stay on board**, do not transfer' },
  { text: 'Ride to **Shinjuku 新宿 (JA 11)** — 7 stops total, ~25 minutes. Tap out at the gate.' },
]

function renderBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="text-vellum">{part}</strong> : <span key={i}>{part}</span>
  )
}

export default function WayfinderScreen() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-vault pb-24 animate-fade-in">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-between">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/bridge')} className="text-ember hover:text-dusk transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center flex-1">
            <h1 className="font-display text-gold text-xl tracking-widest font-light">WAYFINDER</h1>
            <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase mt-0.5">東京 · Tokyo Transit</p>
          </div>
          <div className="w-5" />
        </div>
      </div>

      {/* Origin → Destination */}
      <div className="px-5 py-5 space-y-2.5">
        {/* Origin card */}
        <div className="bg-layer rounded-lg p-4 border border-[#4ade80]/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#4ade80]/15 border border-[#4ade80]/40 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-[#4ade80]" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="6" />
            </svg>
          </div>
          <div>
            <p className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase">Hilton Odaiba · 現在地</p>
            <p className="text-vellum font-display text-base font-light">Tokyo Teleport</p>
            <p className="text-dusk font-ui font-ui-xlight text-xs">東京テレポート · <span className="text-[#00b2e5] font-semibold">R-04</span> · Rinkai Line</p>
          </div>
        </div>

        {/* Destination card */}
        <div className="bg-layer rounded-lg p-4 border border-[#f472b6]/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#f472b6]/15 border border-[#f472b6]/40 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-[#f472b6]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L8 12h8L12 2z" />
            </svg>
          </div>
          <div>
            <p className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase">Destination · 目的地</p>
            <p className="text-vellum font-display text-base font-light">Shinjuku Station</p>
            <p className="text-dusk font-ui font-ui-xlight text-xs">新宿駅 · <span className="text-[#00ac6b] font-semibold">JA 11</span> · JR Saikyo Line</p>
          </div>
        </div>
      </div>

      {/* Route Stats Bar */}
      <div className="mx-5 mb-5">
        <div className="rounded-xl p-4 border border-[#00b2e5]/20"
          style={{ background: 'linear-gradient(135deg, rgba(0,178,229,0.06) 0%, rgba(0,172,107,0.06) 100%)' }}>
          <div className="grid grid-cols-4 divide-x divide-white/10">
            <div className="text-center px-2">
              <p className="text-vellum font-display text-xl font-light">~25</p>
              <p className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase">Minutes</p>
            </div>
            <div className="text-center px-2">
              <p className="text-vellum font-display text-xl font-light">7</p>
              <p className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase">Stops</p>
            </div>
            <div className="text-center px-2">
              <p className="text-vellum font-display text-xl font-light">¥490</p>
              <p className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase">Fare</p>
              <p className="text-dusk font-ui font-ui-xlight text-[9px]">~$3.30</p>
            </div>
            <div className="text-center px-2 flex flex-col items-center justify-center gap-1">
              <span className="inline-flex items-center bg-[#00b2e5] rounded-full px-2 py-0.5 text-white text-[9px] font-bold">TWR</span>
              <span className="inline-flex items-center bg-[#00ac6b] rounded-full px-2 py-0.5 text-white text-[9px] font-bold">JR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metro Route Map */}
      <div className="px-5 mb-5">
        <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase mb-3 px-1">Route Map · 路線図</p>
        <div className="bg-layer rounded-xl border border-between overflow-hidden relative">
          {/* Vertical rail line — gradient from Rinkai blue to Saikyo green */}
          <div className="absolute left-[26px] top-6 bottom-6 w-1 rounded-full"
            style={{ background: 'linear-gradient(to bottom, #4ade80 0%, #00b2e5 8%, #00b2e5 55%, #00ac6b 60%, #00ac6b 92%, #f472b6 100%)' }} />

          <div className="py-3">
            {ROUTE_STOPS.map((stop, i) => (
              <div key={stop.code} className="flex items-center relative">
                {/* Dot */}
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

                {/* Stop info */}
                <div className={`flex-1 py-2.5 pr-4 ${i < ROUTE_STOPS.length - 1 ? 'border-b border-between/50' : ''}`}>
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
                    {stop.isOrigin && (
                      <span className="ml-2 text-[8px] tracking-wider uppercase bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30 px-1.5 py-0.5 rounded font-bold align-middle">
                        START HERE
                      </span>
                    )}
                    {stop.isTransfer && (
                      <span className="ml-2 text-[8px] tracking-wider uppercase bg-gold/15 text-gold border border-gold/30 px-1.5 py-0.5 rounded font-bold align-middle">
                        STAY ON BOARD
                      </span>
                    )}
                    {stop.isDest && (
                      <span className="ml-2 text-[8px] tracking-wider uppercase bg-[#f472b6]/15 text-[#f472b6] border border-[#f472b6]/30 px-1.5 py-0.5 rounded font-bold align-middle">
                        GET OFF HERE
                      </span>
                    )}
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

      {/* Step by Step */}
      <div className="px-5 mb-5">
        <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase mb-3 px-1">Step by Step · 乗り方</p>
        <div className="bg-layer rounded-xl p-4 border border-between space-y-3">
          {INSTRUCTIONS.map((inst, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: i < 3 ? '#00b2e5' : '#00ac6b' }}>
                <span className="text-white text-[10px] font-bold">{i + 1}</span>
              </div>
              <p className="text-dusk font-ui font-ui-xlight text-xs leading-relaxed">
                {renderBold(inst.text)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* IC Card Note */}
      <div className="px-5 mb-5">
        <div className="rounded-xl p-4 border border-gold/20 bg-gold/5 flex items-start gap-3">
          <span className="text-lg shrink-0">💳</span>
          <div>
            <p className="text-vellum font-ui font-ui-light text-xs leading-relaxed">
              <strong>Suica · PASMO · IC cards</strong> accepted on both Rinkai and JR lines.
            </p>
            <p className="text-dusk font-ui font-ui-xlight text-xs mt-1 leading-relaxed">
              Tap in at Tokyo Teleport, tap out at Shinjuku — fare calculated automatically across both lines. iPhone users: add Suica to Apple Wallet (no physical card needed).
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
