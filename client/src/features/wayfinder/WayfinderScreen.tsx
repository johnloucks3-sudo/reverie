import { useState } from 'react'
import BottomNav from '@/shared/ui/BottomNav'

// ── Types ──────────────────────────────────────────────────────────────────
interface Stop {
  code: string; en: string; jp: string; line: 'rinkai' | 'saikyo'
  transfers?: string; isOrigin?: boolean; isDest?: boolean; isTransfer?: boolean
}
interface Route {
  id: string; city: string; from: string; to: string
  duration: string; cost: string; mode: string; steps: string[]
}
interface CityDef {
  id: string; label: string; emoji: string; subtitle: string
}

// ── City registry ──────────────────────────────────────────────────────────
const CITIES: CityDef[] = [
  { id: 'all',          label: 'All',            emoji: '🗺',  subtitle: 'All destinations'     },
  { id: 'tokyo',        label: 'Tokyo',          emoji: '🗼',  subtitle: '東京 · Odaiba'         },
  { id: 'yokohama',     label: 'Yokohama',       emoji: '🚢',  subtitle: '横浜 · Cruise Pier'    },
  { id: 'honolulu',     label: 'Honolulu',       emoji: '🌺',  subtitle: 'Hawaii · Pier 2'      },
  { id: 'kodiak',       label: 'Kodiak',         emoji: '🐻',  subtitle: 'Alaska · Pier'        },
  { id: 'juneau',       label: 'Juneau',         emoji: '🏔️', subtitle: 'Alaska · Pier'        },
  { id: 'sitka',        label: 'Sitka',          emoji: '🌲',  subtitle: 'Alaska · Pier'        },
  { id: 'ketchikan',    label: 'Ketchikan',      emoji: '🦅',  subtitle: 'Alaska · Pier'        },
  { id: 'victoria',     label: 'Victoria',       emoji: '🌸',  subtitle: 'BC · Ogden Point'     },
  { id: 'seattle',      label: 'Seattle',        emoji: '☁️', subtitle: 'WA · SEA Airport'     },
  { id: 'la',           label: 'LA / OC',        emoji: '🌴',  subtitle: 'Southern California'  },
  { id: 'manhattan',    label: 'Manhattan Bch',  emoji: '🏖️', subtitle: 'Los Angeles County'   },
  { id: 'newport_ca',   label: 'Newport Beach',  emoji: '⛵',  subtitle: 'Orange County'        },
]

// ── Tokyo Shinjuku detailed stop list ─────────────────────────────────────
const SHINJUKU_STOPS: Stop[] = [
  { code: 'R-04', en: 'Tokyo Teleport', jp: '東京テレポート', line: 'rinkai', isOrigin: true, transfers: '5 min walk from Hilton Odaiba' },
  { code: 'R-05', en: 'Tennozu Isle',   jp: '天王洲アイル',   line: 'rinkai', transfers: 'Tokyo Monorail' },
  { code: 'R-06', en: 'Shinagawa Seaside', jp: '品川シーサイド', line: 'rinkai' },
  { code: 'R-07', en: 'Oimachi',        jp: '大井町',         line: 'rinkai', transfers: 'JR Keihin-Tohoku · Tokyu Oimachi' },
  { code: 'R-08', en: 'Osaki',          jp: '大崎',           line: 'rinkai', isTransfer: true, transfers: 'Train continues as JR Saikyo — stay on board' },
  { code: 'JA 09', en: 'Ebisu',         jp: '恵比寿',         line: 'saikyo', transfers: 'JR Yamanote · Hibiya H-02' },
  { code: 'JA 10', en: 'Shibuya',       jp: '渋谷',           line: 'saikyo', transfers: 'JR Yamanote · Ginza G-01 · Hanzomon Z-01 · Tokyu · Keio' },
  { code: 'JA 11', en: 'Shinjuku',      jp: '新宿',           line: 'saikyo', isDest: true, transfers: 'JR Yamanote · Marunouchi M-08 · Oedo E-27 · Odakyu · Keio' },
]
const LINE_COLORS = { rinkai: '#00b2e5', saikyo: '#00ac6b' }
const SHINJUKU_STEPS = [
  { text: 'Walk from **Hilton Odaiba** to **Tokyo Teleport Station 東京テレポート** — 5 min, follow signs to Rinkai Line' },
  { text: 'Tap in with **Suica / PASMO** — platform toward **Osaki 大崎方面**' },
  { text: 'Board a **through-service train to Shinjuku** — display says **新宿方面**' },
  { text: 'At **Osaki R-08**, train becomes JR Saikyo — **stay on board**, do not get off' },
  { text: 'Ride to **Shinjuku JA 11** — 7 stops total, ~25 min. Tap out at the gate.' },
]

// ── Route database ─────────────────────────────────────────────────────────
const ROUTES: Route[] = [
  // ── TOKYO ────────────────────────────────────────────────────────────────
  {
    id: 'shinjuku', city: 'tokyo',
    from: 'Odaiba / Hilton', to: 'Shinjuku 新宿',
    duration: '~25 min', cost: '¥490 (~$3.30)', mode: 'TWR → JR',
    steps: [], // rendered as full route map
  },
  {
    id: 'shibuya', city: 'tokyo',
    from: 'Odaiba / Hilton', to: 'Shibuya 渋谷',
    duration: '~22 min', cost: '¥440 (~$3.00)', mode: 'TWR → JR Saikyo',
    steps: [
      'Walk to **Tokyo Teleport R-04** — 5 min from Hilton Odaiba',
      'Rinkai Line toward **Osaki** — at Osaki, stays on as JR Saikyo',
      'Exit at **Shibuya JA 10** — 6 stops total',
      'Hachiko Exit for shopping / Scramble Crossing · use Suica/PASMO tap-in/out',
    ],
  },
  {
    id: 'ginza', city: 'tokyo',
    from: 'Odaiba / Hilton', to: 'Ginza 銀座',
    duration: '~30 min', cost: '¥370 (~$2.50)', mode: 'Rinkai → Yurakucho',
    steps: [
      'Walk to **Tokyo Teleport R-04** — 5 min',
      'Rinkai Line to **Shin-Kiba R-03** (3 stops) — transfer to **Tokyo Metro Yurakucho Line Y-24**',
      'Yurakucho Line toward **Ikebukuro** — exit at **Tsukishima Y-21** or **Shintomicho Y-20**',
      'From Shintomicho: 5 min walk to Ginza main strip. Alternatively, taxi from Odaiba (~¥2,000).',
    ],
  },
  {
    id: 'akihabara', city: 'tokyo',
    from: 'Odaiba / Hilton', to: 'Akihabara 秋葉原',
    duration: '~35 min', cost: '¥400 (~$2.70)', mode: 'Rinkai → Keiyo',
    steps: [
      'Walk to **Tokyo Teleport R-04** — 5 min',
      'Rinkai Line to **Shin-Kiba R-03** — transfer to **JR Keiyo Line**',
      'JR Keiyo Line to **Tatsumi** → transfer to **JR Sobu Line** → **Akihabara**',
      'Or: Rinkai to Osaki → JR Yamanote to **Akihabara** (~40 min, ¥490). Slower but simpler.',
    ],
  },
  {
    id: 'asakusa', city: 'tokyo',
    from: 'Odaiba / Hilton', to: 'Asakusa 浅草',
    duration: '~45 min', cost: '¥640 (~$4.30)', mode: 'Yurikamome + Metro',
    steps: [
      'Walk to **Daiba Station** (Yurikamome Line) — 8 min from Hilton',
      'Yurikamome toward **Shimbashi 新橋** — 25 min',
      'At Shimbashi: **Ginza Line G-08** toward **Asakusa** (5 stops)',
      'Exit **Asakusa G-19** — Senso-ji Temple is 5 min walk north.',
    ],
  },
  {
    id: 'harajuku', city: 'tokyo',
    from: 'Odaiba / Hilton', to: 'Harajuku / Meiji Jingu',
    duration: '~30 min', cost: '¥490 (~$3.30)', mode: 'TWR → JR Saikyo',
    steps: [
      'Walk to **Tokyo Teleport R-04** — 5 min',
      'Same Shinjuku route — exit one stop early at **Harajuku** (JR Yamanote transfer at Ebisu)',
      'Takeshita Street entrance is 1 min from east exit. Meiji Shrine is 5 min west.',
    ],
  },
  {
    id: 'harumi-ginza', city: 'tokyo',
    from: 'Harumi Cruise Port', to: 'Ginza / Tokyo Station',
    duration: '20 min walk · 15 min taxi', cost: 'Free · ¥1,500 taxi', mode: 'Walk / Taxi',
    steps: [
      '**Harumi Pier** → Ginza: 1.2 km straight walk east along waterfront (20 min)',
      'For Ginza shopping: walk north from pier along Harumi-dori ~1 km',
      'For **Tokyo Station**: taxi from pier ~¥2,000, 15 min OR walk + Yurakucho Line from Ginza',
      'Taxis queue at pier exit — useful for airport runs after disembark',
    ],
  },

  // ── YOKOHAMA ─────────────────────────────────────────────────────────────
  {
    id: 'yoko-chinatown', city: 'yokohama',
    from: 'Yokohama Cruise Terminal', to: 'Chinatown / Motomachi',
    duration: '~15 min walk', cost: 'Free', mode: 'Walk',
    steps: [
      'Exit Osanbashi Pier terminal, walk southwest along the waterfront',
      'Follow **Yokohama Chinatown 中華街** signs — largest Chinatown in Japan',
      '**Motomachi Shopping Street** is adjacent — boutiques and cafés, no tourist trap',
      'Yamashita Park is 5 min walk from pier — waterfront garden, good for photos',
    ],
  },
  {
    id: 'yoko-minatomirai', city: 'yokohama',
    from: 'Yokohama Cruise Terminal', to: 'Minato Mirai 21',
    duration: '~20 min walk or 5 min taxi', cost: 'Free / ¥700 taxi', mode: 'Walk / Taxi',
    steps: [
      'Walk northwest from Osanbashi along waterfront ~1.5 km',
      '**Cosmo World** Ferris wheel (70m, open evenings), **Cup Noodles Museum** nearby',
      '**Queen\'s Square / Mark Is** — shopping and restaurants, direct connection to MM stations',
      'Taxi from pier is easy and fast — drivers know "Minato Mirai" immediately',
    ],
  },
  {
    id: 'yoko-tokyo', city: 'yokohama',
    from: 'Yokohama Station', to: 'Tokyo Station',
    duration: '~30 min', cost: '¥680 (~$4.60)', mode: 'Tokaido Line',
    steps: [
      'From cruise terminal: taxi to **Yokohama Station** (~¥900, 10 min) or walk Minatomirai Line',
      'JR **Tokaido Line** (rapid) from Yokohama → **Tokyo Station** — 30 min, departs frequently',
      'Or: **Yokohama Line → Shinjuku** (~50 min, ¥720) — avoids Tokyo Station crowds',
      'IC card (Suica/PASMO) accepted — tap in at Yokohama, tap out at Tokyo',
    ],
  },

  // ── HONOLULU ─────────────────────────────────────────────────────────────
  {
    id: 'hnl-waikiki', city: 'honolulu',
    from: 'Cruise Terminal (Pier 2)', to: 'Waikiki Beach',
    duration: '~15 min rideshare', cost: '$12–16', mode: 'Rideshare / Taxi',
    steps: [
      'Exit terminal, request **Uber/Lyft** — "Waikiki Beach, Honolulu"',
      'Or take **TheBus Route 19/20** ($3 exact change) — slower but scenic, ~35 min',
      'Drop at **Kalakaua Ave** — main Waikiki strip. Royal Hawaiian Hotel is the pink landmark.',
      'Beach access is free at all points along Kalakaua. Duke Kahanamoku statue is the main meetup.',
    ],
  },
  {
    id: 'hnl-diamondhead', city: 'honolulu',
    from: 'Waikiki', to: 'Diamond Head Crater',
    duration: '~10 min rideshare + 1.6 mi hike', cost: '$10–14 rideshare + $5 entry', mode: 'Rideshare + Hike',
    steps: [
      'Rideshare from Waikiki to **Diamond Head State Monument** entrance — 10 min',
      'Entry fee $5/person — cash or card. Opens 6 AM, last entry 4 PM.',
      '**1.6 mile round trip**, 560 ft elevation gain — moderate, 1.5–2 hrs total',
      'Summit view: 360° of Oahu, Waikiki skyline behind you. Bring water and sunscreen.',
      'Return: rideshare from trailhead or walk 15 min back to Kapahulu Ave bus stop',
    ],
  },
  {
    id: 'hnl-pearlharbor', city: 'honolulu',
    from: 'Waikiki', to: 'Pearl Harbor / USS Arizona',
    duration: '~30 min rideshare', cost: '$25–35 rideshare · Free entry', mode: 'Rideshare',
    steps: [
      'Rideshare from Waikiki to **Pearl Harbor National Memorial** — 30 min',
      'USS Arizona Memorial: **free** — timed entry tickets required, book online at recreation.gov',
      'Arrive 30 min before your ticket time. Memorial boat shuttle is ~15 min roundtrip.',
      'USS Missouri battleship and USS Bowfin submarine cost extra ($30–35 each) — plan 4+ hrs total',
      'Return rideshare from visitor center — request pickup in the lot',
    ],
  },

  // ── KODIAK ───────────────────────────────────────────────────────────────
  {
    id: 'kodiak-downtown', city: 'kodiak',
    from: 'Cruise Pier', to: 'Downtown Kodiak',
    duration: '~10 min walk', cost: 'Free', mode: 'Walk',
    steps: [
      'Exit pier and walk north along Marine Way — 0.5 mi to downtown core',
      '**Harbormaster\'s Office** area: fishing harbor, charter boats, local color',
      '**Kodiak Island Brewing** on Lower Mill Bay Rd — local craft beers, 11 AM open',
      '**Near Island Bridge**: short walk across for harbor views and birding',
    ],
  },
  {
    id: 'kodiak-baranov', city: 'kodiak',
    from: 'Downtown Kodiak', to: 'Baranov Museum',
    duration: '5 min walk', cost: '$5 entry', mode: 'Walk',
    steps: [
      'Walk to **101 Marine Way** — oldest existing Russian building in Alaska (1808)',
      'Erskine House: Russian-American Company fur storage, now a national landmark',
      'Exhibits: indigenous Alutiiq culture, Russian colonial period, WWII Kodiak',
      'Open Mon–Sat 10 AM–4 PM in port season',
    ],
  },
  {
    id: 'kodiak-fort', city: 'kodiak',
    from: 'Downtown Kodiak', to: 'Fort Abercrombie State Historical Park',
    duration: '~5 mi / 10 min drive', cost: '$5 parking / rideshare ~$12', mode: 'Rideshare / Taxi',
    steps: [
      'Rideshare or taxi north on Rezanof Drive — 10 min, tell driver "Fort Abercrombie"',
      'WWII gun emplacements, bunkers, and coastal defense installations — self-guided',
      '**Miller Point**: dramatic ocean views, old-growth Sitka spruce, tide pools',
      'Bring a jacket — coastal winds are real even in summer',
    ],
  },

  // ── JUNEAU ───────────────────────────────────────────────────────────────
  {
    id: 'juneau-mendenhall', city: 'juneau',
    from: 'Cruise Pier', to: 'Mendenhall Glacier',
    duration: '~30 min bus or 20 min rideshare', cost: '$2 bus / $20–25 rideshare + $5 entry', mode: 'Bus / Rideshare',
    steps: [
      'Exit pier area, catch **MGT shuttle bus** (~$22 roundtrip) or Uber/Lyft (~$20–25 one way)',
      'Or: **Capital Transit Bus #4** departs downtown — $2 each way, ~45 min total',
      'USFS visitor center entry $5 — includes glacier viewing platform',
      '**Nugget Falls Trail** (0.9 mi roundtrip, easy) — walk to base of falls beside glacier',
      'Glacier is actively retreating — still dramatic. Allow 2–3 hours total.',
    ],
  },
  {
    id: 'juneau-downtown', city: 'juneau',
    from: 'Cruise Pier', to: 'Downtown Juneau',
    duration: '~5 min walk', cost: 'Free', mode: 'Walk',
    steps: [
      'Walk north from pier along Franklin Street — 5 min to downtown core',
      '**Red Dog Saloon** (278 S Franklin): Alaska institution since 1890s, sawdust floors',
      '**Alaska State Capitol** (4th St): free tours when legislature is not in session',
      '**Juneau-Douglas City Museum** (Main & 4th): $6 — gold rush and Tlingit history',
      'South Franklin St: jewelry stores feature local gold and native art',
    ],
  },
  {
    id: 'juneau-tram', city: 'juneau',
    from: 'Cruise Pier', to: 'Mt Roberts Tramway',
    duration: '~10 min walk + 6 min tram', cost: '$35 roundtrip', mode: 'Walk + Tram',
    steps: [
      'Walk north on Franklin St past downtown — tram terminal is at 490 S Franklin St',
      'Tram rises 1,800 ft in 6 minutes — panoramic views of Juneau and Gastineau Channel',
      'Summit: **Timberline Bar & Grill**, nature center, bald eagle viewing, hiking trails',
      '**Mt Roberts Alpine Trail**: 4.5 mi one-way if you want to hike back down',
      'Last tram matches ship departure times — confirm before heading up',
    ],
  },

  // ── SITKA ────────────────────────────────────────────────────────────────
  {
    id: 'sitka-downtown', city: 'sitka',
    from: 'Tender Pier (Crescent Harbor)', to: 'Downtown Sitka',
    duration: '~5 min walk', cost: 'Free', mode: 'Walk',
    steps: [
      'Silver Nova anchors offshore — tender boats run every 20–30 min to Crescent Harbor',
      'Walk up Lincoln Street to downtown — St Michael\'s Cathedral is 3 blocks',
      '**St Michael\'s Cathedral** (Lincoln & Cathedral): Russian Orthodox, 1848 original (rebuilt 1966)',
      '**Sitka Sound Science Center**: walking distance, marine biology exhibits',
      '**Old Harbor Books**: local Alaska literature and maps',
    ],
  },
  {
    id: 'sitka-park', city: 'sitka',
    from: 'Downtown Sitka', to: 'Sitka National Historical Park',
    duration: '~20 min walk or 5 min taxi', cost: 'Free', mode: 'Walk / Taxi',
    steps: [
      'Walk east on Lincoln Street — 0.8 mi to park entrance (20 min walk)',
      'Or taxi from downtown — drivers know the park, ~$8',
      '**Totem pole trail**: 15 historic Tlingit and Haida poles in temperate rainforest',
      '**Russian Bishop\'s House**: 1842 Russian-American Company building, self-guided',
      'Park is free, open daily 9 AM–5 PM. Allow 1.5–2 hrs.',
    ],
  },

  // ── KETCHIKAN ────────────────────────────────────────────────────────────
  {
    id: 'ketchikan-creek', city: 'ketchikan',
    from: 'Cruise Pier', to: 'Creek Street',
    duration: '~10 min walk', cost: 'Free', mode: 'Walk',
    steps: [
      'Exit pier — Ketchikan\'s compact downtown is right at the dock',
      'Walk north along the waterfront to **Creek Street** — former red-light district, now galleries',
      '**Dolly\'s House Museum**: preserved 1919 brothel, $5 — surprisingly good history',
      '**Ketchikan Creek**: salmon run visible June–Sept from the boardwalk',
      'Creek St is boardwalk-only (no cars) — great photos over the water',
    ],
  },
  {
    id: 'ketchikan-totem', city: 'ketchikan',
    from: 'Cruise Pier', to: 'Totem Heritage Center',
    duration: '~15 min walk', cost: '$6', mode: 'Walk',
    steps: [
      'Walk north through downtown, cross Ketchikan Creek, continue to Deermount Street',
      '**601 Deermount St**: largest collection of original 19th-century totem poles in existence',
      '22 unrestored poles from Tlingit and Haida villages — not replicas, not restored',
      'Allow 45–60 min. Small but exceptional.',
      'Combine with **Totem Bight State Historical Park** (7 mi north) if renting a car',
    ],
  },

  // ── VICTORIA ─────────────────────────────────────────────────────────────
  {
    id: 'victoria-downtown', city: 'victoria',
    from: 'Ogden Point Cruise Terminal', to: 'Downtown / Empress Hotel',
    duration: '~20 min walk or 5 min rideshare', cost: 'Free / $8', mode: 'Walk / Rideshare',
    steps: [
      'Walk northeast along Dallas Rd then Government Street — 1.2 km (20 min)',
      'Or catch the **Ogden Point shuttle** ($5 roundtrip) to Inner Harbour',
      '**Fairmont Empress Hotel**: iconic 1908 Edwardian, Inner Harbour landmark — afternoon tea $75+',
      '**BC Parliament Buildings**: free exterior/tours, Inner Harbour photo anchor',
      '**Government Street**: main shopping — Rogers\' Chocolates (1885), local galleries',
    ],
  },
  {
    id: 'victoria-butchart', city: 'victoria',
    from: 'Downtown Victoria', to: 'Butchart Gardens',
    duration: '~30 min bus or 25 min taxi', cost: '$6 bus / $45–55 taxi + $40 entry', mode: 'Bus / Taxi',
    steps: [
      'Bus **#75 Saanich** from downtown (Bay & Douglas) — $6 roundtrip, 35 min',
      'Or taxi/rideshare from downtown: ~$45 one-way, 25 min. Many drivers do roundtrips with wait.',
      'Entry: $40 CAD adult. Book online — worth it. Gardens open 9 AM daily.',
      '55 acres: Sunken Garden (former limestone quarry), Rose Garden, Japanese Garden',
      'Allow minimum 3 hours. Evening visits (summer only) with illuminations are spectacular.',
    ],
  },

  // ── SEATTLE ──────────────────────────────────────────────────────────────
  {
    id: 'sea-airport-downtown', city: 'seattle',
    from: 'Seattle-Tacoma Airport (SEA)', to: 'Downtown Seattle',
    duration: '~38 min', cost: '$3.25 Link / $45–55 rideshare', mode: 'Light Rail / Rideshare',
    steps: [
      '**Link Light Rail** from SEA/TAC station (below baggage claim) — $3.25, 38 min to Westlake',
      'Departs every 8–10 min, 5 AM–1 AM. Luggage-friendly — no crowding issues.',
      'Or rideshare from **designated TNC pickup area** level 3 (follow signs) — $45–55, 30–45 min (traffic)',
      'For cruise ships: Port of Seattle is 1.5 mi from Westlake Center — $10 taxi',
    ],
  },
  {
    id: 'sea-pikplace', city: 'seattle',
    from: 'Downtown Seattle', to: 'Pike Place Market',
    duration: '~5 min walk from 1st Ave hotels', cost: 'Free to browse', mode: 'Walk',
    steps: [
      'Walk west to 1st Ave & Pike Street — Pike Place Market is open 9 AM–6 PM daily',
      '**Pike Place Fish Co.**: fish-throwing tradition, since 1930. Buy fresh Dungeness crab.',
      '**Original Starbucks** (1912 Pike Place): expect a line — worth it or skip if short on time',
      '**Rachel the Pig** (bronze piggy bank at market entrance): good meetup landmark',
      'Lower levels: bakeries, specialty food, arts and crafts. Go down the stairs.',
    ],
  },
  {
    id: 'sea-spaceneedle', city: 'seattle',
    from: 'Downtown Seattle', to: 'Seattle Center / Space Needle',
    duration: '~15 min walk or 5 min monorail', cost: '$2.50 monorail + $37 Space Needle', mode: 'Monorail / Walk',
    steps: [
      '**Seattle Monorail** from Westlake Station (5th & Pine) to Seattle Center — $2.50, 2 min',
      '**Space Needle**: $37–45 adult, timed entry — book ahead. Rotating glass floor.',
      '**Chihuly Garden and Glass**: adjacent to Space Needle, $30 — Dale Chihuly glass art, superb',
      '**MoPOP** (Museum of Pop Culture): same campus, $28 — Jimi Hendrix, Nirvana, sci-fi',
      'Combination tickets (Space Needle + Chihuly) save $10',
    ],
  },

  // ── LA / ORANGE COUNTY ───────────────────────────────────────────────────
  {
    id: 'la-lax-manhattan', city: 'la',
    from: 'LAX Airport', to: 'Manhattan Beach',
    duration: '~15 min', cost: '$18–25 rideshare', mode: 'Rideshare',
    steps: [
      'LAX rideshare: follow "Rideshare Pickup" signs to **LAX-it lot** (free shuttle from terminals)',
      'Uber/Lyft to Manhattan Beach — 15 min in normal traffic, 25 min rush hour',
      'Or: **LA Metro Green Line** to **Redondo Beach station** (~30 min, $1.75) + rideshare 5 min',
      '**Arrival tip**: cell lot wait on Sepulveda if flight is early — pickup is faster',
    ],
  },
  {
    id: 'la-lax-newport', city: 'la',
    from: 'LAX Airport', to: 'Newport Beach',
    duration: '~45–60 min', cost: '$55–75 rideshare', mode: 'Rideshare',
    steps: [
      'LAX to Newport Beach is ~35 mi — rideshare from LAX-it lot (follow airport signs)',
      'I-405 South to I-73/CA-55 — avoid 5–7 PM weekdays (add 30+ min)',
      'Or fly into **SNA (John Wayne)** — 15 min to Newport Beach, saves 45 min over LAX',
      'Taxi alternative: ~$80–90 flat rate available from LAX taxi stands',
    ],
  },
  {
    id: 'la-sna-newport', city: 'la',
    from: 'SNA (John Wayne Airport)', to: 'Newport Beach',
    duration: '~15 min', cost: '$15–22 rideshare', mode: 'Rideshare',
    steps: [
      '**SNA rideshare**: Level 1, outside baggage claim, follow "Transportation" signs',
      'Newport Beach is 8 mi south — 15 min in normal traffic',
      'Or taxi from SNA cab stand — metered, ~$25–30 to most Newport Beach hotels',
      'Avoid SNA peak: Friday 4–7 PM departures are brutal — arrive 90 min early',
    ],
  },
  {
    id: 'la-lax-downtown', city: 'la',
    from: 'LAX Airport', to: 'Downtown LA / Hollywood',
    duration: '~30 min rail / 45 min rideshare', cost: '$1.75 rail / $35–50 rideshare', mode: 'Metro Rail',
    steps: [
      '**Metro C Line** (Green) from Aviation/LAX station — transfer to **A Line** (Blue) at Willowbrook',
      'A Line to **7th Street/Metro Center** (Downtown) — 45–55 min total, $1.75',
      'Or direct rideshare from LAX-it lot: $35–50, 30–45 min (traffic-dependent)',
      'Hollywood: Metro **B Line** (Red) from 7th/Metro Center to Hollywood/Highland — 20 min',
    ],
  },

  // ── MANHATTAN BEACH ───────────────────────────────────────────────────────
  {
    id: 'mb-pier', city: 'manhattan',
    from: 'Manhattan Beach hotels', to: 'Beach / Pier',
    duration: 'Walking distance', cost: 'Free', mode: 'Walk',
    steps: [
      'Manhattan Beach Pier is the landmark — all hotels within 10 min walk of the sand',
      '**Roundhouse Marine Studies Lab** at pier end: free entry, touch tanks, marine exhibits',
      '**The Strand**: paved 22-mile coastal bike/walk path — north to Santa Monica, south to Redondo',
      'Bike rentals: **Strand Bike Rentals** (Manhattan Ave) — $12/hr, $40/day',
      'Best coffee: **Groundwork Coffee** (Highland Ave) or **Zephyr Espresso** (Manhattan Beach Blvd)',
    ],
  },
  {
    id: 'mb-lax', city: 'manhattan',
    from: 'Manhattan Beach', to: 'LAX Airport',
    duration: '~15 min', cost: '$18–25 rideshare', mode: 'Rideshare',
    steps: [
      'Rideshare from hotel — LAX is 5 mi north, 15 min in light traffic',
      'Rush hour (7–9 AM, 4–7 PM) adds 15–30 min — plan accordingly',
      'Early flights: rideshare from hotel at curb is fastest; no need for LAX-it lot for departures',
      'Terminal drop-off is direct — follow signs for your airline on upper departures level',
    ],
  },
  {
    id: 'mb-hermosa', city: 'manhattan',
    from: 'Manhattan Beach', to: 'Hermosa Beach / Redondo Beach',
    duration: '~10–20 min walk / bike', cost: 'Free', mode: 'Walk / Bike',
    steps: [
      'Walk south on **The Strand** — Hermosa Beach Pier is 1.5 mi, ~25 min walk',
      'By bike: Hermosa is 10 min, Redondo Beach Pier is 20 min',
      '**Hermosa Beach Pier**: more local, less tourist — great for people watching',
      '**Hennessey\'s Tavern** (Pier Ave, Hermosa): classic beach bar, good happy hour 3–7 PM',
      'Return: walk or bike back, or rideshare ~$10',
    ],
  },

  // ── NEWPORT BEACH (CA) ───────────────────────────────────────────────────
  {
    id: 'nb-balboa', city: 'newport_ca',
    from: 'Newport Beach / Balboa area', to: 'Balboa Island',
    duration: '~3 min ferry', cost: '$1.50 / person', mode: 'Balboa Island Ferry',
    steps: [
      'Walk to **Palm Street Ferry Landing** on Balboa Peninsula — ferry runs 6:30 AM–midnight',
      '**Balboa Island Ferry** ($1.50/person, $2 bikes, $2.25 cars): oldest auto ferry in California',
      'On the island: **Marine Ave** is the main street — boutiques, Balboa Bars (chocolate-dipped ice cream)',
      '**Balboa Island Creamy** (Marine Ave): legendary frozen banana ($3) — the original since 1945',
      'Walk the island perimeter (2 mi loop) — harbor views, waterfront homes',
    ],
  },
  {
    id: 'nb-fashion', city: 'newport_ca',
    from: 'Newport Beach', to: 'Fashion Island',
    duration: '~10 min drive', cost: '$12–15 rideshare / Free parking', mode: 'Rideshare / Drive',
    steps: [
      'Fashion Island is Newport\'s open-air luxury mall — 200 stores, outdoor setting',
      'Rideshare from Balboa/hotel area: ~$12, 10 min. Free surface parking if driving.',
      'Anchors: **Nordstrom**, **Bloomingdale\'s**, **Neiman Marcus** + boutiques',
      '**Fig & Olive** and **True Food Kitchen** are the best restaurant options on-site',
      'Open Mon–Sat 10 AM–9 PM, Sun 11 AM–7 PM',
    ],
  },
  {
    id: 'nb-laguna', city: 'newport_ca',
    from: 'Newport Beach', to: 'Laguna Beach',
    duration: '~20 min', cost: '$20–28 rideshare', mode: 'Rideshare',
    steps: [
      'Head south on PCH (Pacific Coast Highway) — 10 mi, 20 min in light traffic',
      '**Laguna Beach Village**: walkable art galleries, restaurants on PCH',
      '**Main Beach Park**: iconic Laguna postcard — volleyball, palm trees, tidepool area',
      '**Montage Laguna Beach**: coastal resort, worth stopping for a drink with ocean views',
      'Return: rideshare from Main Beach or take PCH bus ($2, slower but scenic)',
    ],
  },
  {
    id: 'nb-sna', city: 'newport_ca',
    from: 'Newport Beach', to: 'SNA (John Wayne Airport)',
    duration: '~15 min', cost: '$15–22 rideshare', mode: 'Rideshare',
    steps: [
      'Rideshare from Newport Beach hotel — SNA is 8 mi north, 15 min',
      'SNA is famously easy: small airport, short security lines, close parking',
      'Drop-off: upper departures level, follows signs for your airline terminal (A, B, or C)',
      'TSA Pre-Check line at SNA is usually <5 min — factor in if you have it',
      'Flight timing: SNA has a 10 PM curfew — no departures after 10 PM (book accordingly)',
    ],
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────
function renderBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/)
  return parts.map((p, i) =>
    i % 2 === 1 ? <strong key={i} className="text-vellum">{p}</strong> : <span key={i}>{p}</span>
  )
}

// ── Shinjuku detailed route view ───────────────────────────────────────────
function ShinjukuRouteView({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-dvh bg-vault pb-24 animate-fade-in">
      <div className="px-8 pt-8 pb-4 border-b border-between">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-ember hover:text-dusk transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="text-center flex-1">
            <h1 className="font-display text-gold text-xl tracking-widest font-light">WAYFINDER</h1>
            <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase mt-0.5">東京 · Odaiba → Shinjuku</p>
          </div>
          <div className="w-5" />
        </div>
      </div>

      <div className="px-5 py-5 space-y-2.5">
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

      <div className="mx-5 mb-5">
        <div className="rounded-xl p-4 border border-[#00b2e5]/20"
          style={{ background: 'linear-gradient(135deg, rgba(0,178,229,0.06) 0%, rgba(0,172,107,0.06) 100%)' }}>
          <div className="grid grid-cols-4 divide-x divide-white/10">
            {[['~25','Minutes'],['7','Stops'],['¥490','~$3.30'],['TWR/JR','Lines']].map(([v, l]) => (
              <div key={l} className="text-center px-2">
                <p className="text-vellum font-display text-xl font-light">{v}</p>
                <p className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

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

      <div className="px-5 mb-5">
        <div className="rounded-xl p-4 border border-gold/20 bg-gold/5 flex items-start gap-3">
          <span className="text-lg shrink-0">💳</span>
          <div>
            <p className="text-vellum font-ui font-ui-light text-xs leading-relaxed">
              <strong>Suica · PASMO · IC cards</strong> accepted on both Rinkai and JR lines.
            </p>
            <p className="text-dusk font-ui font-ui-xlight text-xs mt-1 leading-relaxed">
              Tap in at Tokyo Teleport, tap out at Shinjuku. iPhone: add Suica to Apple Wallet.
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
  const city = CITIES.find(c => c.id === route.city)
  return (
    <div className="min-h-dvh bg-vault pb-24 animate-fade-in">
      <div className="px-8 pt-8 pb-4 border-b border-between">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-ember hover:text-dusk transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="text-center flex-1">
            <h1 className="font-display text-gold text-xl tracking-widest font-light">WAYFINDER</h1>
            <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase mt-0.5">
              {city?.emoji} {city?.label} · {route.to}
            </p>
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
            {[['⏱', route.duration, 'Time'], ['💰', route.cost, 'Cost'], ['🚃', route.mode, 'Mode']].map(([icon, v, l]) => (
              <div key={l} className="text-center">
                <p className="text-lg">{icon}</p>
                <p className="text-vellum font-ui font-ui-light text-xs mt-0.5">{v}</p>
                <p className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-layer rounded-xl p-4 border border-between space-y-3">
          <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase">Details</p>
          {route.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-gold text-[10px] font-bold">{i + 1}</span>
              </div>
              <p className="text-dusk font-ui font-ui-xlight text-xs leading-relaxed">{renderBold(step)}</p>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

// ── Main Wayfinder screen ──────────────────────────────────────────────────
export default function WayfinderScreen() {
  const [query, setQuery]         = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeCity, setActiveCity] = useState('all')

  if (selectedId === 'shinjuku') return <ShinjukuRouteView onBack={() => setSelectedId(null)} />
  const selected = ROUTES.find(r => r.id === selectedId)
  if (selected) return <SimpleRouteView route={selected} onBack={() => setSelectedId(null)} />

  const filtered = ROUTES.filter(r => {
    const cityMatch = activeCity === 'all' || r.city === activeCity
    const queryMatch = !query.trim() || [r.to, r.from, r.mode, r.city]
      .some(f => f.toLowerCase().includes(query.toLowerCase()))
    return cityMatch && queryMatch
  })

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
        <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase text-center mt-1">
          {ROUTES.length} routes · {CITIES.length - 1} cities
        </p>
      </div>

      {/* City tabs */}
      <div className="pt-4 pb-1 border-b border-between/50">
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide snap-x">
          {CITIES.map(city => (
            <button
              key={city.id}
              onClick={() => { setActiveCity(city.id); setQuery('') }}
              className={`flex-none snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-ui font-ui-light transition-all duration-200 whitespace-nowrap ${
                activeCity === city.id
                  ? 'bg-gold/20 border-gold/60 text-vellum'
                  : 'bg-layer border-between text-dusk hover:border-gold/30'
              }`}
            >
              <span>{city.emoji}</span>
              <span>{city.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-5 pt-4 pb-3">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ember" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search routes..."
            className="w-full bg-layer rounded-xl pl-10 pr-10 py-3 text-vellum font-ui font-ui-light text-sm placeholder-ember/40 border border-between focus:border-gold/40 focus:outline-none transition-colors"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ember hover:text-dusk p-1">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* City label */}
      {activeCity !== 'all' && (
        <div className="px-5 pb-2">
          {(() => { const c = CITIES.find(x => x.id === activeCity); return c ? (
            <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-widest uppercase">
              {c.emoji} {c.label} · {c.subtitle}
            </p>
          ) : null })()}
        </div>
      )}

      {/* Route list */}
      <div className="px-5 pb-5 space-y-2">
        {filtered.map(route => {
          const city = CITIES.find(c => c.id === route.city)
          return (
            <button
              key={route.id}
              onClick={() => setSelectedId(route.id)}
              className="w-full bg-layer rounded-lg p-4 border border-between hover:bg-hover hover:border-gold/30 transition-colors duration-200 text-left"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    {activeCity === 'all' && (
                      <span className="text-ember font-ui font-ui-xlight text-[10px]">{city?.emoji}</span>
                    )}
                    <p className="text-vellum font-ui font-ui-light text-sm truncate">{route.to}</p>
                    <span className="text-ember font-ui font-ui-xlight text-[9px] tracking-wider uppercase bg-between px-1.5 py-0.5 rounded shrink-0">
                      {route.mode}
                    </span>
                  </div>
                  <p className="text-dusk font-ui font-ui-xlight text-xs truncate">From {route.from}</p>
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
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-dusk font-ui font-ui-light text-sm">No routes found</p>
            <p className="text-ember font-ui font-ui-xlight text-xs mt-1">Try a city tab or search "Ginza", "Waikiki", "LAX"</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
