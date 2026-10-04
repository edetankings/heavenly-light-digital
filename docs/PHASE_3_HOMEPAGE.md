# Phase 3 homepage review

Workspace: C:/Users/edetan/Desktop/Rpgm
Branch: deployment

## Current requested result

- Hero images cover the entire section on desktop and mobile.
- Three locally hosted slides: cross at sunrise, Christ in the Wilderness, and clouds. The hero no longer uses gallery data.
- Slides advance every three seconds with a short crossfade. Arrow, counter and pause/play icons are removed. A discreet text-only pause/resume control remains for accessibility. Rotation stops for reduced motion, hidden tabs and keyboard exploration.
- Original church logo remains unchanged.
- Pastor caption sits below the image in normal document flow; the stored name is unchanged.
- White glass navigation is shared across all public routes. Account/admin shells retain their existing isolation.
- Shared footer contains only the original church branding and existing ministry description.
- The remaining homepage stays predominantly white, with blue accents for controls and links.

## Validation

- npm run typecheck: passed.
- ESLint on changed hero, footer, homepage route and browser test: passed.
- Full npm run lint: 534 pre-existing Prettier errors in untouched Supabase previewAuthStorage.ts (9) and types.ts (525).
- npm run build: blocked by missing VITE_BASE_URL. Environment configuration was not changed to bypass this check.
- Browser tests: passed at 320, 390, 768 and 1440px. Verified full-cover imagery, no horizontal overflow, caption below portrait, minimal footer, reduced motion, mobile navigation, three-second rotation, pause/resume and intro/session behavior.
- Direct access to all existing public routes and the admin/recovery routes passed. Public headers are white glass; admin/recovery routes still omit the public shell.
- Browser runtime and hydration errors: zero.
- Screenshots in ignored coverage/phase3 were reviewed on mobile and desktop.

Run `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort`, then `node tests/phase3.browser.mjs` to repeat the isolated browser checks. Tests block Supabase HTTP/WebSocket requests and submissions, use no fake records and verify failure states honestly.

## Review files

Source: src/components/home/HomeHero.tsx, src/components/site/Footer.tsx, src/components/site/Navbar.tsx, src/routes/index.tsx, src/routes/__root.tsx, src/styles.css, src/styles/site.css, src/styles/home.css.

Assets: public/images/home/cross-at-sunrise.jpg, christ-in-the-wilderness.jpg and clouds.jpg. Provenance and permissions: [HOMEPAGE_IMAGE_CREDITS.md](HOMEPAGE_IMAGE_CREDITS.md).

Validation/documentation: tests/phase3.browser.mjs, docs/PHASE_3_HOMEPAGE.md and docs/HOMEPAGE_IMAGE_CREDITS.md.

Navbar and root changes already present from earlier homepage work remain preserved. No new dependencies.

## Preserved and outstanding

No changes to Supabase clients, queries, authentication, policies, storage, admin sections, credentials or deployment configuration. The gallery itself is preserved; only its use as a hero slide was removed. Church contact information remains on its existing pages and homepage visit section.

.env remains private and ignored, along with node_modules, .vercel and coverage. No commits, staging, pushes or deployments.

Live data, authenticated dashboard operations, sermon playback/downloads and actual submissions still require live verification. Configure the approved public HTTPS VITE_BASE_URL through the owner's environment workflow before rerunning the production build. Unrelated Supabase formatting remains outside this review.
