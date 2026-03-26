# REVERIE — PROJECT MANAGEMENT PLAN
## Dreams2Memories Travel, LLC
### v1.0 · COS Hale · 26 MAR 2026 · 05:20 UTC

---

## COMMAND AUTHORITY

| Field | Value |
|-------|-------|
| **Commander** | John Loucks (Yoda) |
| **Program Director** | COS Hale |
| **Authority Granted** | 26 MAR 2026 — full authority, no external spend |
| **Hard Deadline** | 8 APR 2026 |
| **Departs** | 10 APR 2026 |
| **Days Available** | 13 |
| **Budget** | MAX plan (Opus) — $0 external |

---

## PROJECT NORTH STAR

> *"Blow Erik & Melissa's socks off on first open."*
> *"Feels like a beautifully organized journal handed to you by someone who loves you."*
> — Commander Yoda, 26 MAR 2026

**Priority order (Standing Order):** Words → Experience → Images → Inspiration

---

## TOOLS INVENTORY

| Tool | Purpose | Cost |
|------|---------|------|
| Claude MAX / Opus | All AI — code, design, copy, architecture | $0 incremental |
| **Canva MCP** | Illustrator — mockups, wireframes, brand identity, UI design | $0 (integrated) |
| TodoWrite | Session task board | $0 |
| Google Keep | Persistent build log (teal, pinned) | $0 |
| skill-creator | /reverie-pm sprint status skill | $0 |
| Hetzner CX21 | Layer 2 VPS — FastAPI backend | ~$7/mo |
| Cloudflare Pages | PWA at app.d2mluxury.quest | Free |
| Supabase free tier | Session + preference data | Free |
| GitHub | Code repository | Free |
| **TOTAL EXTERNAL** | | **~$7/mo** |

---

## APR 8 MVP — DEFINITION OF DONE

These 8 things must work on Commander's Z-Fold 6 before departure:

| # | Must-Have | Test |
|---|-----------|------|
| 1 | App loads fast and looks gorgeous | Open app.d2mluxury.quest on Z-Fold 6 |
| 2 | Dani chat works | Ask "What time do we dock in Civitavecchia?" |
| 3 | McLeod data pre-loaded | Suite 617, all ports, all flights show |
| 4 | Mini-Bridge shows position | Ship GPS or demo position on map |
| 5 | WAYFINDER navigates | Tokyo: Ginza → Shinjuku route runs |
| 6 | At-Sea ↔ On-Land toggle | Switch modes manually |
| 7 | Journey Journal captures | Add one test entry with GPS tag |
| 8 | Fusina "wow moment" scripted | Demo sequence ready |

---

## 13-DAY SPRINT PLAN

**Day 1 = 26 MAR · Day 13 = 7 APR · Deploy = 8 APR**

---

### PHASE 0 — DESIGN & FOUNDATION
**Days 1–2 · 26–27 MAR**

*Gate: Commander approves brand direction + wireframes before any code drops.*

| # | Task | Owner | Tool | Status |
|---|------|-------|------|--------|
| 0.1 | PM plan published | COS | Write | ✅ DONE |
| 0.2 | Keep build log updated | COS | Keep MCP | 🟡 Today |
| 0.3 | /reverie-pm skill built | COS | skill-creator | 🟡 Today |
| 0.4 | Luna emotional pillars + screen names | A6 Luna | consult_persona | ✅ DONE — Commander CONCURS III + V |
| 0.5 | REVERIE brand identity: palette, logo mark, UI colors | COS + Luna | **Canva MCP** | 🟡 Today |
| 0.6 | App wireframes: Home, HUD, At-Sea, On-Land, WAYFINDER | COS | **Canva MCP** | 🟡 Today |
| 0.7 | Commander wireframe review & approval | Commander | Telegram | 🟡 Today |
| 0.8 | Git repo initialized: reverie/ scaffold | COS | Bash | 🟡 Today |
| 0.9 | Tech stack confirmed + ELON architecture brief | ELON | consult_persona | 🟡 Today |

---

### PHASE 1 — INFRASTRUCTURE
**Days 3–5 · 28–30 MAR**

*Gate: app.d2mluxury.quest loads in browser. Auth works. Dossier endpoint returns data.*

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1.1 | Hetzner CX21 VPS provisioned + hardened | COS | 🟡 Pending |
| 1.2 | Cloudflare Pages → app.d2mluxury.quest DNS live | COS | 🟡 Pending |
| 1.3 | React + Vite scaffold deployed to CF Pages | ELON | 🟡 Pending |
| 1.4 | PWA manifest + service worker (offline capable) | ELON | 🟡 Pending |
| 1.5 | Magic link auth (reuse portal/server.py) | ELON | 🟡 Pending |
| 1.6 | FastAPI backend on VPS: dossier data endpoints | ELON | 🟡 Pending |
| 1.7 | YOGA → VPS tunnel verified (api.d2mluxury.quest) | COS | 🟡 Pending |
| 1.8 | SQLite schema: users, dossiers, journal entries | ELON | 🟡 Pending |

---

### PHASE 2 — CORE FEATURES
**Days 6–10 · 31 MAR – 4 APR**

*Gate: Dani responds in app. Mini-Bridge shows position. WAYFINDER navigates Tokyo route. McLeod data live.*

| # | Task | Owner | Status |
|---|------|-------|--------|
| 2.1 | HUD + Accordion component architecture | typescript-expert | 🟡 Pending |
| 2.2 | At-Sea / On-Land mode toggle (GPS detection) | ELON | 🟡 Pending |
| 2.3 | Dani concierge chat UI wired to Thunderbird MCP | A3 + ELON | 🟡 Pending |
| 2.4 | Mini-Bridge: GPS position, speed, course, wind | ELON | 🟡 Pending |
| 2.5 | NOAA weather integration: port-by-port, sea state | A2 Dembe | 🟡 Pending |
| 2.6 | CruiseMapper embed / deep-link | ELON | 🟡 Pending |
| 2.7 | WAYFINDER: Tokyo demo → production build | ELON | 🟡 Pending |
| 2.8 | WAYFINDER: Cities 2-8 (Venice, Paris, London, Rome, NYC, HK, SG) | ELON | 🟡 Pending |
| 2.9 | McLeod/McGlasson pilot data pre-loaded | COS + A3 | 🟡 Pending |
| 2.10 | Journey Journal: Ad Hoc Capture mode (GPS + note + photo link) | ELON | 🟡 Pending |

---

### PHASE 3 — POLISH & MVP
**Days 11–13 · 5–7 APR · Deploy Day 8 APR**

*Gate: Commander demos on Z-Fold 6. All 8 MVP items pass.*

| # | Task | Owner | Status |
|---|------|-------|--------|
| 3.1 | Journey Journal: EOD debrief + Port auto-note | ELON | 🟡 Pending |
| 3.2 | Document Vault (link-out + offline cache) | ELON | 🟡 Pending |
| 3.3 | Dani bot Commander unlock (Telegram ID bypass) | COS | 🟡 Pending |
| 3.4 | /app Telegram commands (status, note, eod, feature) | COS | 🟡 Pending |
| 3.5 | Z-Fold 6 split-screen optimization | react-performance-expert | 🟡 Pending |
| 3.6 | Voice-first mode (browser Speech API) | ELON | 🟡 Pending |
| 3.7 | QA pass — code-review-expert | code-review-expert | 🟡 Pending |
| 3.8 | Fusina "wow moment" demo sequence scripted | COS | 🟡 Pending |
| 3.9 | YOGA pre-departure checklist (per hardware config) | COS | 🟡 Pending |
| 3.10 | dv7 configured as warm standby | COS | 🟡 Pending |
| 3.11 | Commander go/no-go brief (APR 7 EOD) | COS | 🟡 Pending |
| 3.12 | MVP DEPLOY | All | 🟡 8 APR |

---

## RISK REGISTER

| # | Risk | P | I | Mitigation |
|---|------|---|---|-----------|
| R1 | Mini-Bridge ship API (MarineTraffic/CruiseMapper free tier) | M | H | CruiseMapper embed as fallback; research API limits D1 |
| R2 | Dani MCP latency at sea / Japan | M | H | VPS static fallback; cache last Dani response |
| R3 | YOGA unattended 31 days | H | H | dv7 warm standby by Apr 9; Cloudflare tunnel watchdog |
| R4 | Luna pillars missing → brand blocked | M | M | COS consults A6 within 24h; COS drives brand if needed |
| R5 | WAYFINDER 8-city scope (Days 6-10) | M | M | Cut to 3 cities (Tokyo, Venice, Rome) if schedule slips |
| R6 | PWA offline caching complexity | M | M | Reuse portal/server.py service worker pattern |
| R7 | Hetzner provisioning time | L | M | Railway.app free tier as same-day backup |

**P = Probability: H/M/L · I = Impact: H/M/L**

---

## DAILY CADENCE

| Time | Event |
|------|-------|
| Session open | Load this PM plan · check phase · update TodoWrite |
| Task complete | Update Keep build log immediately (teal note) |
| Phase gate | Commander brief via Telegram / email draft |
| Apr 7 EOD | Go / No-Go brief to Commander |
| Apr 8 | MVP deployed · Commander demos on Z-Fold 6 |

---

## STAFF ALLOCATION

| Phase | Primary | Support |
|-------|---------|---------|
| Design (Phase 0) | Luna A6 + Canva MCP | EXEC Solberg-Vega |
| Infra (Phase 1) | ELON A12 | COS |
| Features (Phase 2) | ELON + typescript-expert | A2 Dembe (data), A3 Dani (chat spec) |
| QA (Phase 3) | code-review-expert | react-performance-expert |
| Deploy | COS | ELON |
| Commander demo | COS | All staff |

---

## BUILD LOG

| Date/Time | Entry |
|-----------|-------|
| 26 MAR 2026 04:56 UTC | GO ORDER. REVERIE selected. Staff assembled. Spec initiated. |
| 26 MAR 2026 05:05 UTC | WAYFINDER module spec locked. Tokyo demo built. 8 cities in scope. |
| 26 MAR 2026 05:08 UTC | Tagline LOCKED. Tech stack LOCKED: Web-first → React. |
| 26 MAR 2026 05:10 UTC | Commander cleared all 16 capabilities. Full spec ingested. |
| 26 MAR 2026 05:13 UTC | HARD DEADLINE Apr 8. No external spend. Luna anchor phrase locked. |
| 26 MAR 2026 05:20 UTC | FULL AUTHORITY GRANTED. PM plan v1.0 created. Canva MCP = illustrator. 13-day sprint locked. Phase 0 begins. |
| 26 MAR 2026 05:38 UTC | Luna SOUL FOUNDATION delivered (6 pillars). Dembe ARCHETYPE INTEL delivered (6 archetypes + 5 fears). |
| 26 MAR 2026 05:38 UTC | ✅ COMMANDER CONCURS — Pillar III: WITNESSED. Pillar V: THE DREAM THAT HAS A DATE. All work captured. |

---

## KEEP NOTES
- Build Log: `19d28832c87.40571c6c1fb11651` (teal, pinned)
- Product Vision v4: `19d2859e844.fc435ef95a16abc4`
- MVP Spec: `19d287de55c.a55fc0cdc0c15572`
- Deployment Plan: `19d285fda68.fd7edd2b1cd6a97f`
