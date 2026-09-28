# Vercel migration

This document records Stage 2 history. Follow-up lint, contact, and origin fixes
are recorded in `DEPLOYMENT_AUDIT.md`; use that report and `README.md` for current
validation and setup. Historical lint totals below are not current failures.

Stage 2 starts from commit `6b549811d3410d3d497b286c5d903c9147e1e6b5` on
`migration/vercel`. No push, deployment, Supabase change, or history rewrite is
part of this stage.

## Local setup

Use Node.js 22 (at least 22.12) and npm 12.0.2. Install from the committed npm
lockfile with `npm ci`. Copy `.env.example` to `.env` only if a local `.env` does
not already exist, then supply values privately. Never overwrite an existing
environment file with the empty example.

Run `npm run dev`, `npm run typecheck`, `npm run lint`, and `npm run build`.
The build uses TanStack Start and Nitro's Vercel preset, retaining server-side
rendering, server routes, and the custom error response wrapper.

The public TanStack Vite plugin replaces the speculative `@tanstack/start`
import. Nitro remains at the existing `3.0.260603-beta` release and explicitly
uses the `vercel` preset. `vercel.json` selects TanStack Start, `npm ci`, and
`npm run build`; the old `dist` override is removed. The verified output contains
`.vercel/output/config.json`, static assets, and
`.vercel/output/functions/__server.func` with a streaming `nodejs22.x` handler.
Vercel should build from source on its own Linux builder; generated local output
is ignored and should not be committed or uploaded as a Windows prebuilt bundle.

TanStack Start is pinned to `1.168.59`, React Router to `1.170.40`, Router plugin
to `1.168.41`, and Vite to `7.3.6`. These compatible releases address advisories
found in the baseline dependency set; the lockfile resolves esbuild to `0.28.2`.
Other direct dependencies retain the baseline Bun lockfile's resolved versions.
No new direct runtime dependency was needed: Nitro was already declared.
`@tanstack/start`, `@cloudflare/vite-plugin`, the stale Lovable lock entries, and
the obsolete Bun lockfile are removed. Nitro's universal optional peer metadata
still mentions Wrangler/Miniflare; neither package is installed or required by
the Vercel build.

## Existing source damage recovered

TypeScript revealed six truncated route files in the Stage 1 baseline: `about`,
`contact`, `index`, `live`, `sermons`, and `testimonies`. Commit `4fcdee6` had cut
them off inside JSX. Their missing tails were recovered from `4fcdee6^`, the
complete versions immediately before that change. Five current prefixes matched
those versions exactly after normalizing the authorized import and URL fixes.
The sermons prefix additionally contained an existing regex difference; that
difference was preserved and only its missing tail was appended. No replacement
content, layout, or route was invented.

Misspelled TanStack imports were corrected in the routes and auth middleware.
Existing authentication checks and database code were retained.
The root error boundary accepts the patched Router's `unknown` error type while
retaining the existing display for `Error` objects and safely displaying other
thrown values.

## Environment variables

Configure variables in Vercel Project Settings > Environment Variables for each
intended environment (Production, Preview, Development). Browser variables are
embedded at build time; changing them requires a new build.

| Name                                              | Purpose                                                                     |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`                               | Public Supabase project URL used by the browser                             |
| `VITE_SUPABASE_PUBLISHABLE_KEY`                   | Public publishable/anon key, never a service-role key                       |
| `VITE_BASE_URL`                                   | Actual public website origin, including HTTPS and without a trailing slash  |
| `SUPABASE_URL`                                    | Server Supabase URL                                                         |
| `SUPABASE_PUBLISHABLE_KEY`                        | Server auth middleware's public key                                         |
| `SUPABASE_SERVICE_ROLE_KEY`                       | Only needed if the retained server admin-client module is used; server-only |
| `SUPABASE_PROJECT_ID`, `VITE_SUPABASE_PROJECT_ID` | Existing configuration names; no application reads found                    |

No production domain has been assumed. Set `VITE_BASE_URL` to the chosen Vercel
production URL or future custom domain before deployment. The existing localhost
fallback is for local development only. Use the appropriate origin for preview
builds as well. Do not put privileged credentials in any `VITE_` variable.

## Environment-file history review

The local `.env` is preserved but removed from the Git index. `.env` and `.env.*`
are ignored, with `.env.example` explicitly allowed. The example contains names
and empty assignments only.

The audit examined 152 reachable commits and 130 historical environment-file
snapshots. The committed key values decoded as public Supabase `anon` keys;
project URLs and IDs were also committed. A signature scan of historical diffs
(excluding the old dependency lockfile) found no service-role JWTs, Supabase
secret keys, private keys, GitHub tokens, or AWS access-key IDs. This is a scoped
scan, not a guarantee that every possible credential format is absent. Remote
branches not present locally and external deployment settings were not inspected.

No privileged credential requiring rotation was identified. Public anon keys are
intended for client use and rely on existing authorization/RLS policies. No keys
were rotated and no database/security policies were changed. Removing `.env` from
tracking does not remove its historical versions.

## Assets and platform references

The church logo was copied unchanged from the existing public site's asset URL
into `src/assets/church-logo.jpg` (127,062 bytes). Navbar and footer now import the
local image. Existing remote social images on `gpt-engineer-file-uploads` remain
intact until an independent asset migration can be verified.

## Deployment handoff

After separate approval, import the independent GitHub repository into Vercel
using the TanStack Start framework preset and Node.js 22. Install with `npm ci`
and build with `npm run build`. Do not configure this as a static SPA or add an
index.html catch-all rewrite. Review any dashboard overrides from previous
deployment attempts.

Supabase login, email verification, password recovery, authenticated admin
operations, and live deployment need separate end-to-end verification. Before
testing them on a new origin, review the Supabase Auth site URL and redirect
allowlist with the project owner; this migration does not change those settings.

## Validation results

| Check                              | Result                                                                                                                                                                                                      |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm installation                   | Passed; `package-lock.json` generated from public npm                                                                                                                                                       |
| TypeScript (`npm run typecheck`)   | Passed on the final patched dependencies                                                                                                                                                                    |
| Production build (`npm run build`) | Passed; Vercel Node.js 22 streaming server and static assets generated                                                                                                                                      |
| npm dependency audit               | Zero reported vulnerabilities after compatible TanStack/Vite/esbuild updates                                                                                                                                |
| Lint (`npm run lint`)              | Fails: 7,185 errors and 7 warnings; see baseline details below                                                                                                                                              |
| Local HTTP preview                 | All 11 page routes returned 200 with server-rendered HTML                                                                                                                                                   |
| Sitemap                            | 200, XML content type, nine URL entries                                                                                                                                                                     |
| Unknown route                      | Expected 404                                                                                                                                                                                                |
| Logo                               | Served successfully; bundled bytes match the recovered original                                                                                                                                             |
| Custom server error handling       | Focused checks passed for request/options forwarding, response passthrough, captured errors, unrelated JSON preservation, thrown errors, logging, and branded 500 pages; underlying TanStack handler mocked |
| Git whitespace check               | Passed                                                                                                                                                                                                      |

Final lint diagnostics comprise 7,149 Prettier errors, 35 explicit-`any` errors,
one empty-block error, and seven React refresh warnings. A read-only lint run
against the pre-migration HEAD source (using the same tooling and corresponding
checkout line endings) produced 7,084 errors and seven warnings, including six
parse errors from the truncated pages. Restoring complete historical pages makes
their previously unreachable formatting and typing diagnostics visible. No lint
rules were disabled; only generated build directories were added to the ignore
list. Broad application formatting/type cleanup remains separate work.

Build warnings include the existing large client bundle and third-party
`use client`/unused import notices. npm 12 blocked optional dependency install
scripts; the selected esbuild platform package nevertheless built successfully.
No install-script bypass was needed.

No browser connection was available. Browser hydration, visual interaction,
Supabase authentication, email verification, password recovery, live database
operations, and deployment were not verified. Serving the admin and reset pages
successfully does not establish that those authenticated workflows work.

No installed package or lockfile download requires Lovable's registry or a
Cloudflare runtime. The two remote social-image references in `__root.tsx` remain
intentionally preserved. Documentation describes historical platform references;
the old `.lovable` configuration and `/__l5e` logo metadata are removed.

## Changed files

- Environment/tooling: `.gitignore`, `.prettierignore`, `.env.example`,
  `package.json`, `package-lock.json`, `eslint.config.js`, `vite.config.ts`,
  `vercel.json`, and this report. `.env` is untracked, not deleted locally.
- Server: `src/server.ts`, `src/lib/error-capture.ts`.
- Supabase integration: import corrections in `auth-middleware.ts`, a neutral
  configuration message in `client.server.ts`, and a comment cleanup in
  `previewAuthStorage.ts`. No authentication behavior was removed.
- Routes: `__root.tsx`, `about.tsx`, `blog.tsx`, `contact.tsx`, `events.tsx`,
  `gallery.tsx`, `index.tsx`, `live.tsx`, `sermons.tsx`, `sitemap[.]xml.ts`, and
  `testimonies.tsx`; the generated route tree may be rewritten by TanStack.
- Assets: added `src/assets/church-logo.jpg`; updated the image imports in
  `src/components/site/Navbar.tsx` and `Footer.tsx`.
- Removed obsolete files: `bun.lock`, `wrangler.jsonc`, `.lovable/project.json`,
  and `src/assets/church-logo.jpg.asset.json`.

Changes remain uncommitted on `migration/vercel`. Only `.env` removal from the
index is staged. No push, merge, deployment, Lovable disconnection, GitHub
permission change, or production Supabase modification was performed.

## References

- [Vercel's Cloudflare migration guide](https://vercel.com/kb/guide/migrate-a-tanstack-start-app-from-cloudflare-to-vercel)
- [TanStack custom server entry](https://tanstack.com/start/latest/docs/framework/react/guide/server-entry-point)
- [Supabase API key guidance](https://supabase.com/docs/guides/getting-started/api-keys)
