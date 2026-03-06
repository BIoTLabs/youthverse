

# Admin Page Assessment and Enhancement Plan

## Current State

The admin page is **built and functional** with these capabilities:
- **Stats overview** (users, trees, skills, gigs, Sigma issued)
- **Verification queues** for skills, trees, and gigs (approve/reject with on-chain Sigma minting)
- **Survival checks** for verified trees (alive/dead with bonus minting)
- **Carbon credit batches** (create, view batches with CO2 estimates)
- **National dashboard** (charts for enrollment by state, tree status, Sigma distribution) -- national_admin only
- **Impact reports** (summary stats + CSV export for all tables)

**Auth page** already has both **Sign In** and **Sign Up** tabs with email/password, plus forgot password flow. This is complete.

## Missing Admin Tools

The admin page lacks several key platform management features:

1. **User Management** -- No way to view/search users, assign roles, or deactivate accounts
2. **Course Management** -- No CRUD for courses (the `courses` table exists but has no admin UI)
3. **Green Project Management** -- No CRUD for green projects (table exists, no admin UI)
4. **Marketplace Management** -- No way to manage marketplace items for redemption
5. **Role Management** -- No UI to assign admin/employer/national_admin roles to users
6. **Contract Deployment** -- No admin button to deploy the Sigma ERC-20 contract

## Plan

### 1. Add User Management Tab
- New component `src/components/admin/UserManagementTab.tsx`
- List all profiles with search/filter by state
- Show each user's roles, Sigma balance, wallet address
- Button to assign/remove roles (admin, employer, national_admin) via `user_roles` table
- RLS already allows admins to manage roles

### 2. Add Course Management Tab
- New component `src/components/admin/CourseManagementTab.tsx`
- List all courses with add/edit/delete
- Fields: title, description, category, provider, duration, Sigma reward, completion code
- RLS already allows admin ALL on courses

### 3. Add Green Project Management Tab
- New component `src/components/admin/GreenProjectsTab.tsx`
- List all green projects with add/edit
- Fields: title, description, state, LGA, target trees, Sigma per tree, survival bonus, dates
- RLS already allows admin ALL on green_projects

### 4. Add Marketplace Management Tab
- New component `src/components/admin/MarketplaceTab.tsx`
- List marketplace items with add/edit/toggle availability
- Fields: title, description, category, Sigma cost, partner, image URL
- RLS already allows admin ALL on marketplace_items

### 5. Add Contract Deploy Button
- Add a button in the admin page header (visible to national_admin) to invoke `deploy-sigma-token` edge function
- Show current contract address from `platform_config` if deployed

### 6. Update AdminPage.tsx Tab Layout
- Add new tabs: Users, Courses, Projects, Marketplace
- Adjust grid columns for the expanded tab list
- Keep existing tabs as-is

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/admin/UserManagementTab.tsx` | User list, role assignment |
| `src/components/admin/CourseManagementTab.tsx` | Course CRUD |
| `src/components/admin/GreenProjectsTab.tsx` | Green project CRUD |
| `src/components/admin/MarketplaceTab.tsx` | Marketplace item CRUD |

### Files to Edit
| File | Change |
|------|--------|
| `src/pages/AdminPage.tsx` | Add 4 new tabs + contract deploy button, import new components |

### No Database Changes Needed
All required tables and RLS policies already exist.

