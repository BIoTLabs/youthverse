

## Plan: Redesign Auth/Landing Page, Rebrand Logo, Switch to Base Blockchain

### 1. Redesign AuthPage as Landing + Auth Page

Transform `src/pages/AuthPage.tsx` from a simple centered auth card into a full landing page with sections:

- **Hero section**: Full-width gradient hero with tagline ("Build Your Verified Reputation. Earn Zlto."), a prominent CTA button that scrolls to the auth section, and animated stats counters (youth enrolled, trees planted, Zlto earned).
- **Three Pillars section**: Visual cards for Skills, Work, and Green pillars with icons, descriptions, and subtle animations (framer-motion).
- **How It Works section**: Step-by-step flow (Sign Up → Build Skills → Find Work → Plant Trees → Earn Zlto).
- **Partners/Trust section**: Logos/badges for NiYA, NYSC, UNICEF, Green Schools.
- **Auth section**: The existing sign-in/sign-up tabs card, anchored with an id so the hero CTA can scroll to it.
- **Footer**: Links, "Powered by blockchain - Base Sepolia Testnet".

The page will be a single scrollable page. If the user is already authenticated, redirect to `/dashboard`.

### 2. Rebrand Logo

Replace the simple "YW" text logo with an SVG logo component (`src/components/YouthWorksLogo.tsx`):
- A stylized tree + chain-link icon combining the green/blockchain themes.
- Used in both the landing page hero and the `AppLayout.tsx` header.
- Update the favicon reference in `index.html` (will use the same SVG inline approach or a generated favicon).

### 3. Switch Blockchain from Polygon to Base

**File: `src/lib/blockchain.ts`** - Update `CHAIN_CONFIG`:
```
chainId: 84532
chainName: 'Base Sepolia Testnet'
rpcUrl: 'https://sepolia.base.org'
blockExplorer: 'https://sepolia.basescan.org'
```

**File: `src/pages/AuthPage.tsx`** - Update footer text to "Base Sepolia Testnet".

No other files reference Polygon directly besides `WalletPage.tsx` which imports `CHAIN_CONFIG` (will auto-update).

### Files to modify
1. **`src/pages/AuthPage.tsx`** - Complete rewrite as landing + auth page
2. **`src/lib/blockchain.ts`** - Switch chain config to Base Sepolia
3. **`src/components/YouthWorksLogo.tsx`** - New SVG logo component
4. **`src/components/AppLayout.tsx`** - Use new logo component
5. **`index.html`** - Update meta descriptions

