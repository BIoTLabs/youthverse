

# Remove Lovable Branding for UNICEF Grant Review

## Scope of Changes

The Lovable references exist in only **2 editable files** (the rest are auto-generated lockfiles and build artifacts that should not be touched):

### 1. `README.md` -- Full rewrite
The entire file is a Lovable template. Replace it with a professional YouthWorks project README covering:
- Project name, mission statement, UNICEF alignment
- Tech stack (React, TypeScript, Vite, Tailwind CSS, Blockchain/Sigma tokens)
- Features overview (Skills, Work, Green, Wallet pillars)
- Setup instructions (clone, install, dev server)
- Architecture overview (frontend + cloud backend + edge functions)
- License info

### 2. `vite.config.ts` -- Keep as-is
The `lovable-tagger` import is a **dev-only** build plugin used only in development mode (`mode === "development"`). It is required for the Lovable editor to function and does not appear in production builds. This **must stay** to ensure consistent future updates via Lovable.

### Files NOT to edit (auto-generated, will be overwritten)
- `package.json` / `package-lock.json` / `bun.lock` -- `lovable-tagger` is a devDependency, invisible in production. Removing it would break the Lovable integration.
- `supabase/config.toml`, `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts` -- Auto-managed.

### Summary
| File | Action |
|------|--------|
| `README.md` | Rewrite with YouthWorks branding and project details |
| `vite.config.ts` | No change (required for editor functionality) |
| `package.json` | No change (dev dependency, not visible in production) |

This is a single-file change that replaces the generic Lovable README with a professional, grant-ready project document.

