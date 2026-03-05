

## Gap Analysis: Original Requirements vs. Current Build

### What's Already Built
- Auth (email signup/signin) with profile creation trigger
- Role-based access (youth, admin, national_admin, employer)
- Skills Pillar: course listing, completion code submission, admin verification, Zlto issuance
- Work Pillar: gig listing, application with cover letter, escrow flag, admin verification
- Green Pillar: project listing, geo-tagged photo submission with GPS, admin verification
- Wallet: Zlto balance, transaction history, marketplace redemption with voucher codes
- Admin: verification queues for skills/trees/gigs, aggregate stats
- Profile: name, phone, state/LGA, bio, affiliations
- Blockchain: Base Sepolia config, simulated tx hashes, credential/tree hashing via ethers.js
- Landing page with auth, logo, mobile-first layout

### Missing Features (Grouped by Priority)

---

### Phase 1: Critical Missing Features

**1. Seed Sample Data**
The database has tables but no seed data. The original prompt requires pre-configured courses, gigs, green projects, and marketplace items for demonstration. Insert sample NiYA Academy courses, gigs, green projects (Lagos, Katsina), and marketplace items.

**2. Carbon Credit Aggregation Module**
The `carbon_credit_batches` table exists but there is NO UI or logic to:
- Select batches of verified surviving trees by region/time
- Calculate estimated CO2 sequestration using the `CO2_ESTIMATES` constants
- Generate summary reports for third-party verifiers
- Record carbon credit sales and distribute proceeds to Zlto pool
- Add a "Carbon Credits" tab to AdminPage

**3. Tree Survival Follow-up Verification**
The `survival_checks` JSONB column exists on `tree_submissions` but there is no:
- Admin UI to conduct spot-check verification rounds (random 10% sampling)
- Bonus Zlto issuance for trees confirmed alive at 6/12 months
- Status progression (submitted → verified → alive/dead)

**4. National-Level Admin Dashboard**
The current AdminPage is a single flat view. Missing:
- Differentiated views for `national_admin` vs `admin` roles
- Geo-mapped impact data across 774 LGAs (use recharts for charts, table for state breakdown)
- Aggregated stats: total youth enrolled by state, trees by survival rate, Zlto flow
- Program-level filtering (NYSC coordinator sees only their state's data)

**5. Employer Role & Gig Management**
Employers cannot currently:
- Post new gigs from the UI (only admin via DB)
- Mark work as completed
- View applicants and manage gig lifecycle (open → in_progress → completed → verified)
- Manage escrow milestones

**6. Password Reset Flow**
No forgot password or `/reset-password` page exists.

---

### Phase 2: Important Enhancements

**7. Onboarding Flow**
After signup, users land on dashboard with empty profile. Need a guided onboarding step:
- Prompt to complete profile (state, LGA, affiliations) before accessing features
- Show a welcome modal or redirect to profile completion

**8. Gig Escrow Milestone Detail**
The `escrow_milestones` JSONB field exists but the UI doesn't show milestone breakdowns or allow milestone-based payment releases.

**9. Youth Investment Fund Integration**
The original prompt mentions connecting Zlto balance + verified activity to a Youth Investment Fund application. Add a section in the Wallet page showing eligibility status and a mock "Apply for Startup Capital" flow.

**10. Reporting & Export**
- Impact reports suitable for UNICEF/donors (PDF-like summary view)
- Audit trail view showing blockchain tx hashes for all verified activities
- Export data as CSV from admin dashboard

**11. Real-time Notifications**
Enable Supabase realtime on `zlto_transactions` and `skill_completions` tables so users see live updates when their submissions are verified.

**12. Mobile Optimization Polish**
- Safe area handling improvements
- Offline-friendly states and loading skeletons
- Image compression before upload for data-light experience

---

### Phase 3: Nice-to-Have

**13. Public Reputation Page** - Shareable profile showing verified credentials
**14. Activity Feed** on dashboard showing recent platform-wide activity
**15. Leaderboard** showing top youth by Zlto earned per state

---

### Implementation Plan (Recommended Order)

Due to message size constraints, I recommend implementing in batches:

**Batch 1** (this session):
1. Seed sample data (courses, gigs, green projects, marketplace items)
2. Password reset flow (`/reset-password` page)
3. Carbon credit aggregation UI in AdminPage
4. Tree survival check UI in AdminPage

**Batch 2** (next session):
5. National dashboard with charts (recharts) and state-level breakdown
6. Employer gig posting & management UI
7. Onboarding flow after signup
8. Escrow milestone detail view

**Batch 3** (polish):
9. Youth Investment Fund mock integration
10. Impact report views and CSV export
11. Realtime notifications
12. Public reputation page

### Database Changes Needed
- No new tables required; existing schema covers all features
- May need a DB function for atomic Zlto balance updates (increment rather than read-then-write race condition)
- Enable realtime on `zlto_transactions` table

### Files to Create/Modify
- **New**: `src/pages/ResetPasswordPage.tsx`, `src/pages/CarbonCreditsPage.tsx` or embed in AdminPage
- **Modify**: `src/pages/AdminPage.tsx` (carbon credits tab, survival checks, national dashboard)
- **Modify**: `src/pages/WorkPage.tsx` (employer gig posting)
- **Modify**: `src/pages/WalletPage.tsx` (Youth Investment Fund section)
- **Modify**: `src/App.tsx` (add reset-password route)
- **Seed data**: Via insert tool for courses, gigs, green_projects, marketplace_items

