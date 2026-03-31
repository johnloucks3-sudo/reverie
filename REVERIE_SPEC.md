# REVERIE — D2M Travel App Spec
## Dreams2Memories Travel, LLC
### Status: GO · 26 MAR 2026 · Commander Authorized · ALL CAPABILITIES CLEARED

---

## APP IDENTITY

| Field | Value |
|-------|-------|
| **Name** | REVERIE |
| **Tagline** | "Your journeys, remembered as you dreamed them." |
| **Brand** | Dreams2Memories Travel, LLC |
| **Theme** | Esoteric / Ethereal — the space between real life and dream |
| **Target Users** | D2M luxury travel clients |
| **First Impression** | Blow Commander's 32-day voyage: seamless, always-on AI companion |
| **Framing** | Rick Steves' AI Travel Assistant — Cruise + Luxury Focus |
| **Platform** | PWA (Progressive Web App) — `app.d2mluxury.quest` |

---

## HARD DEADLINES

| Milestone | Date |
|-----------|------|
| **Apr 8** | App MVP — Commander departs Apr 10 |
| **Jun 23** | McLeod / McGlasson embark — Silver Muse Mediterranean |
| **Commander Beta** | Jun 1–10 (post-Japan return) |

---

## STANDING ORDERS (from Commander)

1. **REVERIE** — name locked. Tagline LOCKED: *"Your journeys, remembered as you dreamed them."*
2. **Dani bot** — unlock Commander channel (dani_bot); integrate in Reverie as AI concierge.
3. **Budget** — MAX plan (Opus). *No external spend.* All AI wired into existing MAX. If promise shown → may go $200 MAX for mid-May to mid-June.
4. **Build log** — Keep note maintained by COS (teal, pinned).
5. **Emotional aesthetic** — Luna leads. Non-negotiable.
6. **Tech stack** — Web-first (launch), then React (Phase 2 post-Japan).
7. **Link-out, don't duplicate** — traveler already has Google Translate, WhatsApp. Connect, contextualize, don't rebuild.
8. **ALL CAPABILITIES CLEARED** — Commander directive 26 MAR 2026 05:08 UTC.

---

## WHAT REVERIE IS (AND IS NOT)

**IS:**
- Emotional travel memory experience
- AI concierge chat (Dani) — always on
- D2M brand ambassador on every client's device
- Complement to Outside Agents (OA) portal
- Rick Steves-style AI travel companion

**IS NOT:**
- Duplicate of OA (bookings/itinerary/vault = OA's domain, unless OA fails connectivity test)
- A booking engine
- A loyalty points tracker
- A camera app / video storage / social platform

**Integration posture:** Reads from OA where needed, does not replace it. (Offline mirror decision: Jun 1-10 Commander beta — contingent on OA connectivity at sea.)

---

## REVERIE STAFF ROSTER

| Role | Name | Responsibility |
|------|------|---------------|
| **Program Director** | COS Hale | Orchestration, schedule, Commander briefs |
| **Creative Director** | Luna Voss (A6) | Emotional pillars, screen names, visual aesthetic |
| **Innovation Lead** | ELON (A12) | Tech stack, architecture, MVP feature cuts |
| **Product Strategy** | A5 Castillo | Market positioning, competitive differentiation |
| **Finance** | A9 Harlan | Budget, commission architecture, cost model |
| **Voice & Copy** | EXEC Solberg-Vega | UX copy, onboarding narrative, Dani voice in app |
| **Intel** | A2 Dembe | Competitive sweep, luxury travel app landscape |
| **UX Validation** | A3 Dani | Chat integration spec, client experience validation |
| **External: FE** | typescript-expert | React architecture, type safety |
| **External: Perf** | react-performance-expert | Bundle size, load time, animations |
| **External: QA** | code-review-expert | Pre-release code review |

---

## DESIGN PHILOSOPHY

- **HUD Window** = always-on concierge chat (Dani) — primary interface, never hidden
- **Accordion Panels** = progressive disclosure of tools/data — no clutter
- **Link-out, don't duplicate** — connect and contextualize, don't rebuild what exists
- **Split-window optimized** — Z-Fold 6 / large phone split screen. App lives in one pane, map/browser in the other
- **Voice-first option** — minimal-button interface for one-handed, at-sea, luxury travel

---

## ARCHITECTURE: HUD + ACCORDION

```
┌─────────────────────────────────┐
│  CONCIERGE CHAT (DANI HUD)      │  ← Always visible. Ask anything.
│  "What time does the ship dock?"│
└─────────────────────────────────┘
│ ▼ MINI-BRIDGE                   │  accordion (prominent at sea)
│ ▼ MEDICAL                       │  accordion
│ ▼ TRANSLATOR                    │  accordion (links Google Translate)
│ ▼ WHATSAPP                      │  accordion (link-out)
│ ▼ MY LINK                       │  accordion (user-defined)
│ ▼ [+ ADD PANEL]                 │  expandable
└─────────────────────────────────┘
```

---

## DUAL-MODE ARCHITECTURE

**Context-aware, auto-switched or manual toggle.**

### 🌊 AT-SEA MODE — Command Center
When ship is underway or Commander is aboard:
```
┌───────────────────────────┐
│  MINI-BRIDGE (prominent)  │  ← GPS, speed, course, wind
│  CONCIERGE CHAT (Dani)    │  ← Always present
│  ▼ EXCURSIONS             │  accordion
│  ▼ DINING / SHIP SCHEDULE │  accordion
│  ▼ JOURNEY JOURNAL        │  accordion (EOD debrief prompt)
│  ▼ DOCUMENT VAULT         │  accordion
│  ▼ MEDICAL                │  accordion
└───────────────────────────┘
```
- Mini-Bridge is **prominent / elevated** — ship position, speed, course, wind = primary real estate
- Dossier data surfaced: cabin, dining, port arrival times
- Dani always accessible

### 🗺️ ON-LAND MODE — Explorer Interface
When in port, city, or touring:
```
┌───────────────────────────┐
│  CONCIERGE CHAT (Dani)    │  ← Always present
│  ▼ TRAVELING              │  accordion (flights, transfers, logistics)
│  ▼ TOURING                │  accordion (excursions, guided, shore highlights)
│  ▼ EXPLORING              │  accordion (spontaneous, restaurant finder, CruiseMapper)
│  ▼ EXPERIENCING           │  accordion (dining res, cultural context, Dani recs)
│  ▼ JOURNEY JOURNAL        │  accordion ← NEW
│  [mini-bridge strip]      │  ← collapsed, ship status only
└───────────────────────────┘
```

---

## FULL CAPABILITY SET — ALL CLEARED (26 MAR 2026)

| # | Capability | Notes |
|---|-----------|-------|
| 1 | **Itinerary Hub** | Ship, cabin, ports, dates, flights, transfers — single source of truth |
| 2 | **Mini-Bridge** | GPS ship position, route trace, previous ports, wind/speed(mph)/course on world sector map |
| 3 | **CruiseMapper** | Embed or deep-link — identify ships seen at sea by position |
| 4 | **Shore Excursion Planner** | Compare, book, track excursions per port |
| 5 | **Packing & Customs Tracker** | What fits in carry-on, declaration alerts by country |
| 6 | **Concierge Chat (Dani)** | AI assistant — dining res, ship questions, port intel, recommendations |
| 7 | **Medical Advice** | Symptom checker, nearest medical facility, ship doctor contact, travel insurance hotline |
| 8 | **Translator** | Link-out to Google Translate. Do NOT rebuild. |
| 9 | **WhatsApp** | Quick-link panel. Already on phone — no duplication. |
| 10 | **My Link** | User-defined. Could be ship webcam, hotel, family group chat, anything. |
| 11 | **Live Weather** | Port-by-port, sea conditions, storm alerts |
| 12 | **Document Vault** | Passport, visa, insurance, booking confirms — offline accessible |
| 13 | **WAYFINDER** | Transit navigation — bilingual, fares, city-by-city (see module below) |
| 14 | **Journey Journal** | GPS-linked photo/note/map journal — see module below |
| 15 | **Voice-First Mode** | Speak to Dani naturally — "Book a table near the port tonight" |
| 16 | **Telegram Modification** | Commander modifies app from Japan via /app Telegram commands |

---

## MODULE: MINI-BRIDGE

The ship awareness panel — luxury traveler's version of the bridge:

| Feature | Detail |
|---------|--------|
| **Position** | Real-time GPS lat/long → plotted on world sector map |
| **Route trace** | Ports visited (breadcrumb), next port bearing |
| **Speed** | Knots → converted to mph display |
| **Course** | Compass heading |
| **Wind** | Direction + speed |
| **CruiseMapper link** | "What ship is that on the horizon?" → tap → identify |
| **Starlink note** | Most Silversea/Regent/Seabourn ships now Starlink-enabled |

---

## MODULE: WAYFINDER — Transit Navigation
**Status:** SPEC LOCKED · 26 MAR 2026 · Commander directed

### Purpose
When the client is in a destination city, they need to know how to get from where they are to where they want to be — on local transit. Simple, beautiful, bilingual, right-cost.

### Core Capabilities
| Feature | Detail |
|---------|--------|
| **GPS detection** | Detects current city + nearest transit station |
| **Destination input** | Free text OR tap-on-map |
| **Route engine** | City-aware — metro/subway/rail per destination |
| **Bilingual display** | Local script + English on every stop |
| **Station codes** | Shown for every stop (e.g., M-16 · 銀座) |
| **Transfers** | Interchange lines flagged at each stop |
| **Fare** | Local currency + USD equivalent |
| **Instructions** | Direction/platform/stop count, plain English |
| **IC/payment note** | Per-city tap card guidance |

### Cities in Scope (Launch)
Tokyo · Venice · Paris · London · Rome · NYC · Hong Kong · Singapore

### Demo Built
- Route: Ginza (M-16) → Shinjuku (M-08)
- Line: Marunouchi (Red · M) · Direction: Ogikubo
- Stops: 8 · Time: ~22 min · Fare: ¥210 (≈ $1.40 USD)
- File: `reverie/wayfinder_tokyo_demo.html`

---

## MODULE: JOURNEY JOURNAL

**Problem:** Serious travellers keep notes, but it's hard to maintain. Linking video + location + notes is powerful but fragmented across apps.

**Solution:** Built-in native panel. Every moment in a specific place can be linked:
```
[Video/Photo] ←→ [GPS Pin on Map] ←→ [Note(s)]
```

### Journal Modes
| Mode | Trigger | Content |
|------|---------|---------|
| **Ad Hoc Capture** | Tap "+" anywhere in app | GPS auto-tagged. Add photo/video link, type note. 15-second minimum friction. |
| **End of Day Debrief** | Push notification at 8 PM (Commander-set time) | "How was today?" — structured or free-form. Day summary, highlights, regrets, what to do tomorrow. |
| **Port Entry Auto-Note** | App detects ship has docked at new port | Pre-populates: port name, date/time, weather, dossier excursion info. Commander adds impressions. |

### Data Model (per entry)
```
Journey Entry {
  timestamp: ISO 8601
  location: { lat, lon, name }        ← GPS auto-captured
  port_or_city: string                ← from dossier if at sea / port
  photo_links: [ URL, URL ]           ← link to phone camera roll / Google Photos
  video_links: [ URL ]                ← link-out, don't duplicate storage
  note: markdown text
  tags: [ "dining", "must_return", "ship", "shore" ]
  mood: optional emoji / 1-5 stars
}
```

### Map View
- World/regional map with pins at each captured location
- Pin color = mode (green=ad hoc, blue=EOD, orange=port auto)
- Tap cluster → expand entries from that location
- Time-slider: replay the journey day by day
- Links to same map layer as Mini-Bridge (route trace)

### What We Do NOT Build
- ❌ Camera — stays in phone camera app. We link, not capture.
- ❌ Video storage — Google Photos / iCloud already exist. We index, not store.
- ❌ Social sharing — this is a personal journal, not Instagram

### Why This Wins
At trip end: exportable as a travel memoir PDF with map and photos embedded.

---

## TELEGRAM MODIFICATION INTERFACE

Commander modifies the app from Japan via Telegram C2:

```
/app status          → Current build status, feature flags
/app note [text]     → Create a journey note from phone (GPS attached)
/app eod             → Trigger EOD debrief prompt now
/app feature [name] on|off  → Toggle feature flags remotely
/app dossier reload  → Pull fresh dossier data from YOGA
```

Commander in Kyoto can tap Telegram, dictate a note, and it appears in the Journey Journal geotagged to Japan.

---

## DANI BOT UNLOCK — COMMANDER DIRECT ACCESS

**Build tasks:**
- [ ] Detect Commander's Telegram user ID on dani_bot channel
- [ ] If sender = Commander (Yoda), route directly to Dani — no COS gate
- [ ] Dani responds to Commander with full MCP access (same as client mode)
- [ ] Log all Commander ↔ Dani conversations to session memory
- [ ] Commander can toggle between C2 bot and Dani bot

**Why:** Travel app AI chat layer IS Dani. Commander dogfoods the exact experience clients get. Japan: dani_bot = primary AI companion for trip intelligence.

---

## DEPLOYMENT ARCHITECTURE — 3-LAYER CLOUD

**Commander selected OPTION 2** — Cloud-hosted PWA: `app.d2mluxury.quest`

| Layer | Tech | Host | Cost |
|-------|------|------|------|
| **Layer 1 — Front Door** | Cloudflare Pages · PWA shell (React/Vite) | Cloudflare | Free |
| **Layer 2 — Brain** | Python FastAPI · Dossier data · Magic link auth · SQLite/Supabase | Hetzner CX21 (2vCPU/4GB) | ~$7/mo |
| **Layer 3 — Intelligence** | Thunderbird MCP via `api.d2mluxury.quest` tunnel | YOGA (existing) | $0 incremental |
| **TOTAL** | | | **~$7-10/mo** |

**YOGA independence:** Layer 2 VPS is not YOGA-dependent. Graceful fallback: if YOGA down, static dossier data serves from VPS.

---

## PILOT CLIENT — COMMANDER JOHN LOUCKS

| Field | Detail |
|-------|--------|
| **Clients** | Commander John Loucks |
| **Trip** | Japan Voyage (details to follow) |
| **Dates** | Apr 10 – May 11, 2026 |
| **Route** | Japan (multi-city, multi-transport) |

**Killer demo moment (Fusina disembark, Jul 3):**
> *"Your ship has docked at Fusina. Water taxi direct to Stucky dock confirmed — meeting point at Fusina Gate B. Your bags are being offloaded. You have 2h 14min before VCE departure."*
> — This is the moment they show every person on the ship.

**Pre-loaded data (Day 1 — no manual entry):**
- Japan itinerary, multi-transport
- Flights: JL 001, NH 234
- Tokyo hotels + transfers
- Japan intra-country transport (trains, buses)
- Japan excursions (cultural, dining)
- Dining priority: Tokyo sushi (omakase)

---

## BUILD TIMELINE — 2 WEEKS TO APR 10 EMBARK

| Phase | Window | Deliverable |
|-------|--------|-------------|
| Infra + shell | Mar 29 – Apr 7 | VPS provisioned, PWA deployed, auth live, domain up |
| Dossier loader | Apr 8–9 | Commander data auto-populates from D2M system |
| Japan Mode | Apr 10 – Apr 20 | Mini-Bridge, rail connections, local weather live |
| Dani chat | Apr 21 – May 5 | Concierge chat interface → MCP connected |
| On-Land Mode | May 6 – May 10 | Accordion menus — Traveling/Touring/Exploring/Experiencing |
| Document Vault | May 10 – May 11 | Offline PDFs, passport backup, offline caching |
| Commander beta | Apr 10 – May 11 | Commander tests *during* Japan voyage |
| Commander handoff | Apr 9 | Magic link sent, onboarding call, walk-through |
| **EMBARK** | **Apr 10** | **Commander boards for Japan with app live** |

**NOTE:** Commander is on voyage Apr 10 – May 11. Build is autonomous — Wing executes. Telegram C2 = only interface for in-voyage direction.

---

## OA PORTAL — DUPLICATION DECISION

| Feature | OA Portal | Build in REVERIE? |
|---------|-----------|-------------------|
| Itinerary | ✅ Yes | ❌ No — link out |
| Bookings | ✅ Yes | ❌ No — link out |
| Document Vault | ✅ Yes | ❌ No — link out |
| Mini-Bridge / Ship Position | ❌ No | ✅ Build |
| Dani Concierge Chat | ❌ No | ✅ Build |
| Journey Journal | ❌ No | ✅ Build |
| Shore Excursion Compare | ❌ No | ✅ Build |
| Medical / Translator | ❌ No | ✅ Link-out |

**Open item:** If OA portal proves unreliable at sea / in Japan → Commander beta Jun 1-10 decides whether to build offline itinerary mirror. Test OA on Z-Fold 6 from Japan.

---

## WHAT WE DO NOT BUILD

Per Commander's directive:
- ❌ Navigation app (Google Maps exists)
- ❌ Full translator (Google Translate exists)
- ❌ Messaging (WhatsApp/iMessage exist)
- ❌ Camera features
- ❌ Currency converter (link out if needed)
- ❌ Video storage (Google Photos / iCloud exist)
- ❌ Social sharing

---

## LUNA'S BRAND IDENTITY — LOCKED 26 MAR 2026

**Commander's anchor phrase (26 MAR 2026):**
> *"Feels like a beautifully organized journal handed to you by someone who loves you."*

**Priority order (Standing Order):** Words → Experience → Images → Inspiration

### Emotional Pillars
1. **THE AFTERGLOW** — The feeling of having been somewhere that remade you
2. **SOVEREIGN TIME** — You are not on anyone else's clock
3. **WITNESSED** — The deep human need to have one's life seen — and found beautiful *(Commander: CONCUR)*
4. **HELD IN CAPABLE HANDS** — Total trust in whoever is managing your world
5. **THE DREAM THAT HAS A DATE** — The particular electricity of a journey in the future tense *(Commander: CONCUR)*
6. **THE RETURN** — The bittersweet arrival back, and the art of carrying what you found

**The ONE feeling:** **RECOGNIZED** — The user opens REVERIE and something *knows* them. Not performs knowing — actually knows. The candle was already lit.

### Screen Names (REVERIE brand)
| Generic | REVERIE Name | Why |
|---------|-------------|-----|
| Home | **REVERIE** | You're inside it — recursive, complete |
| Chat/Dani | **THE ORACLE** | Keeper of knowledge — esoteric, trusted, non-transactional |
| Memories | **AFTERGLOW** | Pillar I, made into architecture — your experiences live as light, not logs |
| Trip | **THE VOYAGE** | Forward, specific, charged — *the* voyage |
| Settings | **THE CHAMBER** | Your private room. Quiet. Nothing is tracked here — it's curated |

### Color Palette — "The dark of a candlelit room, not a server rack"
| Role | Name | Hex |
|------|------|-----|
| Primary BG | The Vault | `#0C0A0F` |
| Surface 1 | The Page | `#161320` |
| Surface 2 | The Layer | `#221C30` |
| Surface 3 | The Hover | `#2C253F` |
| Divider | The Between | `#2A2438` |
| Accent Gold | Candlelight | `#C9A87C` |
| Accent Ether | Twilight | `#9B8EC4` |
| Accent Rose | The Witness | `#C4847A` |
| Text Primary | Vellum | `#EDE8DE` |
| Text Secondary | Dusk | `#9E9080` |
| Text Muted | Ember | `#5A5050` |

**Glow:** `rgba(201, 168, 124, 0.12)` — ambient candlelight corona on active cards

### Typography
- **Display** (anything the user *feels*): Cormorant Garamond, Light Italic 300i / Regular 400
- **UI** (anything the user *does*): Outfit, ExtraLight 200 / Light 300

### Logo Mark Direction
Waxing crescent moon (opening right) cradling a single five-pointed star within its arc.
Antique gold `#C9A87C` on deep violet-black `#0C0A0F`. Flat vector — works 16px to 200px.
- Moon = Sovereign Time (cyclical keeper)
- Star within = The Dream That Has a Date (the specific dream, cradled)
- Posture = Held in Capable Hands

---

## PHASE 0 DESIGN APPROVALS — LOCKED 26 MAR 2026

| Screen | Variant | Decision |
|--------|---------|----------|
| **Logo mark** | **A** | Crescent + star, antique gold on vault, Cormorant Garamond wordmark |
| **Home / REVERIE** | **D** | Full immersive hero — ship photography, gold CTA pill, dusk gradient overlay |
| **Oracle / THE ORACLE** | **D** | Full Dani chat thread — morning brief + user reply + weather response, gold send button, "Ask Dani anything…" input pill |

**Phase 0 gate: CLOSED. Phase 1 is OPEN.**

---

## BUILD LOG

| Date/Time | Entry |
|-----------|-------|
| 26 MAR 2026 04:56 UTC | GO ORDER. REVERIE selected. Staff assembled. Spec initiated. |
| 26 MAR 2026 05:05 UTC | WAYFINDER module spec locked. Tokyo demo built. Cities in scope: 8. |
| 26 MAR 2026 05:08 UTC | Tagline LOCKED. Tech stack LOCKED: Web-first → React. Additional capabilities pending. |
| 26 MAR 2026 05:10 UTC | Commander: "yes cleared for all." Full capability set ingested from hardware_travel_config_20260326.md. Spec updated: 16 capabilities, dual-mode architecture, Journey Journal, Mini-Bridge, Dani unlock, 3-layer deployment, build timeline, McLeod pilot use case. |
| 26 MAR 2026 05:13 UTC | Commander directive: HARD DEADLINE 8 APR 2026. No external spend — all wired into MAX. Luna anchor phrase locked: "beautifully organized journal handed to you by someone who loves you." Budget gate: $200 MAX mid-May to mid-June if promise shown. |
| 26 MAR 2026 (Phase 0 close) | Luna brand identity locked: palette, typography, screen names, one feeling (RECOGNIZED). 12 Canva candidates generated. Commander selected: Logo A · Home D · Oracle D. Phase 0 CLOSED. Phase 1 OPEN. React/FastAPI scaffold built: client/ (React 19 + Vite + PWA + Tailwind), api/ (FastAPI + magic link auth + JWT), .gitignore, config.py, requirements.txt. |

---

## KEEP NOTES
- Build Log: `19d28832c87.40571c6c1fb11651` (teal, pinned)
- Product Vision v4: `19d2859e844.fc435ef95a16abc4`
- MVP Spec: `19d287de55c.a55fc0cdc0c15572`
- Deployment Plan: `19d285fda68.fd7edd2b1cd6a97f`