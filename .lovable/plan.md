

# Favicon Generation + PWA Implementation

## Overview
Two tasks: (1) Generate a branded favicon using AI image generation, then set up PWA icons in multiple sizes. (2) Install and configure `vite-plugin-pwa` with a proper manifest and an install prompt component.

## 1. Generate Favicon / App Icon

Use the Lovable AI image generation endpoint (`google/gemini-2.5-flash-image`) via an edge function to generate a favicon matching the brand: electric green "Y" mark on dark slate rounded-square background.

Since generating and saving a base64 image dynamically is complex, the simpler approach is:
- Create an **SVG favicon** (`public/favicon.svg`) that replicates the logo mark (the Y on dark slate with the green accent dot) — this gives crisp rendering at all sizes and matches the brand exactly.
- Create multiple PNG icon sizes (192x192, 512x512) by referencing the same SVG in the manifest — modern browsers handle SVG favicons natively.
- Update `index.html` to reference the new SVG favicon.

### Files:
- **Create** `public/favicon.svg` — standalone SVG of the logo mark
- **Create** `public/icon-192.svg` and `public/icon-512.svg` (same SVG, referenced at different sizes in manifest)
- **Edit** `index.html` — add `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`

## 2. PWA Setup

### Install dependency:
- `vite-plugin-pwa`

### Configure:
- **Edit** `vite.config.ts` — add `VitePWA` plugin with:
  - `registerType: 'autoUpdate'`
  - `manifest` with app name, theme color (`#0f1318` slate-deep), background color, icons array
  - `workbox.navigateFallbackDenylist: [/^\/~oauth/]` (critical for auth)
  
- **Create** `public/manifest.json` — standard PWA manifest (name, short_name, icons, start_url, display: standalone, theme_color, background_color)

- **Edit** `index.html` — add `<link rel="manifest" href="/manifest.json">`, `<meta name="theme-color">`, Apple touch icon meta tags

### Install Prompt Component:
- **Create** `src/components/PWAInstallPrompt.tsx` — a floating banner/modal that:
  - Listens for the `beforeinstallprompt` event
  - Shows a sleek branded prompt with "Install YouthWorks" CTA
  - Dismissable, with localStorage flag to not re-show after dismissal
  - On iOS (no `beforeinstallprompt`), shows instructions for "Add to Home Screen"
  - Auto-hides if app is already in standalone mode

- **Edit** `src/App.tsx` — render `<PWAInstallPrompt />` at root level

## Technical Details

### SVG Favicon Content
Reuses the exact logo mark from `YouthWorksLogo.tsx` but with hardcoded colors:
- Background: `#0f1318` (slate-deep), `rx=14`
- Y stroke: `#ffffff`, strokeWidth 4.5
- Accent dot: `hsl(145 90% 55%)` = `#1ef06c`

### PWA Manifest
```json
{
  "name": "YouthWorks",
  "short_name": "YouthWorks",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0f1318",
  "background_color": "#0f1318",
  "icons": [...]
}
```

### Install Prompt UX
- Floating bottom banner with glassmorphic styling matching the brand
- Shows after 3-second delay on first visit
- "Install" button + dismiss X
- Stores `yw-pwa-dismissed` in localStorage

## Files Summary
| Action | File |
|--------|------|
| Create | `public/favicon.svg` |
| Create | `public/pwa-192x192.svg`, `public/pwa-512x512.svg` |
| Create | `src/components/PWAInstallPrompt.tsx` |
| Edit | `index.html` |
| Edit | `vite.config.ts` |
| Edit | `src/App.tsx` |
| Install | `vite-plugin-pwa` |

