# Risen Power Gospel Ministry

The existing church website uses React 19, TypeScript, TanStack Start/Router,
Vite, Tailwind CSS, Supabase, and Nitro's Vercel server preset. It retains SSR,
the real church logo, existing media, and the current website design.

## Local development

Use Node.js 22 (22.12 or later within major 22) and npm 12.0.2.
Run `npm ci`. Copy `.env.example` to `.env` only when no local `.env` exists;
never overwrite an existing environment file. Supply values privately.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run typecheck` | TypeScript validation |
| `npm run lint` | ESLint, including formatting and React Refresh checks |
| `npm run build` | Production SSR build; requires a valid `VITE_BASE_URL` |
| `npm run build:dev` | Development-mode build; still requires `VITE_BASE_URL`, not for deployment |
| `npm run preview` | Serve the generated build locally |
| `node --experimental-strip-types --test tests/migration.test.mjs` | Offline origin and form-validation checks |

On Windows with PowerShell script execution disabled, use `npm.cmd` instead of
`npm`; no execution-policy change is necessary. Format only intentionally edited
files with `npx prettier --write <paths>`; avoid the repository-wide format command
during a focused migration change.

## Environment variables

`.env.example` contains names and empty assignments only. Do not commit populated
environment files, private credentials, logs, dependencies, or deployment output.

| Name | Usage |
| --- | --- |
| `VITE_SUPABASE_URL` | Existing Supabase public project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Existing public publishable/anon key, never a service-role key |
| `VITE_BASE_URL` | Exact website HTTPS origin, no path/query/fragment; trailing slash normalized |
| `SUPABASE_URL` | Server-side connection to the same Supabase project |
| `SUPABASE_PUBLISHABLE_KEY` | Public key for the retained server auth middleware |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional, only for the currently unused server admin module; not needed for the website/dashboard/contact proposal |
| `SUPABASE_PROJECT_ID` | Retained project configuration name |
| `VITE_SUPABASE_PROJECT_ID` | Retained public project configuration name |

All `VITE_` values are browser-visible and embedded at build time. Never put a
private key in them. Production builds fail if the public origin is absent,
uses localhost, contains credentials, or is not HTTPS. Development alone can
use a localhost default. Supply the approved production/preview origin before
building; changing it requires a rebuild. No production domain is assumed.

## Website and administration

Public routes include `/`, `/about`, `/sermons`, `/gallery`, `/events`,
`/testimonies`, `/contact`, `/blog`, `/live`, and `/sitemap.xml`.
Password recovery uses `/reset-password`. The admin route is declared as
`/church-admin-secure`; the existing router also accepts `/Church-admin-secure`.

All nine dashboard sections remain: announcements, events, testimonies, pastor,
blog, sermons, gallery, prayer requests, and live-stream settings. Content,
media uploads, moderation, archive controls, and download controls are retained.

Dashboard requests use the authenticated Supabase client. Database/storage RLS
is the authorization boundary; frontend role checks and an email allowlist are
not sufficient by themselves. The retained `requireSupabaseAuth` middleware
validates identity but is not attached to current routes and does not establish
admin role membership. There are no privileged application server functions.
Verify the live policies rather than treating local SQL as proof of enforcement.

The five-device mechanism retains recent tracking rows only. It does not revoke
older Supabase sessions or enforce a five-session security limit.

## Supabase and pending proposals

Keep the existing project, migrations, Auth configuration, and media buckets.
Do not reset the database or apply migration history blindly.

The checked-in bucket definitions make `sermon-audio`, `blog-images`,
`gallery-images`, and `pastor-photos` public. Sermon audio, blog covers, gallery
and event images, and pastor photos can be fetched by URL. Hiding a download
button does not make a public file private. Admin writes still require RLS.

Review-only SQL is in `docs/sql/`, deliberately outside `supabase/migrations/`:

- `testimonies-public.proposed.sql`: a fixed public projection of approved
  testimony fields while preserving direct-table admin-only access and email
  privacy. Uses a narrowly scoped security-definer function; verify its owner,
  grants, and all three caller roles before approval.
- `contact-storage.proposed.sql`: validated private contact storage and an
  invoker RPC using the existing project. No new paid service or email provider.

Both proposals end with `ROLLBACK`. Neither has been executed. After owner
approval and nonproduction validation, the owner must deliberately install the
approved definitions; do not simply run all SQL files. Regenerate Supabase types
after installation and reconcile the temporary `client-database.ts` RPC contract.

The contact form now waits for the storage RPC before showing success. Until
the proposal is approved and installed, it reports failure and keeps the entered
message; it does not pretend delivery. Successful storage is not email delivery.
Initially, an authorized owner can read stored messages in Supabase Studio.
Decide who monitors submissions, retention, and rate limiting/CAPTCHA before
enabling public intake. Client validation and a busy button are not abuse controls.

## Vercel deployment after approval

Import the independent repository only when authorized. Use Node.js 22,
`npm ci`, `npm run build`, and the existing TanStack Start framework configuration.
Keep Nitro's Vercel preset and server entry. Do not select a static SPA output
directory or add an `index.html` catch-all rewrite. Build on Vercel's Linux
builder; do not upload local Windows output as a prebuilt deployment.

Set the environment variables separately for Production and any approved Preview
environment. Output is `.vercel/output/`, with static assets plus a streaming
Node.js SSR function. This directory must remain ignored.

An authorized Supabase owner must set the future production Site URL and allow
the exact origins/paths used by signup and recovery:

- `<approved HTTPS origin>/church-admin-secure` for signup confirmation.
- `<approved HTTPS origin>/reset-password` for recovery.

Review confirmation email templates and enable the intended email-verification
settings. Preview origins require their own approved redirects. Prefer exact
production URLs; do not authorize arbitrary preview domains. Follow
[Supabase redirect guidance](https://supabase.com/docs/guides/auth/redirect-urls).
No Auth settings, credentials, or permissions have been changed locally.

## Release verification

Run typecheck, lint, build, and the offline checks. Then verify SSR/direct route
access, refreshes, canonical/sitemap origins, static media, and 404 handling on an
approved Vercel preview. Check mobile/desktop appearance, media playback/downloads,
contact/testimony/prayer submissions, login/logout, email verification, recovery,
and all nine dashboard sections with approved access.

Test anonymous, authenticated non-admin, and admin RLS behavior. Real login writes
device-tracking records; live submissions and CRUD change production data and
require explicit approval. No current local build proves live authorization.

See [DEPLOYMENT_AUDIT.md](DEPLOYMENT_AUDIT.md) for current results and remaining
risks, and [MIGRATION.md](MIGRATION.md) for the migration history. Commit, push,
merge, deployment, and production changes remain subject to owner approval.
