

## Pitch Deck Page for YouthWorks UNICEF Grant Application

### Overview
Create a new `/pitch-deck` page that serves as a visual, slide-based presentation designed to support a 2-minute pitch video. The page will be publicly accessible (no auth required), feature full-screen presentation mode, and include a downloadable PDF export.

### Slide Content (8 slides, ~15 seconds each for 2-min pacing)

1. **Title Slide** — YouthWorks logo, tagline "Blockchain-Powered Youth Employment & Climate Action", UNICEF Venture Fund 2026
2. **The Problem** — Youth unemployment stats (64M Nigerian youth, 53% unemployment), unverifiable credentials, financial exclusion, climate inaction
3. **Our Solution** — Four-pillar overview: Skills → Work → Green → Wallet, unified by Sigma token economy
4. **How It Works (Demo Flow)** — Visual walkthrough: Enroll → Earn credential hash → Get gig → Escrow payment → Plant tree → Earn Sigma → Spend in marketplace
5. **Blockchain Architecture** — Why blockchain: tamper-proof credentials, trustless escrow, portable tokens (ERC-20 on Base), carbon credit provenance. What stays off-chain.
6. **Current Status** — What's built: PWA, custodial wallets, credential hashing, edge functions, database. What's next: contract deployment, escrow, mainnet.
7. **12-Month Pilot Plan** — Phase 1-3 milestones: 500 → 2,000 → 5,000 users, Lagos pilot, 5,000 trees, first carbon credit sale
8. **Ask & Impact** — Funding request, target metrics, team, contact info

### Technical Approach

**Page & Routing:**
- New file: `src/pages/PitchDeckPage.tsx` — main page with slide navigation
- New file: `src/components/pitch/PitchSlides.tsx` — individual slide components
- New file: `src/components/pitch/PitchControls.tsx` — navigation, fullscreen, download controls
- Add route in `App.tsx` as public (no `ProtectedRoute`)

**Presentation Engine:**
- Fixed 1920x1080 canvas scaled to viewport using `transform: scale()` (per slides-app pattern)
- Keyboard navigation (arrow keys, Space, Escape)
- Fullscreen mode via Fullscreen API
- Slide transition animations using framer-motion

**Download/Export:**
- "Download PDF" button using browser `window.print()` with a print-optimized CSS stylesheet that renders all slides sequentially at A4/landscape, hiding controls
- This avoids any external PDF library dependency

**Design:**
- Dark gradient backgrounds matching YouthWorks brand (slate-deep, electric green accents, sigma gold)
- Large typography, minimal text per slide (pitch video support, not reading)
- Icons from lucide-react for visual anchors
- Stats rendered with animated counters using existing `count-up` animation

### Files Changed
1. `src/pages/PitchDeckPage.tsx` — new
2. `src/components/pitch/PitchSlides.tsx` — new (all 8 slide components)
3. `src/components/pitch/PitchControls.tsx` — new
4. `src/App.tsx` — add public route `/pitch-deck`
5. `src/index.css` — add print styles for PDF export

