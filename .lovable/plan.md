

# Fix Remaining ZLTO → Sigma References

The rebranding missed several files. Here are all the remaining `Zlto`/`zlto` references in UI-facing text that need updating:

## Files to Edit

### 1. `src/pages/AuthPage.tsx` (6 occurrences)
- Line 31: `'Zlto Earned'` → `'Sigma Earned'`
- Line 38: `'...Zlto tokens.'` → `'...Sigma tokens.'`
- Line 54: `'...earn Zlto per tree...'` → `'...earn Sigma per tree...'`
- Line 66: `'Accumulate Zlto and redeem...'` → `'Accumulate Sigma and redeem...'`
- Line 79: `'Zlto credited immediately...'` → `'Sigma credited immediately...'`
- Line 160: `'Earn Zlto.'` → `'Earn Sigma.'`
- Line 170: `'...rewarded with Zlto tokens...'` → `'...rewarded with Sigma tokens...'`

### 2. `src/components/OnboardingModal.tsx`
- Check for any remaining `Zlto` text in the modal description/steps

### 3. `src/components/employer/EmployerGigManager.tsx`
- Check for any remaining `Zlto` labels

All DB column references (`zlto_balance`, `zlto_reward`, `zlto_transactions`, etc.) stay unchanged — only user-visible strings are updated.

