# Supabase migration workflow

Keep the existing SQL files as historical setup scripts; do not run all of them on every update.

## Existing Supabase project

First confirm the project's schema in the Supabase Dashboard. The dated migrations require the extended schema from `supabase-enhanced.sql`, including `farm_projects`, `farm_investments`, `produce_listings`, `produce_orders`, `labor_services`, and `labor_contracts`.

If those tables are missing, run `supabase-enhanced.sql` once after the base schema. It uses `CREATE TABLE IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS`, but review its policies and test the resulting permissions before enabling the related features. The legacy `farms`, `investments`, `market_items`, and `orders` tables are not renamed or copied into the newer campaign and marketplace tables by this script; existing records in those legacy tables remain separate.

After the required base and enhanced schemas exist, apply each unapplied migration in this folder through the Supabase SQL Editor, in filename order:

1. `20261025_farm_campaign_foundation.sql`
2. `20261025_farm_reviewer_workflow.sql`
3. `20261025_social_community_actions.sql`
4. `20261026_marketplace_workflows.sql`
5. `20261026_post_profile_actions.sql`
6. `20261026_profile_usernames.sql`
7. `20261026_social_profile_images.sql`
8. `20261026_marketplace_post_media.sql`

These migrations depend on the existing base and enhanced schemas. If the project does not already have the schema and social functions from `supabase-complete.sql` and `supabase-social-fixes.sql`, establish those prerequisites before applying the enhanced schema and dated migrations. Do not rerun baseline or previously applied setup scripts.

The farm reviewer workflow migration creates reviewer authorization and approval RPCs. The marketplace workflow migration adds the submitted milestone evidence review queue and audit records; approving evidence does not release campaign funds. These migrations do not grant reviewer access to any user by default. Bootstrap the initial reviewer only after verifying their Supabase Auth user UUID, using the Supabase SQL Editor with a project-owner database session:

```sql
INSERT INTO public.farm_reviewer_roles (user_id, role)
VALUES ('<verified-auth-user-uuid>', 'admin');
```

Do not expose reviewer-role writes through the client app or use a public signup field to assign reviewer access. Reviewer assignment and removal are privileged operational actions. The review UI appears only after the authenticated user is assigned a `reviewer` or `admin` role. Review RPCs enforce the same authorization in the database, so hiding the UI is not the security boundary.

## Brand-new Supabase project

1. Run `supabase-complete.sql` for the base schema and policies.
2. Run `supabase-enhanced.sql` if the extended farm, produce, and labor features are needed.
3. Run `supabase-social-fixes.sql` for the app's social RPCs and storage/policy fixes.
4. Run the dated migrations in this folder in filename order:
   1. `20261025_farm_campaign_foundation.sql`
   2. `20261025_farm_reviewer_workflow.sql`
   3. `20261025_social_community_actions.sql`
   4. `20261026_marketplace_workflows.sql`
   5. `20261026_post_profile_actions.sql`
   6. `20261026_profile_usernames.sql`
   7. `20261026_social_profile_images.sql`
   8. `20261026_marketplace_post_media.sql`

The profile usernames migration fills missing usernames with stable account-specific handles, enforces case-insensitive uniqueness and format validation, and exposes the username through `public_profiles`. Apply it before deploying the account username editor.

The social profile images migration adds profile banner and community identity images, a public image bucket with owner-folder upload policies, and updated community image RPCs.

The marketplace/post media migration adds durable post locations, ensures all four app buckets exist (`avatars`, `social-images`, `marketplace-images`, and private `farmer-verification-documents`), applies their size/type limits, and exposes active community members only when the viewer can access that community.

After applying the farm migrations, provision at least one trusted reviewer using the bootstrap procedure above. Before enabling campaign publication, test certification submission and campaign approval as a reviewer, plus denied review access for an ordinary farmer, an investor, and an unauthenticated client.

Before enabling community features, validate community creation, public and private membership requests, owner approval/rejection, member removal, community privacy, post/comment permissions, reactions, saves, reports, and post pinning with the appropriate signed-in and signed-out accounts.

`supabase-schema.sql` is an older overlapping baseline. Do not run it in addition to `supabase-complete.sql`.

## Future changes

Add one new, dated, additive SQL file for each schema update. Never put global `DELETE`, `TRUNCATE`, or account-wipe statements in setup/migration files. Put intentional data reset commands in a separate, clearly labeled reset script and review it before running.
