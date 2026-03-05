

# Rebrand ZLTO → Sigma + Deploy Real ERC-20 + Custodial Wallets

## Overview

Three major workstreams: (1) rename all ZLTO references to Sigma across the entire app, (2) deploy a real Sigma ERC-20 token on Base Sepolia via an edge function, and (3) replace the insecure deterministic wallet generation with server-side custodial wallets backed by encrypted private keys in the database.

---

## 1. Rename ZLTO → Sigma (All Files)

Global find-and-replace across ~19 files:

| Pattern | Replacement |
|---------|-------------|
| `ZLTO` | `SIGMA` |
| `Zlto` | `Sigma` |
| `zlto` | `sigma` |
| `text-zlto` | `text-sigma` |

**Files to edit:**
- `src/lib/blockchain.ts` — rename ABI events, contract config keys
- `src/index.css` / `tailwind.config.ts` — rename `zlto` color token to `sigma`
- `src/pages/Dashboard.tsx`, `WalletPage.tsx`, `SkillsPage.tsx`, `GreenPage.tsx`, `WorkPage.tsx`, `ProfilePage.tsx`, `PublicProfilePage.tsx`, `AdminPage.tsx`
- `src/components/admin/AdminStats.tsx`, `CarbonCreditsTab.tsx`, `ImpactReportsTab.tsx`, `NationalDashboard.tsx`, `SurvivalChecksTab.tsx`
- `src/components/wallet/YouthInvestmentFund.tsx`
- `src/components/OnboardingModal.tsx`
- `src/components/RealtimeNotifications.tsx`

**Database:** Column names (`zlto_balance`, `zlto_reward`, `zlto_awarded`, `zlto_per_tree`, etc.) stay as-is in the DB to avoid a massive migration. Only UI-facing text changes. The `zlto_transactions` table name also stays — renaming tables is high-risk for zero benefit.

---

## 2. Deploy Real Sigma ERC-20 on Base Sepolia

### 2a. Smart Contract Deployment Edge Function

Create `supabase/functions/deploy-sigma-token/index.ts`:
- Uses ethers.js to deploy a standard ERC-20 contract (OpenZeppelin-style) with:
  - Name: "Sigma", Symbol: "SIGMA", 18 decimals
  - Owner-only `mint(address, uint256)` function
  - Standard `transfer`, `balanceOf`, `approve`, `transferFrom`
- Deploys using a **platform deployer wallet** (private key stored as a secret)
- Saves the deployed contract address to a `platform_config` table
- Only callable by admin

### 2b. Mint Tokens Edge Function

Create `supabase/functions/sigma-mint/index.ts`:
- Called when admin verifies skills/trees/gigs
- Takes `{ userId, amount, referenceId, txType }` 
- Looks up user's custodial wallet address
- Calls `contract.mint(walletAddress, amount)` with the deployer key
- Returns real tx hash
- Updates `zlto_transactions` with real hash

### 2c. New Secret Required

- `DEPLOYER_PRIVATE_KEY` — a Base Sepolia testnet wallet private key that will deploy and own the contract. User must generate a wallet, fund it with Sepolia ETH from a faucet, and provide the private key.

### 2d. Database Migration

```sql
CREATE TABLE public.platform_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read config" ON public.platform_config
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'national_admin'::app_role));
```

---

## 3. Custodial Wallet System

### 3a. Database Migration

```sql
CREATE TABLE public.custodial_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.custodial_wallets ENABLE ROW LEVEL SECURITY;

-- Users can only read their own wallet address (not the key)
CREATE POLICY "Users view own wallet" ON public.custodial_wallets
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Only edge functions (service role) insert/update
```

### 3b. Wallet Generation Edge Function

Create `supabase/functions/create-wallet/index.ts`:
- Generates a new random `ethers.Wallet`
- Encrypts private key with AES-256 using a `WALLET_ENCRYPTION_KEY` secret
- Stores in `custodial_wallets` table
- Returns the public address
- Called during onboarding or on first wallet access

### 3c. New Secret Required

- `WALLET_ENCRYPTION_KEY` — a 32-byte hex string for AES encryption of private keys

### 3d. Update Frontend

**`src/lib/blockchain.ts`:**
- Remove `generateWalletFromUserId` 
- Remove `simulateTransaction`
- Update `CHAIN_CONFIG` with real contract address (fetched from `platform_config`)
- Add `getContractAddress()` async function that reads from `platform_config`
- Keep `shortenAddress`, `shortenTxHash`, `createCredentialHash`, `createTreeHash`

**`src/components/OnboardingModal.tsx`:**
- Call `supabase.functions.invoke('create-wallet')` during onboarding
- Store returned address in `profiles.wallet_address`

**`src/pages/Dashboard.tsx`, `ProfilePage.tsx`, `WalletPage.tsx`:**
- Fetch wallet address from `profiles.wallet_address` (already stored) instead of deriving from userId
- Remove `generateWalletFromUserId` imports

**`src/pages/AdminPage.tsx`:**
- Replace `simulateTransaction` calls with `supabase.functions.invoke('sigma-mint', { body: {...} })`
- Use returned real tx hash

**`src/components/admin/SurvivalChecksTab.tsx`:**
- Same: replace `simulateTransaction` with `sigma-mint` edge function call

**`src/pages/SkillsPage.tsx`, `GreenPage.tsx`, `WorkPage.tsx`:**
- Remove `simulateTransaction` calls from user-facing submission flows (minting happens on admin verification, not on submission)
- Keep `createCredentialHash`/`createTreeHash` for local hash generation, but these are informational only

---

## 4. Wire Real Transactions Into Verification Flow

The key architectural change: **tokens are minted on-chain only when an admin verifies** (not when a user submits). This is correct because:
- Users submit proof → gets a DB record with status "pending"
- Admin verifies → edge function mints real SIGMA tokens to user's custodial wallet
- DB balance is updated simultaneously as a cache

**Updated admin verification flow:**
1. Admin clicks "Verify" on skill/tree/gig
2. Frontend calls `supabase.functions.invoke('sigma-mint', { body: { userId, amount, referenceId, txType } })`
3. Edge function: loads deployer key → loads user wallet address → calls `contract.mint(address, amount)` → waits for tx confirmation → returns tx hash
4. Frontend updates `skill_completions`/`tree_submissions`/`gig_applications` with real `tx_hash`
5. Frontend updates `zlto_transactions` and `profiles.zlto_balance`

---

## 5. Files Summary

| Action | File |
|--------|------|
| Create | `supabase/functions/deploy-sigma-token/index.ts` |
| Create | `supabase/functions/sigma-mint/index.ts` |
| Create | `supabase/functions/create-wallet/index.ts` |
| Migration | `platform_config` + `custodial_wallets` tables |
| Edit | `src/lib/blockchain.ts` |
| Edit | `src/pages/Dashboard.tsx` |
| Edit | `src/pages/WalletPage.tsx` |
| Edit | `src/pages/SkillsPage.tsx` |
| Edit | `src/pages/GreenPage.tsx` |
| Edit | `src/pages/WorkPage.tsx` |
| Edit | `src/pages/ProfilePage.tsx` |
| Edit | `src/pages/PublicProfilePage.tsx` |
| Edit | `src/pages/AdminPage.tsx` |
| Edit | `src/components/admin/AdminStats.tsx` |
| Edit | `src/components/admin/CarbonCreditsTab.tsx` |
| Edit | `src/components/admin/ImpactReportsTab.tsx` |
| Edit | `src/components/admin/NationalDashboard.tsx` |
| Edit | `src/components/admin/SurvivalChecksTab.tsx` |
| Edit | `src/components/wallet/YouthInvestmentFund.tsx` |
| Edit | `src/components/OnboardingModal.tsx` |
| Edit | `src/components/RealtimeNotifications.tsx` |
| Edit | `src/index.css` |
| Edit | `tailwind.config.ts` |
| Secret | `DEPLOYER_PRIVATE_KEY` |
| Secret | `WALLET_ENCRYPTION_KEY` |

---

## 6. Prerequisites Before Implementation

Two secrets are required:

1. **`DEPLOYER_PRIVATE_KEY`** — Generate a new wallet (e.g. via MetaMask), fund it with Base Sepolia testnet ETH from [base-sepolia faucet](https://www.alchemy.com/faucets/base-sepolia), and provide the private key.

2. **`WALLET_ENCRYPTION_KEY`** — A random 32-byte hex string (64 chars) for encrypting custodial wallet private keys. Can be generated with `openssl rand -hex 32`.

I will request these secrets during implementation before deploying the edge functions.

