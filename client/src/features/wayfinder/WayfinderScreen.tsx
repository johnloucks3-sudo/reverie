import { useNavigate } from 'react-router-dom'
import BottomNav from '@/shared/ui/BottomNav'

interface Stop {
  code: string
  en: string
  jp: string
  transfers?: string
  isOrigin?: boolean
  isDest?: boolean
}

const MARUNOUCHI_STOPS: Stop[] = [
  { code: 'M-16', en: 'Ginza', jp: '銀座', isOrigin: true },
  { code: 'M-15', en: 'Hibiya', jp: '日比谷', transfers: 'Hibiya Line H-08 · Chiyoda Line C-09' },
  { code: 'M-14', en: 'Kasumigaseki', jp: '霞ケ関', transfers: 'Hibiya Line H-07 · Chiyoda Line C-08' },
  { code: 'M-13', en: 'Kokkai-gijidomae', jp: '国会議事堂前', transfers: 'Chiyoda Line C-07' },
  { code: 'M-12', en: 'Akasaka-mitsuke', jp: '赤坂見附', transfers: 'Ginza Line G-05 · Hanzomon Z-04' },
  { code: 'M-11', en: 'Yotsuya', jp: '四谷', transfers: 'JR Chuo Line' },
  { code: 'M-10', en: 'Yotsuya-sanchome', jp: '四谷三丁目' },
  { code: 'M-09', en: 'Shinjuku-sanchome', jp: '新宿三丁目', transfers: 'Fukutoshin F-13 · Toei Shinjuku S-02' },
  { code: 'M-08', en: 'Shinjuku', jp: '新宿', isDest: true, transfers: 'JR Yamanote · Toei Oedo E-27 · Odakyu · Keio' },
]

const INSTRUCTIONS = [
  { text: 'Enter **Ginza Station 銀座** — look for the red **M** Marunouchi Line entrance' },
  { text: 'Tap in with **Suica or PASMO** card — or buy a **¥210 ticket** at the machine' },
  { text: 'Board platform for **direction Ogikubo 荻窪方面** — red train, every 3-5 min' },
  { text: 'Ride **8 stops · ~22 minutes** — screens inside show stops in EN + JP' },
  { text: 'Exit at **Shinjuku 新宿 (M-08)** — tap out at gate. You\'ve arrived.' },
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
            <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase mt-0.5">東京 · Tokyo Metro</p>
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
            <p className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase">You are here · 現在地</p>
            <p className="text-vellum font-display text-base font-light">Ginza</p>
            <p className="text-dusk font-ui font-ui-xlight text-xs">銀座 · <span className="text-[#e60012] font-semibold">M-16</span> · Marunouchi Line</p>
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
            <p className="text-dusk font-ui font-ui-xlight text-xs">新宿駅 · <span className="text-[#e60012] font-semibold">M-08</span></p>
          </div>
        </div>
      </div>

      {/* Route Stats Bar */}
      <div className="mx-5 mb-5">
        <div className="rounded-xl p-4 border border-[#e60012]/20"
          style={{ background: 'linear-gradient(135deg, rgba(230,0,18,0.06) 0%, rgba(107,91,149,0.06) 100%)' }}>
          <div className="grid grid-cols-4 divide-x divide-white/10">
            <div className="text-center px-2">
              <p className="text-vellum font-display text-xl font-light">~22</p>
              <p className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase">Minutes</p>
            </div>
            <div className="text-center px-2">
              <p className="text-vellum font-display text-xl font-light">8</p>
              <p className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase">Stops</p>
            </div>
            <div className="text-center px-2">
              <p className="text-vellum font-display text-xl font-light">¥210</p>
              <p className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase">Fare</p>
              <p className="text-dusk font-ui font-ui-xlight text-[9px]">~$1.40</p>
            </div>
            <div className="text-center px-2 flex flex-col items-center justify-center">
              <span className="inline-flex items-center gap-1 bg-[#e60012] rounded-full px-2.5 py-1 text-white text-[11px] font-bold">M</span>
              <p className="text-ember font-ui font-ui-xlight text-[8px] tracking-wider uppercase mt-1">Ogikubo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metro Route Map */}
      <div className="px-5 mb-5">
        <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase mb-3 px-1">Route Map · 路線図</p>
        <div className="bg-layer rounded-xl border border-between overflow-hidden relative">
          {/* Vertical rail line */}
          <div className="absolute left-[26px] top-6 bottom-6 w-1 rounded-full"
            style={{ background: 'linear-gradient(to bottom, #4ade80 0%, #e60012 8%, #e60012 92%, #f472b6 100%)' }} />

          <div className="py-3">
            {MARUNOUCHI_STOPS.map((stop, i) => (
              <div key={stop.code} className="flex items-center relative">
                {/* Dot */}
                <div className="w-[52px] flex justify-center shrink-0 z-10">
                  <div className={`rounded-full ${
                    stop.isOrigin ? 'w-[18px] h-[18px] bg-[#4ade80] shadow-[0_0_12px_rgba(74,222,128,0.5)]'
                    : stop.isDest ? 'w-[18px] h-[18px] bg-[#f472b6] shadow-[0_0_12px_rgba(244,114,182,0.5)]'
                    : 'w-3 h-3 bg-[#e60012]'
                  } border-2 border-layer`} />
                </div>

                {/* Stop info */}
                <div className={`flex-1 py-2.5 pr-4 ${i < MARUNOUCHI_STOPS.length - 1 ? 'border-b border-between/50' : ''}`}>
                  <p className="text-[#e60012] font-ui font-bold text-[9px] tracking-wider">
                    {stop.code}
                    {stop.isOrigin && <span className="ml-1 text-[8px]">· MARUNOUCHI LINE</span>}
                    {stop.isDest && <span className="ml-1 text-[8px]">· TERMINAL</span>}
                  </p>
                  <p className={`font-ui font-ui-light text-sm ${
                    stop.isOrigin ? 'text-[#4ade80] font-semibold' : stop.isDest ? 'text-[#f472b6] font-semibold' : 'text-vellum'
                  }`}>
                    {stop.en}
                    {stop.isOrigin && (
                      <span className="ml-2 text-[8px] tracking-wider uppercase bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30 px-1.5 py-0.5 rounded font-bold align-middle">
                        YOU ARE HERE
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
                      ↔ {stop.transfers}
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
              <div className="w-5 h-5 rounded-full bg-[#e60012] flex items-center justify-center shrink-0 mt-0.5">
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
              <strong>Suica · PASMO · IC cards</strong> accepted at all gates.
            </p>
            <p className="text-dusk font-ui font-ui-xlight text-xs mt-1 leading-relaxed">
              No exact change needed. Buy at any ticket machine — refundable ¥500 deposit.
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
