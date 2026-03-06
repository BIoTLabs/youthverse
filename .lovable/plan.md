

# Skills Pillar Assessment

## What's Working
- **5 seed courses** in the database with completion codes, categories, Sigma rewards
- **Youth-facing SkillsPage**: lists courses, lets users submit completion codes, shows credential status (Pending/Verified)
- **Admin verification queue**: approve/reject skill completions with on-chain Sigma minting, balance updates, and transaction logging
- **Admin Course CRUD**: full create/edit/delete for courses
- **Dashboard integration**: verified skill count shown on user dashboard
- **Blockchain**: credential hash generation exists, Sigma minting via edge function on verification
- **Impact reports & national dashboard**: include skill completion data

## Gaps Found

### 1. No course link/URL field
Users see course cards but have no way to navigate to the actual course content. The `courses` table lacks a `url` column.

### 2. Credential hash computed but discarded
In `SkillsPage.tsx` line 44, `createCredentialHash()` is called but the result (`credHash`) is never stored or sent to the database.

### 3. No rejection visibility for users
If an admin rejects a skill submission, the `verified` field stays `false` but there's no `rejected` state. The user sees "Pending" forever with no way to know it was rejected or resubmit.

### 4. Dialog state bug
The "Submit Completion" button sets `selectedCourse` via `onClick`, but the dialog body renders using the `course` variable from the `.map()` loop (correct visually). However, `handleSubmit` uses `selectedCourse` which may be stale if the user opens multiple dialogs quickly. Minor but worth fixing.

### 5. No category filtering or search
With 5+ courses, there's no way for users to filter by category or search by title.

---

## Plan to Complete End-to-End Functionality

### Database Migration
- Add `url` column (text, nullable) to `courses` table
- Add `status` column (text, default `'pending'`) to `skill_completions` table to support `pending`, `verified`, `rejected` states
- Add `credential_hash` column (text, nullable) to `skill_completions` table
- Update the 5 seed courses with placeholder URLs

### File: `src/pages/SkillsPage.tsx`
- Add a "Start Course" button/link that opens `course.url` in a new tab (shown alongside "Submit Completion")
- Store `credHash` in the `credential_hash` field on insert
- Add category filter chips at the top of the Available Courses section
- Show rejected submissions with a "Rejected" badge and allow resubmission
- Fix dialog state: use the `course` variable from the map closure instead of `selectedCourse` for the submit handler

### File: `src/pages/AdminPage.tsx`
- Update `verifySkill` to set `status: 'verified'` or `status: 'rejected'` alongside the existing `verified` boolean (backward compatible)

### File: `src/components/admin/CourseManagementTab.tsx`
- Add `url` field to the course form (create/edit dialog)

### Summary of Changes
| File | Change |
|------|--------|
| Migration | Add `url` to courses, add `status` + `credential_hash` to skill_completions |
| `SkillsPage.tsx` | Course links, credential hash storage, category filter, rejection display, dialog fix |
| `AdminPage.tsx` | Set status field on verify/reject |
| `CourseManagementTab.tsx` | Add URL field to form |

