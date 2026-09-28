# Deployment readiness audit - follow-up fixes

Branch: `migration/vercel`. No commit, push, merge, deployment, production SQL,
Auth configuration change, or credential change has been performed.

This section records the current fixes and supersedes the historical audit below.
The previous migration and user formatting changes remain preserved.

## Current validation

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed, final run |
| `npm run lint` | Passed: zero errors and zero warnings; no rules disabled |
| Offline migration checks | Four passed: origin rejection/normalization, contact validation, unknown-error handling |
| `npm run build` | Passed, final run with a process-only validation origin |
| Missing-origin build | Correctly rejected with a configuration error |
| Local HTTP smoke checks | Twelve page paths and refreshes passed; nine sitemap URLs use the configured origin; unknown/private paths return 404; all 27 static files match local bytes |
| `git diff --check` | Passed |

The actual production origin has not been supplied. Build validation uses
`https://migration-validation.invalid` only in the build process. It is a reserved
non-deployment origin, not church configuration. `.env` is unchanged. Do not deploy
this output: provide the approved origin and rebuild on Vercel's Linux builder.
The initial sandboxed build was blocked by esbuild directory access; the same
local build was permitted outside that restriction. No deployment command ran.

Final output is Build Output API v3 with filesystem routing followed by the
`/__server` fallback. The server function uses `index.mjs`, `nodejs22.x`, and
response streaming. SSR remains enabled. The 22 browser JavaScript files contain
no detected service-role key/secret/private-key signatures, and no private
environment/key files were copied into output. This is a scoped scan, not proof
against every possible secret format. The temporary localhost preview process
tree was stopped after the successful checks.

## Completed fixes

- Replaced all 35 explicit `any` types with generated Supabase row/insert types,
  `Session`, `LucideIcon`, browser API types, inference, and narrowed `unknown`
  errors. A documented generic query-result assertion ties table names to the
  generated row types; public testimony view nullability is handled explicitly.
- Fixed the nine formatting errors and empty logout catch. Device tracking and
  logout now handle returned Supabase errors; tracking cleanup failure does not
  prevent attempting sign-out. No credentials or authorization rules changed.
- Fixed all seven React Refresh warnings by moving download helpers, variant
  functions, and shared contexts/hooks to non-component modules and updating
  every existing consumer. All four extracted variant helpers retain identical
  style strings. No lint rule was disabled or widened.
- Captured gallery/testimony form references before asynchronous work so successful
  submissions can safely reset their original form.
- Public testimony load errors are surfaced instead of silently looking like no
  approved content. Existing realtime/publication limitations remain unverified.
- Contact submission now validates field lengths/email, prevents repeated clicks
  while pending, awaits the proposed Supabase RPC, resets only after success, and
  retains entered data on failure. Its success message promises storage, not email.
- Centralized canonical/sitemap origins. Every build requires `VITE_BASE_URL`;
  development serving alone has a localhost fallback. Builds reject absent,
  non-HTTPS, localhost (including trailing-dot spelling), credential-bearing,
  path/query/fragment values. A trailing slash on an otherwise valid origin is
  normalized. All nine sitemap pages and existing public routes remain.
- Added `README.md`, offline regression checks, and review-only SQL proposals.
  No dependencies, paid services, mock application data, or new dashboard section
  were introduced. Formatting was limited to files changed for these fixes.

## Admin and Supabase security conclusions

All nine admin sections remain: announcements, events, testimonies, pastor,
blog, sermons, gallery, prayer requests, and live-stream settings. The declared
route remains `/church-admin-secure`, preserving `/Church-admin-secure` access
through the existing router. No UI redesign, media deletion, or role change occurred.

The browser sends authenticated requests directly to Supabase. The checked-in
RLS and storage policies are an appropriate server-enforced authorization pattern
for these operations **if the deployed policies match and pass role tests**.
Frontend email/role checks are not the security boundary. The unused
`requireSupabaseAuth` middleware verifies token identity only; wiring it into a
route alone would not prove admin authorization. There are no current privileged
server functions or consumers of the service-role client. No redundant frontend
or identity-only guard was presented as a security fix. Live RLS remains unverified.

The five-device code trims `admin_sessions` bookkeeping rows only. It does not
revoke tokens or enforce five simultaneous sessions. The misleading enforcement
comment was corrected; no session revocation or administrator permission change
was attempted.

The checked-in definitions make `sermon-audio`, `blog-images`, `gallery-images`,
and `pastor-photos` public. This includes sermon recordings, blog covers, gallery
and event images, and pastor photos. `allow_download` is a UI control, not file
confidentiality. Live bucket policies/settings need owner verification.

### Testimony proposal - not applied

`docs/sql/testimonies-public.proposed.sql` keeps the base table admin-only and
exposes only approved public fields through a fixed security-definer function and
an invoker view. No email column or arbitrary query parameter is exposed, and no
public base-table SELECT policy is added. The definer function deliberately needs
a trusted database owner; verify ownership, grants, filtering, and all caller roles.
The proposal avoids granting anonymous execution of the broader `has_role` helper.

The current conflict is that an invoker view honors underlying table authorization,
which is admin-only. See [Supabase views](https://supabase.com/docs/guides/database/views)
and [RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).
The proposal has not been executed or database-tested; no local PostgreSQL tooling
was available. It remains outside migrations and ends with `ROLLBACK`.

### Contact proposal - not applied

Previously, the form only reset itself and showed a toast. It had no delivery call.
`docs/sql/contact-storage.proposed.sql` proposes private `contact_messages` storage,
validated fields, public insert-only access, admin-gated reads/deletes, and a
security-invoker `submit_contact_message` RPC using the existing project/public key.
No service-role key or paid email provider is needed. No email-delivery claim is made.

The frontend is ready for that RPC, but storage will fail safely until an authorized
owner approves and installs it. `client-database.ts` is a local proposed RPC contract,
not regenerated evidence of a live schema. After installation, regenerate types and
reconcile that contract. Initially an owner can monitor messages in Supabase Studio;
no existing admin section is removed or replaced. Decide monitoring ownership,
retention, and rate limiting/CAPTCHA before enabling public intake. The busy button
and constraints are not server-side spam prevention. This SQL also ends in `ROLLBACK`
and has not been executed or database-tested.

## Required manual steps and outstanding tests

1. Supply the approved production/preview HTTPS origin as `VITE_BASE_URL` before
   building. Keep the same Supabase project/public key pairs in the proper Vercel
   environments. Do not add a service-role key to browser variables.
2. Have an authorized owner compare live RLS, view definitions, function grants,
   storage rules, and email-verification settings with the existing migrations.
   Verify anonymous and non-admin users cannot read private prayer/contact data,
   pending testimonies, testimony email, or manage content. Verify admin CRUD.
3. Review both SQL proposals and test them in an approved nonproduction environment.
   Their default rollback and location outside migrations prevent accidental build
   application. Installation requires separate approval and deliberate owner action.
4. Configure the Supabase Auth Site URL and exact redirect allowlist for the future
   origin: `/church-admin-secure` for signup confirmation and `/reset-password` for
   recovery. Review email templates and preview redirect scope. Follow
   [Supabase redirect guidance](https://supabase.com/docs/guides/auth/redirect-urls).
   No account, password, permissions, or Auth setting was changed in this pass.
5. With approved access, test real contact storage/failure, testimony/prayer
   submissions, login/logout, verification/recovery, all nine dashboard sections,
   media playback/downloads, hydration, and mobile/desktop appearance. No live
   submissions or authenticated tests ran; login itself writes tracking records.
6. Verify the final build on an approved Vercel preview. Local Windows build/HTTP
   checks do not prove Vercel/Linux behavior or live Supabase authorization.

## Git protection and recommended commit scope

The local `.env` remains on disk, unchanged, ignored, and absent from the index.
Its existing staged deletion remains the **only staged change**. `.env.example`
contains empty assignments only. Requested dependency/build/log/private-file
patterns are ignored; no tracked private/generated files were found. The earlier
scoped secret-history findings below remain historical, not a fresh exhaustive scan.
No installed Lovable/Cloudflare runtime package exists; manifest and lockfile are
unchanged during these fixes. Existing remote social-image URLs remain intact.

Current Git inventory: 92 modified tracked files, four unstaged deletions,
21 untracked files, and the one staged `.env` deletion. Most modified-file entries
predate this pass. No file was newly staged, committed, or deleted in these fixes;
the temporary lint diagnostic file created during this pass was removed.

Recommend reviewing the original migration inventory below together with these
follow-up paths; stage explicit reviewed files only:

- `vite.config.ts`; `src/lib/site-origin.ts`, `site-url.ts`; public route metadata
  and `src/routes/sitemap[.]xml.ts`.
- `src/lib/supabase-data.ts`, `error-message.ts`; `src/routes/church-admin-secure.tsx`,
  `live.tsx`, `reset-password.tsx`, `testimonies.tsx`.
- `src/routes/contact.tsx`, `src/lib/contact-submission.ts`,
  `src/integrations/supabase/client.ts`, `client-database.ts`.
- `src/lib/download-file.ts`, `src/components/site/ShareMenu.tsx`, `AudioPlayer.tsx`,
  and `src/routes/gallery.tsx` for the helper import.
- `src/components/ui/{badge,button,toggle,navigation-menu}-variants.ts`,
  `form-context.ts`, `sidebar-context.ts`; the corresponding six component files,
  plus `alert-dialog.tsx`, `calendar.tsx`, `pagination.tsx`, and `toggle-group.tsx`.
- `README.md`, `MIGRATION.md`, `DEPLOYMENT_AUDIT.md`, both `docs/sql/*.proposed.sql`
  files, and `tests/migration.test.mjs`.

No `supabase/migrations/` file changed. Existing unrelated formatting/line-ending
changes were preserved, not swept into a commit. Never commit populated environment
files, credentials, private keys, service-role keys, dependency directories, logs,
or `.vercel/`, `.tanstack/`, `dist/`, `build/`, `coverage/`, `.output/`, `.nitro/`.

Remaining release blockers are the real origin, approved/tested SQL installation
where desired, verified live RLS/Auth, contact monitoring/abuse controls, and browser
workflow tests. Build warnings about bundle size and third-party directives remain;
Nitro is still the previously pinned beta. There is no production sign-off.

---

# Historical baseline audit (before the fixes above)

The following is retained as the original evidence record. Its lint failures,
contact behavior, missing-origin fallback, file counts, and recommendations describe
the earlier audit, not the current implementation. Current findings are above.

# Deployment readiness audit

Project: Risen Power Gospel Ministry. Branch: `migration/vercel`.
Baseline HEAD: `6b549811d3410d3d497b286c5d903c9147e1e6b5`.

The application builds and serves through the Vercel server output, but this is
not a complete production sign-off. Lint still fails, live authorization and
browser workflows remain untested, and the findings below need review.
This report supersedes the old validation totals in `MIGRATION.md`.

During this audit, only `.gitignore` and this report were intentionally changed.
Existing migration and formatting work was preserved. No application feature,
credential, database policy, production record, or authentication setting was
changed. No commit, push, merge, deployment, or Lovable disconnection occurred.

## 1. Build result

`npm run build` passed with Vite 7.3.6, TanStack Start 1.168.59, and Nitro
3.0.260603-beta. `.vercel/output/config.json` uses Build Output API version 3,
serves static files first, and sends remaining requests to `/__server`.
`functions/__server.func/.vc-config.json` identifies `index.mjs`, `nodejs22.x`,
and streaming support. The application remains an SSR application, not a static
SPA. Build warnings concern bundle size and third-party directives/imports.

Local production-preview HTTP checks passed for `/`, `/about`, `/sermons`,
`/gallery`, `/events`, `/testimonies`, `/contact`, `/blog`, `/live`,
`/reset-password`, `/church-admin-secure`, and `/Church-admin-secure`.
Repeated requests with cache bypass returned 200, confirming direct requests
and refreshes work locally. HTML contains server-rendered page content.

The sitemap returned XML with nine public URLs. An unknown route returned 404.
All 27 generated static files served successfully and matched their local bytes,
including the church logo, CSS, and client JavaScript. The
127,062-byte bundled logo exactly matches the local original image. Requests
for `.env`, `.env.production`, `.git/config`, `.vercel/project.json`, and the
server-only Supabase source file returned 404 without displaying their contents.

No live Vercel deployment or Linux build was performed. Vercel should build
from source with Node.js 22 and `npm ci`; do not upload a Windows prebuilt bundle.

## 2. TypeScript result

`npm run typecheck` passed with no diagnostics. The generated route paths match
the original route paths; generated-file ordering changes do not remove routes.

## 3. Lint result

`npm run lint` failed with **45 errors and 7 warnings**:

- 35 `@typescript-eslint/no-explicit-any` errors.
- Nine Prettier errors around the admin session upsert formatting.
- One `no-empty` error in the admin logout catch block.
- Seven `react-refresh/only-export-components` warnings.

The earlier thousands of formatting errors have largely been addressed.
Remaining diagnostics occur in `ShareMenu.tsx`, `supabase-data.ts`,
`church-admin-secure.tsx`, `live.tsx`, `reset-password.tsx`, and `testimonies.tsx`.
No lint rules were disabled and no unrelated refactor was attempted during this
audit. `git diff --check` passed.

## 4. Git status and complete diff review

The branch is `migration/vercel`, and HEAD is unchanged. At audit completion,
Git reports 92 modified working-tree files, four unstaged deletions, five new
files (including this report), and one staged deletion: `.env` from the index.

Of the 92 modified files, 54 have no normalized textual change from HEAD and
only differ in line-ending/working-tree representation. Thirteen meaningful
file changes are formatting-only, including the entire admin dashboard.
The remaining 25 contain the reviewed migration changes. Formatting-normalized
diffs were reviewed in addition to the full file inventory, rather than
treating the large formatting diff as application rewrites.

The six formerly truncated pages were compared with the complete historical
versions used during Stage 2 recovery. Their content remains present. The
existing sermons filename-regex difference was preserved. No unexpected
application/component deletion was found. `supabase/` has no Git changes.

New files: `.env.example`, `MIGRATION.md`, `DEPLOYMENT_AUDIT.md`,
`package-lock.json`, and `src/assets/church-logo.jpg`.

Unstaged deletions: `.lovable/project.json`, `bun.lock`, `wrangler.jsonc`, and
`src/assets/church-logo.jpg.asset.json`. The removed asset metadata is replaced
by the same real logo stored locally; the image itself was not discarded.

No new files were staged during this audit. The `.env` staged deletion was
already present from Stage 2 and must remain a deletion from tracking only.

## 5. Protected and ignored files

Confirmed ignore rules: `.env`, `.env.*`, `!.env.example`, `node_modules/`,
`.vercel/`, `.tanstack/`, `dist/`, `build/`, `coverage/`, and `*.log`.
Existing `.dev.vars`, `.output`, `.nitro`, `*.local`, and editor exclusions
remain. This audit added explicit build/coverage directory exclusions and
normalized the node_modules/dist/TanStack directory patterns.

`git ls-files` contains no environment files, dependency directories, generated
deployment output, logs, or detected private-key files. `.env` remains on disk,
is ignored, and matches its original contents. `.env.example` contains variable
names with empty assignments only. No additional sensitive tracked file needed
untracking. Existing ignored directories include `.vercel/` and `node_modules/`;
the `.tanstack/` directory is also covered by the verified ignore rule.

The reachable history remains 152 commits. Historical `.env` versions contain
public Supabase anon keys, project IDs, and URLs. The prior environment-history
review covered 130 snapshots; a fresh historical-diff signature scan found no
service-role JWTs, Supabase secret keys, private keys, GitHub tokens, or
password-bearing PostgreSQL URLs. Candidate files were also scanned. No
privileged credential requiring rotation was identified. These are scoped
signature checks, not a guarantee covering every possible secret format or
remote branch. No values were printed and no history was rewritten.

## 6. Remaining Lovable references

There are no active Lovable package dependencies, imports, scripts, private
registry downloads, or build configuration requirements. All resolved npm
download URLs in `package-lock.json` use the public npm registry; the root
manifest and lockfile agree. The production build passed without Lovable or
Cloudflare runtime packages. A clean reinstall was not repeated in this audit;
the npm installation succeeded in Stage 2.

`src/routes/__root.tsx` retains two references to the same existing social image
under `gpt-engineer-file-uploads`. They are media URLs, not build dependencies,
and were not deleted. `MIGRATION.md` and this report mention historical platform
details. Nitro's optional peer metadata mentions Wrangler/Miniflare, but neither
is installed or needed for the Vercel build. Git history still contains the old
configuration, intentionally.

## 7. Website and admin dashboard preservation

| Area | Source audit |
| --- | --- |
| Homepage/About | Existing hero, church information, service times, pastor sections, and media sections retained |
| Sermons | Supabase list, audio metadata, play/pause, seeking, mute, downloads, and sharing retained |
| Gallery | Supabase images, responsive grid, lightbox, downloads, and sharing retained |
| Events | Public event display plus admin creation, editing, cover upload, archive, and deletion retained |
| Testimonies | Public approved-view query, submission form, and admin moderation retained; policy concern below |
| Prayer requests | Live-page submission and admin reading/deletion retained |
| Contact | Existing page, address, phone, links, and form retained; form has no delivery backend |
| Additional pages | Blog/devotionals, live stream, password recovery, sitemap, and 404 retained |
| Shared presentation | Navbar/mobile menu, footer, real logo, existing images/video, responsive classes, carousel, and styles retained |

The declared admin route is lowercase `/church-admin-secure`. The requested
`/Church-admin-secure` also returned 200 and refreshed successfully through the
existing router; no path was renamed. Admin/reset pages retain `noindex` metadata.
Unauthenticated server HTML did not contain the private dashboard data.

All nine dashboard areas remain: announcements, events, testimonies, pastor,
blog, sermons, gallery, prayer requests, and live-stream settings. Existing
signup, sign-in, password recovery, logout, device tracking, uploads, archive
controls, moderation, and download controls remain. Formatting-normalized
comparison confirms the dashboard behavior was not rewritten.

`useAuthSession` reads the authenticated user's admin role from `user_roles`.
Dashboard operations use Supabase's public client with the user's session, so
authorization depends on database RLS, not the frontend email check or route
visibility. Checked-in migrations enable RLS on all 11 application tables and
restrict privileged writes to `has_role(auth.uid(), 'admin')`. Prayer reads and
deletes, testimony administration, and storage writes also have role policies.
Admin-session policies require both ownership and admin role. These are verified
source definitions, not confirmation of the currently deployed database state.

The existing server `requireSupabaseAuth` middleware checks bearer-token claims,
but no route/server function imports it. The globally registered auth-attacher
only supplies client bearer headers. It is not a global server authorization
guard. There are no application server functions using the service-role client.

## 8. Supabase integration and findings

The browser and server public URL/key pairs match, and the project ID matches
`supabase/config.toml`. Both configured keys classify as public anon keys. The
service-role key is absent locally and is referenced only by the retained,
currently unused `client.server.ts` module. All 22 generated browser JavaScript
files were checked: no service-role variable, service-role JWT, or Supabase
secret-key signature was found. The generated browser output appropriately
contains public configuration.

Four public storage buckets are defined: `sermon-audio`, `blog-images`,
`gallery-images`, and `pastor-photos`. Upload paths use random UUIDs, and admin
write/delete policies are present in the migrations. Actual deployed bucket
settings, file-size/MIME restrictions, and CORS were not inspected remotely.

Password recovery calls `resetPasswordForEmail`, handles recovery/session
events, calls `updateUser`, and signs out. Signup supplies an email redirect to
the admin route. Whether confirmation mail is required/delivered and whether
the new deployment origin is allowed depends on live Auth settings. No email
was sent, account created, password reset, or credential/permission changed.

Findings requiring review:

| Finding | Evidence and implication |
| --- | --- |
| Public testimony policy conflict | `20260604114319...sql` makes `testimonies_public` a security-invoker view but replaces the underlying SELECT policy with admin-only access. Earlier SQL revokes anon execution of `has_role`. If these definitions match production, ordinary visitors cannot read the intended approved testimonials; anonymous reads can error. The generic hook discards query errors and displays empty data. No policy was changed. |
| Five-device limit is not session revocation | `registerDeviceSession` trims `admin_sessions` rows in the browser. No subsequent authorization check consults those rows, and deleting one does not revoke the user's Supabase token. Treat it as tracking, not a verified security limit. |
| Contact delivery absent | `contact.tsx` only resets the form and displays a success toast. It makes no email/API/database call. This is existing behavior, not a migration regression. |
| Production origin missing | `VITE_BASE_URL` is absent locally; actual sitemap/canonical output contains `http://localhost:5173`. Configure the real intended origin before the deployment build. No domain was assumed. |
| Public download restrictions are UI-only | `allow_download` hides buttons, while the media buckets and URLs remain public. It does not revoke file access. Preserve the existing semantics unless a separate access-control change is approved. |
| Automatic admin assignment needs live Auth review | The existing signup trigger assigns admin based on a configured email. Confirm the intended account and email-verification settings in the live project; the browser allowlist alone is not enforcement. No settings changed. |
| Asynchronous form reset risk | Testimony submission and gallery-save handlers access `e.currentTarget` after awaiting database work. Verify reset behavior in a real browser; live prayer submission already captures the form before awaiting. No live submission was made. |
| Realtime limitations | The blog is explicitly removed from the checked-in realtime publication, but the generic hook still subscribes to it. The testimony hook subscribes to a view. Live refresh behavior requires verification against actual publication settings. |
| Existing presentation mismatches | `AnnouncementBar` remains present but has no active import. The root navigation/footer suppression still checks the obsolete `/portal-rpgm-2026-x9k` prefix. Neither is an authorization control; no UI changes were made. |

The view inference follows [Supabase's documented security-invoker behavior](https://supabase.com/docs/guides/database/postgres/row-level-security).
Public media access follows [Supabase's public-bucket semantics](https://supabase.com/docs/guides/storage/buckets/fundamentals).

## 9. Untested functionality and required owner actions

No browser connection was available. Responsive rendering, hydration, menu and
carousel interaction, real audio playback/seeking/downloads, gallery lightbox,
external media availability, and live-stream embedding remain unverified in a
browser. Source retention and successful SSR/asset delivery are not substitutes
for those tests. No mock data or replacement database was introduced.

Production database policies, storage settings, email verification, recovery,
admin/non-admin authorization, and CRUD/uploads were not exercised. Even admin
login automatically writes `admin_sessions`, so authenticated testing needs
explicit approval for that bookkeeping or an already-approved nonproduction
environment. Do not create a replacement database or modify real content just
to produce a green check.

Before deployment:

1. Review and address the lint failures and application findings above.
2. In the existing Supabase project, have an authorized owner compare the live
   RLS policies, `testimonies_public` definition, function grants, bucket rules,
   and realtime publications with the checked-in migrations. This can start
   with read-only metadata queries/dashboard inspection; do not blindly apply
   or reset migrations. Confirm anonymous/non-admin access cannot read private
   prayer requests or testimony email addresses and cannot manage content.
3. Confirm Auth email verification, site URL, and allowed redirect URLs for the
   exact production/preview origins. Any changes require approval.
4. Supply `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_BASE_URL`,
   `SUPABASE_URL`, and `SUPABASE_PUBLISHABLE_KEY` in the appropriate Vercel
   environments. A service-role key is not needed by the current dashboard;
   if future server code uses one, keep it server-only and never prefix it with
   `VITE_`. Never use it to bypass the existing browser RLS design.
5. With approved access, test admin login/logout, non-admin denial, account
   verification/recovery, all nine dashboard areas, submissions, media, and
   mobile/desktop layouts. Do not claim tests passed merely because pages load.
6. Review an explicit migration diff and obtain approval before committing,
   pushing, connecting a deployment, or deploying.

## 10. Files proposed for the migration commit

These are proposed paths only; nothing was newly staged:

- Configuration/security: `.gitignore`, `.prettierignore`, `eslint.config.js`,
  `package.json`, `package-lock.json`, `.env.example`, `vite.config.ts`,
  `vercel.json`; retain the staged removal of `.env` from tracking.
- Server/integration changes: `src/server.ts`, `src/lib/error-capture.ts`,
  `src/integrations/supabase/auth-middleware.ts`, `client.server.ts`, and
  `previewAuthStorage.ts` (the latter two in the same integration directory).
- Routes: `src/routeTree.gen.ts`, `src/routes/__root.tsx`, `about.tsx`,
  `blog.tsx`, `contact.tsx`, `events.tsx`, `gallery.tsx`, `index.tsx`, `live.tsx`,
  `sermons.tsx`, `sitemap[.]xml.ts`, and `testimonies.tsx`.
- Logo: `src/assets/church-logo.jpg`, `src/components/site/Navbar.tsx`, and
  `src/components/site/Footer.tsx`.
- Reviewed removals: `.lovable/project.json`, `bun.lock`, `wrangler.jsonc`,
  `src/assets/church-logo.jpg.asset.json`.
- Documentation: `MIGRATION.md` and `DEPLOYMENT_AUDIT.md`.

The user's formatting-only changes can be included after review or kept in a
separate commit: `src/components/site/AnnouncementBar.tsx`, `AudioPlayer.tsx`,
`MediaCarousel.tsx`, `Section.tsx`, `ShareMenu.tsx`;
`src/integrations/supabase/auth-attacher.ts`, `client.ts`, `types.ts`;
`src/lib/store.ts`, `supabase-data.ts`; `src/routes/church-admin-secure.tsx`,
`reset-password.tsx`; and `src/styles.css`. Directory shorthand refers to the
preceding directory in each group. The 54 status-only line-ending changes need
no application patch; do not stage indiscriminately to make the status look clean.
No `supabase/` change is proposed.

## 11. Files that must never be committed

Local `.env`/`.env.*` values (except the empty `.env.example`), `.dev.vars`,
private keys/certificates, passwords, service-role or secret API keys,
credential-bearing database URLs, authenticated `.npmrc` settings, database
exports containing private data, or local credential/configuration dumps.
Also exclude `node_modules/`, `.vercel/`, `.tanstack/`, `.output/`, `.nitro/`,
`dist/`, `build/`, `coverage/`, and logs. The already-staged `.env` deletion is
safe to commit; its previous contents must not be re-added.

## 12. Remaining deployment risks

The principal unresolved items are failing lint, the testimony-policy mismatch,
missing contact delivery, the unset public origin, unverified live RLS/Auth
settings, and the device-limit semantics. Existing UI/media workflows still
need browser checks. Nitro remains an explicitly pinned beta release, and local
Windows output is not a live Vercel validation. The two external social-image
references and other existing remote media remain availability dependencies.

The repository is prepared for review, not approved for production deployment.
