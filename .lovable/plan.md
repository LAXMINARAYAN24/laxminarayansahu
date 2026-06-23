## What you'll get

1. A **circular profile photo** in the hero, with an "Edit" button visible only to you (signed-in admin). Clicking it lets you upload a new photo; everyone else just sees the latest photo.
2. A new **"Affiliations" section** between Work and Timeline, showing NITK, IIT Jodhpur, and Sprit Lab as a clean logo banner with role + dates under each.
3. The same logos appear as **icons inside the matching Timeline entries** (e.g. NITK on the 2023 entry, IITJ on the relevant year, Sprit Lab on the internship entry), replacing the generic category icons there.
4. Stylized monogram **placeholder logos** generated now (NITK, IITJ, Sprit Lab) so the section looks finished immediately. You can swap in real logos later by dropping the files in chat.

## How the editable photo works

- Email/password + Google sign-in enabled on `/auth` (no public signup UI on the homepage — sign-in link lives in the footer).
- A `profiles` table + `user_roles` table with an `admin` role; you become admin on first sign-in via a one-time bootstrap (first user → admin) so we don't hardcode an email.
- A public `profile-photos` storage bucket holds the current photo; the homepage just reads the latest URL — no auth needed to view.
- The "Edit photo" button only renders if `has_role(auth.uid(), 'admin')` is true. Upload goes through an authenticated server function that writes to storage and updates a `site_settings.profile_photo_url` row.
- Non-admins (and logged-out visitors) never see the edit affordance.

## Technical details

- **DB migration**: `profiles`, `user_roles` (enum `app_role`), `site_settings` (single-row key/value), `has_role()` security-definer fn, RLS + GRANTs per project rules. Trigger on first `auth.users` insert grants `admin` if no admin exists yet.
- **Storage**: public bucket `profile-photos`, RLS allowing admin-only writes, public read.
- **Server fns** (`src/lib/profile.functions.ts`): `getProfilePhoto` (public, server publishable client) and `updateProfilePhoto` (admin-gated, uses `requireSupabaseAuth` + role check + service-role upload).
- **UI**:
  - `src/components/ProfileAvatar.tsx` — round avatar with hover "Edit" overlay, file picker, optimistic update.
  - `src/components/Affiliations.tsx` — 3-up logo banner; greyscale → color on hover; each card shows institution, role, dates.
  - Timeline entries get a `logo` field; logo replaces the existing category icon for those years.
- **Logo placeholders**: 3 generated PNGs in `src/assets/` (NITK = navy/gold "N", IITJ = maroon "IITJ" wordmark, Sprit Lab = teal abstract spark mark), used both in Affiliations and Timeline.
- **Auth route**: minimal `/auth` page (email/password + Google) wired through the Lovable Supabase broker; Google provider configured in same turn.

## What I need from you later (not blocking)

- Actual logo files when you have them (drop in chat, I'll swap).
- Confirm role/date copy for each affiliation (I'll start with placeholders: "B.Tech student · 2023–2027" for NITK, "Research Intern · Summer 2026" for IITJ, "ML Intern · 2025" for Sprit Lab — tell me to change any).
