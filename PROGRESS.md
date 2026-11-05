# Progress

## Phase 0: Setup

Status: complete.

### Built

- Next.js 16.4.3 App Router project with TypeScript strict, Tailwind CSS 4, ESLint, Prettier, Vitest and Playwright.
- Repository layout for `src/app/(site)`, `src/components`, `src/collections`, `src/lib`, `src/styles`, `tests/unit` and `tests/e2e`.
- Scripts: `lint`, `typecheck`, `test`, `test:e2e`, `build`, `check:placeholders`, `format` and `format:check`.
- Placeholder checker at `scripts/check-placeholders.mjs`.
- GitHub Actions workflow running lint, typecheck, test and build.
- `.env.example` based on section 3 of the specification.
- A minimal root route only. No design system, header, footer or homepage sections yet.

### Assumptions (D1 to D4 not confirmed)

- D1: Payload CMS at `/admin`, per AGENTS.md and the specification default.
- D2: Vercel plus Neon PostgreSQL. Data region not chosen.
- D3: No production domain supplied; `NEXT_PUBLIC_SITE_URL` uses a placeholder example domain.
- D4: No sender address supplied; `EMAIL_FROM` and `ADMISSIONS_EMAIL` remain blank placeholders.
- The canonical specification is treated as `docs/St. Joseph's College Ombaci Website Development Specification.md`. The paths `docs/website-spec.md` in AGENTS.md and `/docs/SPEC.md` in the specification do not exist.
- The application route conflict `/apply` versus `/admissions/apply` is unresolved.

### Verification

- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 1 test file and 2 tests.
- `pnpm build`: pass; routes `/` and `/_not-found`.
- `pnpm check:placeholders`: pass; no placeholders found.
- `pnpm format:check`: pass.
- Playwright browsers are not installed and no e2e tests exist yet, so `pnpm test:e2e` was not run.

### Next

Phase 1: design tokens and shell. Waiting for approval before starting.

## Phase 1: Design system and shell

Status: complete. Waiting for approval before Phase 2.

### Built

- Design tokens from section 4 in `src/styles/tokens.css`: navy, navy-2, yellow, red, green, mist, ink, soft, line, footer, plus type and spacing values. No extra colours.
- Tailwind v4 `@theme inline` mappings in `src/app/globals.css`, square corners, no gradients, no emojis.
- Fonts: Barlow 400/500/600/700 through `next/font/google`; Big Shoulders Display 600 to 900 through `next/font/local`. `adjustFontFallback: false` on the display face.
- Site shell: `Header`, `HeaderNav`, `NoticeBar`, `Footer`, `Breadcrumbs`, `PageHero`.
  - Header matches section 6: crest tile, 26px wordmark, yellow "OMBACI · ARUA CITY", seven primary links, 3px yellow hover rule.
  - Desktop dropdowns open on hover and keyboard focus; Escape closes them.
  - Below 821px the nav becomes a full-width Menu/Close disclosure with child links.
  - Footer uses the reference flex layout, motto, Visit, Contact placeholders and Explore links, with 130px bottom padding.
  - Notice bar is optional, dismissible and hidden when no notice is supplied.
- Base components: `Button`, `Tag`, `SectionLabel`, `SitePhoto`, `Placeholder`, `Card`, `StatCell`, `RowFeature`, `Quote`, `Rule`.
- `/design` route shows every Phase 1 component, uses `PageHero` and `Breadcrumbs`, and is `noindex`.
- `/` is still a minimal shell page; homepage sections remain Phase 2 work.
- Crest optimised from 1254x1254 / about 1.1 MB to 96x96 / about 13 KB at `public/crest.png`; header uses `loading="eager"`.
- Site layout uses `min-h-dvh` and a flex column so the footer sits at the bottom on short pages.
- Dev indicator disabled in `next.config.ts` so screenshots are not covered by the Next.js badge.

### Differences from the reference

- `Big Shoulders Display` is no longer exposed by `next/font/google`; Phase 1 used the newer `Big Shoulders` family. Phase 2 replaced it with the approved family from a local Latin WOFF2 so the headline widths match the reference.
- Phase 1 prompt names `SectionHeader` and `PhotoSlot`, while section 4 names `SectionLabel` and `SitePhoto`. The section 4 names are implemented; `PageHero` covers the section-heading composition and `SitePhoto` covers photo slots.
- `Rule` was added because the Phase 1 prompt requires it, although section 4 does not list it.
- Mobile menu is an interactive disclosure. The static reference file only shows the desktop header.
- Footer wraps at intermediate widths exactly as its reference flex layout does; at 1024px and 640px it becomes a balanced 2 by 2 block.

### Open questions

- D1 to D4 are still unconfirmed: Payload at `/admin`; Vercel plus Neon; production domain; sender address.
- `/apply` versus `/admissions/apply` remains unresolved.
- Test widths are 1440, 1024, 820, 640 and 375 per section 14, although section 1 mentions 360, 768 and 1360.
- WhatsApp green `#0F7F42` is required in section 7 but is not in the section 4 token list. It is not added yet.
- The optional home page News strip needs a content decision in Phase 2.
- No school-supplied photos, phone, email or fees exist yet; visible placeholders are used.

### Verification

- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 1 test file and 2 tests.
- `pnpm build`: pass; `/`, `/_not-found` and `/design` prerendered as static.
- `pnpm test:e2e`: pass, 13 tests. Covers the mobile menu, desktop dropdown, notice dismissal, no horizontal scroll at 1440/1024/820/640/375, and screenshots for `/` and `/design`.
- `pnpm check:placeholders`: pass.
- `pnpm format:check`: pass.
- Screenshots reviewed at all five widths; no horizontal scroll, crest visible, mobile Menu button right-aligned.

### Next

Phase 2: homepage, only after approval.

## Phase 2: Homepage

Status: complete. Waiting for approval before Phase 3.

### Built

- Typed seed content in `src/content/seed.ts` for the hero, panels, numbers, learning rows, sports, staff, honours, Old Boys and admissions band.
- Homepage sections in the section 6 order:
  - `HeroStrip`: headline, body, hover/touch hint and Admissions link.
  - `PanelsHero`: six panels; first panel open by default, hover and keyboard focus expansion, vertical tags, captions, stacked 150px rows at 820px and below.
  - `NumbersStrip`: verified 1943, 1960, 6 and O + A facts, 4 columns on desktop and 2 on mobile.
  - `LearningRows`: three border-topped rows using `RowFeature`; photo and numbered text alternate.
  - `SportsWall`: eight ratio-mixed photos in a CSS-column masonry wall with yellow sport tags.
  - `StaffCarousel`: 260px scroll-snap cards, Previous/Next buttons, and reduced-motion-aware scrolling.
  - `HonoursGrid`: auto-fit cards, verified 2025 results, red year numerals and placeholders for later results.
  - `OldBoysFeature`: featured 4:3 photo, quote, three-person list and join-group button.
  - `ApplyBand`: ID `apply`, 12px yellow top border, one natural heading line that wraps as needed, and `/apply` call to action.
- Big Shoulders Display now uses the local official Latin WOFF2 at `src/fonts/big-shoulders-display-latin.woff2`, weights 600 to 900. This fixed the overly wide headline and panel-tag text from the `next/font/google` family.
- Content wrappers now follow the reference `.wrap`: `max-width: 1320px` including the 40px side padding, so section content is 1240px wide at 1440. The hero keeps the reference's separate 40px shell and 1320px inner width.
- Responsive variants use `max-[821px]` instead of `max-[820px]`, because Tailwind v4 treats arbitrary max-width variants as exclusive; this makes the 820px test width use the reference's `max-width: 820px` rules.
- Panel tags use physical padding so the vertical labels match the reference at 62px wide, and the mobile tags keep the 8px/14px padding.
- Button line-height reduced to 1.2 so buttons are 52px tall like the reference.
- Sports masonry now matches the reference column widths and tile heights after the content-width correction.
- E2E coverage for the homepage headline, numbers, admissions link, panel hover/focus expansion, staff arrows, and the existing shell navigation at 16 tests total.

### Differences from the reference

- Unknown school content is shown through the visible `Placeholder` boxes required by section 6. The reference uses plain bracket text, so home sections are taller where placeholders exist, especially Learning resources, Honours and the Old Boys quote.
- Section vertical padding is 64px at 820px and below per section 4, while the static reference keeps 96px. This makes the 820 and 375 pages shorter than the reference.
- The mobile header uses the section 5 menu disclosure rather than the reference's wrapped static links.
- Staff arrow buttons are visible as required by section 6; the static reference only implies horizontal scrolling.
- The 1981 history is not included.
- The optional home News strip was not added because no content decision was supplied.
- Floating Apply, WhatsApp and OMBACIAN controls remain Phase 3 work.
- `/apply` is used for admissions calls to action; the route conflict is still open.
- The Old Boys group link currently points to `/old-boys` because the public Google Group URL has not been supplied.

### Open questions

- D1 to D4 remain unconfirmed: Payload at `/admin`; Vercel plus Neon; production domain; sender address.
- `/apply` versus `/admissions/apply` must be resolved before Phase 3 links are final.
- Real school photos, staff names, Old Boy details, years and admissions facts are still needed.
- The public Ombaci-OB Google Group URL is still needed.
- The optional home News strip needs a content decision.
- WhatsApp green `#0F7F42` remains outside the section 4 token list.
- Test widths remain 1440, 1024, 820, 640 and 375 per section 14, while section 1 also mentions 360, 768 and 1360.

### Verification

- `pnpm format`: pass.
- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 1 file and 2 tests.
- `pnpm test:e2e`: pass, 16 tests. Covers homepage content, panel expansion, staff arrows, mobile menu, desktop dropdown, notice dismissal and screenshots with no horizontal scroll at all five widths.
- `pnpm build`: pass; `/`, `/_not-found` and `/design` prerendered as static.
- `pnpm check:placeholders`: pass. The checker only looks for literal old placeholder strings; the structured `Placeholder` boxes are intentional and counted manually.
- `pnpm format:check`: pass.
- Screenshots reviewed at 1440, 1024, 820, 640 and 375. All content widths were checked against the reference, and no horizontal scrolling was found.
- Full-page heights are 7172px at 1440, 8242px at 820 and 12288px at 375. Remaining differences from the 7062px, 8517px and 12458px reference are the visible placeholder boxes and the spec-mandated mobile section padding.

### Next

Phase 3: floating actions and assistant, only after approval.

## Phase 3: Floating widgets

Status: complete. Waiting for approval before Phase 4.

### Built

- `FloatingActions` is mounted once in the site layout and on `/design`; it returns nothing on `/admin` and hides Apply Now on `/apply`.
- Apply Now: fixed bottom-left, 24px/14px offsets plus `env(safe-area-inset-bottom)`, yellow pill with navy border and hard shadow, 18px/16px Barlow 800 label, `/apply` link and `apply_click`.
- WhatsApp: fixed bottom-right, reads `NEXT_PUBLIC_WHATSAPP_NUMBER`, sanitizes the number, builds an encoded `wa.me` link with the prefilled admissions message, and does not render when the number is empty. Uses the official glyph, `#0F7F42`, and `whatsapp_click`. Configured as `+256 770 911 635` in `.env.local` and `.env.example`.
- Assistant launcher: navy pill with white border, 40px crest circle, `aria-expanded`/`aria-controls`, toggles the panel and tracks `assistant_open`.
- Assistant panel: dynamically imported and client-only; 370px desktop dialog with 14px launcher gap, 3px border and 6px hard shadow; full-width bottom sheet at 640px and below; header, close button, `role="log"` message list, three suggestions on first open, stub reply after a typing indicator, input with screen-reader label, Send button and the approved source/urgent note.
- Focus moves to the input on open; Escape and the close button close the panel and return focus to the launcher. Page scroll is not locked.
- Conversation is stored only in `sessionStorage`, capped at 30 messages, and restored when the panel reopens in the same tab.
- Pulse, hover lift and typing animations are disabled under `prefers-reduced-motion`.
- Unit test for `buildWhatsAppHref`; five E2E tests for positioning, focus, Escape, close, stub conversation, session restore and the mobile bottom sheet.

### Differences from the reference

- The reference panel is a desktop-only anchored box. The spec's mobile bottom sheet is implemented, so the panel covers the page at 640px and below.
- The reference panel has no close button; one was added as required by section 7.
- The panel footer link falls back to "Contact the school instead" when the WhatsApp environment variable is empty. The school number is now configured, so the WhatsApp link is shown.
- The panel note is the exact section 7 wording. The Phase 7 automated-assistant disclosure is not added yet.
- The launcher and WhatsApp controls are hidden while the mobile panel is open to avoid overlap. The desktop launcher remains visible so it can also toggle the panel closed.
- Apply Now mobile type follows the reference's 16px size while keeping the label and 44px-plus target.

### Open questions

- `/apply` is used for Apply Now per sections 5 and 7. The Phase 3 prompt's `/admissions/apply` remains contradictory and unresolved.
- D1 to D4 remain unconfirmed: Payload at `/admin`; Vercel plus Neon; production domain; sender address.
- The public Ombaci-OB Google Group URL, real photographs, staff names, admissions dates and fees remain unavailable.
- Test widths are still 1440, 1024, 820, 640 and 375 per section 14; a 360px check was added for the floating controls, while section 1 also mentions 768 and 1360.

### Verification

- `pnpm format`: pass.
- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 2 files and 5 tests.
- `pnpm test:e2e`: pass, 21 tests. Adds floating positioning, assistant open/focus/Escape/close, stub reply, session restore and mobile bottom-sheet coverage.
- `pnpm build`: pass; `/`, `/_not-found` and `/design` prerendered as static.
- `pnpm check:placeholders`: pass.
- `pnpm format:check`: pass.
- Screenshots reviewed with the panel closed and open at 1440, 1024, 820, 640, 375 and 360, plus a WhatsApp check at 1440 with the configured number. No horizontal scroll was found; the controls do not overlap at 360. The temporary screenshot test and server were removed.
- E2E re-run with the configured number; the WhatsApp link resolves to `https://wa.me/256770911635?text=...` and keeps `target="_blank"` and `rel="noopener noreferrer"`.

### Next

## Phase 4: CMS and content

Status: complete.

### Built
- Payload CMS at `/admin` with SQLite for development and conditional PostgreSQL for production (`PAYLOAD_DATABASE`, `DATABASE_URI` env vars).
- Homepage data‑driven: `src/lib/home.ts` queries globals + collections, maps to component props, falls back to seed when CMS entries are empty.
- Tailwind CSS migrated from `@theme` to `:root` CSS vars; the `@theme` warning is gone and `pnpm build` passes clean.
- Dynamic `import("@payload-config")` inside `getHomeData()` avoids Next 16 RSC client‑proxy errors.
- Revalidation hooks (`revalidateTag("home","max")` + `revalidatePath("/", "layout")`) attached to every collection & global `afterChange`/`afterDelete`.
- `suppressHydrationWarning` added to `<body>` in `src/app/(frontend)/layout.tsx` to suppress the `data-berrycast-extension` attribute injected by a browser extension.
- All homepage sections (`PanelsHero`, `NumbersStrip`, `LearningRows`, `SportsWall`, `StaffCarousel`, `HonoursGrid`, `OldBoysFeature`, `ApplyBand`) now accept CMS data props and render correctly.
- `pnpm typecheck`, `pnpm lint`, and `pnpm build` all pass under Node 22.

### Verification
- `pnpm typecheck`: pass.
- `pnpm lint`: pass.
- `pnpm build`: pass (Turbopack, no `@theme` warning).
- `GET /` returns **200** and renders all homepage sections (panels, numbers, learning rows, sports wall, staff carousel, honours grid, old‑boys feature, Apply band).
- `/admin` loads, seeded admin login works, basic CRUD/access checks pass (`GET /api/pages → 200`, `GET /api/applications → 403`).
- `pnpm check:placeholders`: pass.
- Manual browser resizing at 1440, 1024, 820, 640, 375 shows no horizontal scroll.

### Next
Phase 5: Resolve the remaining decisions (D1–D4), set up production PostgreSQL/Neon, configure email adapter, implement SEO meta tags, perform an accessibility audit, and prepare the production CI/CD pipeline.

---
## Phase 5: (to be defined)

Status: pending.

### Built
*(pending definition)*

### Verification
*(pending)*

### Next
*(pending)*

---

## Phase A: Remove Payload (spec Section 15)

Status: complete.

The older Phase 4 entry above records the previous Payload implementation; Phase A below supersedes it. The requested branch already existed and was checked out. Its pre-existing worktree was committed first as `759a6b4` (`feat: checkpoint initial Drizzle schema scaffold`).

### What was removed

- Payload CMS packages (already absent from `package.json`), `src/payload.config.ts`, `src/payload-types.ts`, `src/seed.ts`
- `src/app/(payload)` (admin page, API and GraphQL routes, layout, import map)
- `src/collections/` (all 20 collection files plus `access.ts` and `shared.ts`)
- `src/components/admin/Brand.tsx` and `src/components/templates/LayoutBlocks.tsx`
- `src/content/seed.ts` and `src/content/site.ts`; `src/globals/Home*.ts`, `Navigation.ts`, `SiteSettings.ts`
- `src/lib/notices.ts`, `src/lib/payload.ts`, `src/lib/revalidate.ts` (revalidation hooks, admin branding, Payload media glue)
- `withPayload` from `next.config.ts`; Cache Components (`cacheComponents`, `experimental.dynamicIO`, `experimental.ppr`) remain disabled
- `pnpm-lock.yaml` pruned via `pnpm install`

Nothing in the UI layer was touched: all components, styles, fonts, `next/font` setup and the floating widgets (`ApplyNow`, `WhatsApp`, OMBACIAN Assistant) remain as designed in `/reference/f-panels`.

### Temporary replacement (data access)

- `src/content/defaults/home.ts` and `src/content/defaults/site.ts` hold the starting content (moved/rewritten from `src/content/seed.ts` and `src/content/site.ts`).
- `src/lib/home.ts` (`getHomeData`) and `src/lib/content.ts` (`getSiteSettings`, `getNavigation`, `getPage`, `photoFromPageMedia`) now read from those defaults so the public site still renders. `src/lib/navigation.ts` re-exports from `src/content/defaults/site`.
- This is intentional and temporary: the custom admin at `/admin` with the database layer is built in later phases (spec Sections 4 to 7). No admin UI was built in Phase A.

### Verification (all run and passed)

- `pnpm install`: pass with pnpm 12.4.2; lockfile current, no Payload packages remain
- `pnpm lint`: pass
- `pnpm typecheck`: pass
- `pnpm test`: pass, 2 files and 5 tests
- `pnpm build`: pass (Turbopack); `/` (static, revalidate 1m), `/_not-found` and `/design` prerendered; `/[...slug]` dynamic server-rendered on demand
- `pnpm dev`: `GET /` returned 200 on port 3001 (port 3000 was already occupied). Browser title and homepage sections loaded; no console errors, page errors, failed requests or terminal errors.

### Assumptions and notes

- The specification file is `docs/St. Joseph's College Ombaci Website Development Specification.md`. The path `docs/website-spec.md` named in `AGENTS.md` does not exist.
- The default `pnpm` shim prompted to install Node.js 22.23.4 even though that Node version is available. The installed pnpm 12.4.2 command was used directly for install and checks.
- `.env.example` was corrupted in the working tree before the snapshot (it held PowerShell error text). It has been replaced with a clean example; Payload-only variables are gone.
- `pnpm seed` has been removed until the custom admin and database exist. Public pages read `src/content/defaults/` directly in Phase A. This is temporary.
- The initial Drizzle/database and settings-schema scaffold was present in the worktree and was included in the requested initial commit. Only type-check fixes needed for the Phase A build were made; no admin or seed functionality was added.
- `src/components/ui/RichText.tsx` remains because it is a UI component, but no public page uses it yet. No admin UI was built.
- `src/app/(frontend)/(site)/[...slug]/page.tsx` now calls `getPage`; it returns `notFound()` until page defaults exist.
- `sharp` remains because `next/image` uses it in production. `graphql` and `@swc-node/register` were removed because only Payload needed them.
- The local `.env.local` may still contain old Payload values. It is ignored by git and no longer read by the application.

### Open questions

- None blocking Phase A. Remaining Phase B work (database schema registry, seed and related tests) awaits your go-ahead.

### Next

Phase B: database, schema registry and seed per spec Section 15 — complete.

---

## Phase B: Database, schema registry and seed

Status: complete. Waiting for approval before Phase C.

### Built

- Drizzle ORM with libSQL for local `file:./data/site.db` development and Turso-compatible remote URLs. The ignored `/data/` directory is created when migrations or seeding run.
- Database schema and initial migration for users, settings, pages, generic list items, media, revisions, applications, enquiries and chat logs. JSON columns use Drizzle's JSON mode; timestamps use Unix milliseconds.
- Database reads for Settings, published pages, and published list items, with 60-second revalidation plus `settings`, `pages`, `page:<key>`, `items`, and `collection:<name>` cache tags. Hidden and not-yet-published scheduled items are excluded.
- Typed field helpers and a schema registry, with generated Zod validation for all field types. Settings and Home schemas are defined; only their existing defaults are seeded.
- Idempotent seed script: migrations run first, Settings and Home insert only when missing, and existing edits remain untouched.
- Optional development admin seeding from `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`. The email is normalized, the password is Argon2id hashed, passwords shorter than 12 characters are rejected, and configured credentials are refused outside development and in production.
- Commands: `pnpm db:generate`, `pnpm db:migrate`, and `pnpm seed`. Updated README and `.env.example`.
- Added validator and seed tests, including non-overwrite behavior, production refusal, and password hash verification.

### Differences from the reference

- No visual changes. The public site continues reading from its temporary defaults; switching public components to database content remains a later phase.

### Open questions

- No Phase B blockers. Admin UI, media operations, database-backed public rendering, and editor-driven cache invalidation remain for later phases.
- `pnpm seed` loads `.env.local` by design. CLI verification used `file::memory:` so no local or remote database was modified.

### Verification

- `pnpm install`: pass; dependencies and lockfile current.
- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 4 files and 13 tests.
- `pnpm build`: pass; `/`, `/_not-found`, and `/design` prerendered; `/[...slug]` server-rendered on demand.
- `pnpm seed`: pass against in-memory SQLite; schema migrations and Settings/Home seed completed.
- `pnpm db:migrate`: pass against in-memory SQLite.
- `drizzle-kit check`: pass; migration history is consistent.

### Next

Phase C: admin shell, login, and media library — complete. Phase D requires
approval before starting.

---

## Phase C: Admin shell, login and media library

Status: complete. Waiting for approval before Phase D.

### Built

- Separate `/admin` root layout with `noindex, nofollow`, the school-office sidebar and mobile bottom navigation. Admin styling is square-cornered and independent of the public site design.
- Email/password sign-in using Argon2id and signed, HTTP-only `iron-session` cookies. Sessions expire after eight hours without activity; authenticated admin requests refresh session activity.
- Database-backed rate limiting: five failed sign-ins in a 15-minute window per hashed email/address key. Plain-language login errors and an expired-session notice.
- Three roles with authorization on admin pages, server actions and media API routes:
  - Administrators can manage staff accounts and reset passwords.
  - Editors can manage the media library but cannot access Users.
  - Admissions users see only Applications and Enquiries.
- Dashboard reminders for sample photos and identifiable people without recorded consent.
- Photos and files: local development storage and signed Cloudinary uploads behind `STORAGE_DRIVER`; accepts JPG, PNG and WebP up to 10 MB; verifies image data, resizes to a 2000 px maximum edge, converts to WebP and removes image metadata. Alt text is required; credit, licence, source URL, sample, people and consent fields can be searched or edited. Removal requires confirmation.
- Applications and Enquiries landing pages for the Admissions role. They display database records when present; application intake, status workflows and exports remain in Phase G.
- Isolated Playwright database and seeded test roles. Browser tests cover login, role limits, staff account creation, upload and removal. Admin screenshots and overflow checks cover 1440, 1024, 820, 640 and 375 px.
- Updated `.env.example` and README with session-secret and Cloudinary setup.

### Differences from the reference

- The admin is a new back-office interface described in Section 5, not a redesign of the public F Panels layout. Public components, styles, fonts and floating widgets were preserved.
- Future-phase destinations remain visibly unavailable until implemented. The dashboard's activity content and admissions records are empty until public forms and editing workflows are built.
- Cloudinary was implemented as the production adapter, consistent with the specification's default. No provider credentials or account were configured.

### Open questions

- Production hosting, database location, domain and production Cloudinary account remain unconfigured.
- The specification does not define how to provision the first production Administrator. `pnpm seed` intentionally refuses production credentials; agree a bootstrap method before deployment.
- The initial staff account for local development still needs `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`. Production must use a separate provisioning process once agreed.

### Verification

- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 4 files and 13 tests.
- `pnpm build`: pass; `/admin`, `/admin/login`, `/admin/users`, `/admin/media`, `/admin/applications`, `/admin/enquiries`, and media API routes compile.
- `pnpm test:e2e`: pass, 26 tests. Covers existing public routes plus admin login, user creation, role restrictions, media upload/removal, and no horizontal scroll at all five reference widths. Admin screenshots were reviewed at desktop and mobile sizes.
- `drizzle-kit check`: pass; migration history is consistent.
- Admin screenshots use Playwright's initial caret mode to avoid screenshot tooling changing input styles during hydration. No browser or terminal errors were reported by the final e2e run.

### Next

## Phase D: Generic form engine and TinyMCE

Status: complete.

### Built

- Schema-driven page editors for Home and Settings, including recursive groups, repeatable lists, list reordering, field hints, required labels, character counters, image/link/SEO controls, and preview.
- Draft save and publish actions, revision history with restore-to-draft, last-edited details, view-on-site links, unsaved-change warnings, and browser autosave recovery.
- Shared, self-hosted TinyMCE field with the approved toolbar, clean-paste behavior, site media picker integration, GPL license key, and server-side allow-list sanitization.
- Added sanitizer tests proving scripts, styles, inline event handlers, and iframes are removed.
- Added editor responsiveness checks at 1440, 1024, 820, 640, and 375 px.

### Differences from the reference

- The editor is a separate school-office interface as specified; the approved public F Panels design, fonts, styles, and floating widgets were not redesigned.
- The current Home and Settings schemas do not yet contain a rich-text field, so the TinyMCE toolbar and media picker cannot be exercised through a live content field yet.

### Open questions

- The local development environment has no `SESSION_SECRET`; `/admin/login` displays its setup notice. Isolated Playwright runs use a test-only database and secret and successfully exercise the authenticated editor.
- At Phase D completion, public rendering still used defaults and draft saves did not affect the homepage. Phase E has since connected published Home and Settings data to the public site.
- Production hosting, database location, domain, and media credentials remain undecided as recorded above.

### Verification

- `pnpm install`: pass (dependencies installed for TinyMCE and HTML sanitization).
- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 5 files and 19 tests.
- `pnpm build`: pass; Next.js generated all 13 static pages and compiled the admin and API routes.
- `pnpm test:e2e`: pass, 28 tests. Includes draft editing, list reordering, revision restoration, and responsive overflow checks for the page list, Home editor, and Settings editor at all five reference widths.
- Integrated browser: `/` returned HTTP 200 with the expected title, no console or page errors, and no horizontal overflow at the browser's 635 px viewport. `/admin/login` rendered the expected setup notice because this local environment has no session secret.

### Next

## Phase E: Settings and Home editable

Status: complete. Waiting for approval before Phase F.

### Built

- Expanded Home and Settings schemas and defaults for the homepage sections, navigation, footer, notice bar, WhatsApp, Apply Now, and assistant controls.
- Updated the public Home, shared layout, and floating widgets to read validated published Home and Settings data from SQLite.
- Kept draft saves separate from published content. Publishing revalidates the affected Home or shared public routes.
- Added additive Home default seeding so new default fields are filled without overwriting existing edits.
- Scoped database query cache keys and invalidation tags to a hash of the database URL. This prevents E2E content from leaking into the local development database cache.
- Added Playwright publishing coverage proving edited Home and Settings values appear on public pages.

### Differences from the reference

- Public layout and F Panels styling were preserved. Image slots remain branded placeholders until Phase H sourcing.
- WhatsApp stays hidden until the school supplies a confirmed number; the assistant requires both its Settings toggle and an API key.

### Open questions

- Production database/provider, hosting, domain, media credentials, and the school's confirmed contact details remain undecided.
- The local development environment has no `SESSION_SECRET`, so `/admin/login` shows its setup notice outside isolated Playwright runs.
- The owner selected OpenRouter for the assistant; Phase I implementation and evaluation status are recorded below and in [DECISIONS.md](./DECISIONS.md).

### Verification

- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 5 files and 19 tests.
- `pnpm test:e2e`: pass, 30 tests, including Home and Settings publishing and no horizontal overflow at 1440, 1024, 820, 640, and 375 px.
- `pnpm build`: pass; Next.js generated all 13 static pages and compiled the admin and API routes.
- Integrated browser: `/` returned HTTP 200 with the expected title and headline; no browser console errors or test-only copy appeared. No horizontal overflow at all five reference widths.
- Browser test runs report a non-fatal Next.js image sizing warning for the crest.

## Phase F: Lists and every inner page

Status: complete. Waiting for approval before Phase G.

### Built

- Added typed schemas and verified-facts-only defaults for the Section 8 inner pages and content collections.
- Added shared public templates and routes for information pages, stories, lists, detail pages, the history timeline, and not-found content. Pages include breadcrumbs, metadata, filtering where applicable, and empty states.
- Added collection workflows for timeline milestones, subjects, clubs, and extra pages, alongside the existing News, Notices, Events, People, Study and facilities, Sports, Achievements, Old Boys, Gallery, and Questions screens.
- Added sidebar links for every content list and a mobile "More" menu so the additional screens are reachable from the bottom navigation.
- Added redirect handling when a published item address changes. Fixed encoded seeded IDs in admin edit URLs and SQLite revision pruning.
- Fixed the Tailwind theme mappings so the existing F Panels navy, red, and tint utilities render correctly.
- Isolated each Playwright run's SQLite database and cache namespace. Added browser tests for publishing inner-page edits and restoring the original test data.

### Differences from the reference

- Public layout and F Panels styling remain unchanged; no intentional public design deviations were made.
- Branded "Photo coming soon" placeholders remain until Phase H image sourcing. No unapproved history was added.
- The mobile admin bottom bar keeps its existing five quick links and uses a "More" menu for the remaining screens.

### Open questions

- The school still needs to confirm current admissions requirements, fees, term dates, subject lists, staff appointments and biographies, club activities, facilities access, sports schedules, event details, and Old Boys contact and giving information.
- Privacy, website terms, and accessibility copy remain drafts for school or legal review. Official email, office hours, map pin, and the displayed phone number need confirmation.
- Production database/provider, hosting, domain, and media credentials remain undecided. OpenRouter integration remains Phase I work.

### Verification

- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 5 files and 20 tests.
- `pnpm test:e2e`: pass, 39 tests, including all Section 8 routes, publishing, redirects, role limits, mobile list navigation, and responsive checks.
- `pnpm build`: pass; Next.js generated 13 static pages and compiled the admin and API routes.
- `pnpm dev`: ready; `/` and `/about/history` loaded in the integrated browser with no browser errors. No horizontal overflow at 1440, 1024, 820, 640, or 375 px.
- Non-fatal browser warnings remain for crest image sizing and preloaded fonts.

### Page, admin location, and remaining placeholders

Content photo slots use branded placeholders pending Phase H. Site-wide settings still contain confirmation markers for the official email, office hours, map pin, and phone number.

| Public page | Admin location | Remaining placeholder or review |
|---|---|---|
| `/` | `/admin/pages/home` | Application dates and requirements. |
| `/about` | `/admin/pages/about` | Current subjects, facility and boarding arrangements, approved ethos, map distance, and contact confirmation. |
| `/about/history` | `/admin/pages/history`; milestones at `/admin/timeline` | Additional approved history and dates. |
| `/about/leadership` | `/admin/pages/leadership`; people at `/admin/people` | Current headmaster, approved message, and leadership biographies. |
| `/admissions` | `/admin/pages/admissions` | Current application documents, deadlines, review steps, and response times. |
| `/admissions/requirements` | `/admin/pages/requirements` | Entry criteria, required results, boarding items, and phone confirmation. |
| `/admissions/fees` | `/admin/pages/fees` | No approved fee schedule or charges supplied. |
| `/admissions/term-dates` | `/admin/pages/term-dates` | Current term dates and school calendar. |
| `/admissions/faqs` | `/admin/pages/faqs`; questions at `/admin/faqs` | Answers about fees, dates, subjects, and contact details need current confirmation. |
| `/apply` | `/admin/pages/apply` | Application details and dates; consent wording requires school approval. |
| `/academics` | `/admin/pages/academics`; subjects at `/admin/subjects`; facilities at `/admin/facilities` | Current subject options and facility access, equipment, and opening times. |
| `/academics/o-level` | `/admin/pages/o-level`; subjects at `/admin/subjects` | Current O-level subject list. |
| `/academics/a-level` | `/admin/pages/a-level`; subjects at `/admin/subjects` | Current A-level subjects and combinations. |
| `/academics/study-resources` | `/admin/pages/study-resources`; entries at `/admin/facilities` | Facility equipment, access, and opening times. |
| `/student-life` | `/admin/pages/student-life`; clubs at `/admin/clubs` | Boarding routines, faith activities, clubs, sports schedules, and magazine details. |
| `/student-life/boarding` | `/admin/pages/boarding` | Arrival, supplies, routines, visiting, health support, and family contacts. |
| `/student-life/clubs` | `/admin/pages/clubs`; entries at `/admin/clubs` | Current clubs and activities. |
| `/sports` | `/admin/pages/sports`; entries at `/admin/sports` | Current teams, training times, facilities, and competition details. |
| `/staff` | `/admin/pages/staff`; people at `/admin/people` | Current staff profiles, appointments, and required photo consent. |
| `/achievements` | `/admin/pages/achievements`; entries at `/admin/achievements` | Official citations and approved details for recorded 2025 results. |
| `/old-boys` | `/admin/pages/old-boys`; entries at `/admin/old-boys` | Current group link, contact person, annual dinner details, and giving priorities. |
| `/old-boys/profiles` | `/admin/pages/old-boys-profiles`; entries at `/admin/old-boys` | No approved profiles supplied. |
| `/news` | `/admin/pages/news`; entries at `/admin/news` | Seeded science items are hidden drafts; publication dates, sources, and approved copy are pending. |
| `/notices` | `/admin/pages/notices`; entries at `/admin/notices` | Seeded example notice is hidden and must be replaced before publication. |
| `/events` | `/admin/pages/events`; entries at `/admin/events` | St. Joseph's Day year and school event details. |
| `/gallery` | `/admin/pages/gallery`; albums at `/admin/gallery` | No approved photos or albums; sample album is hidden pending photos and consent. |
| `/contact` | `/admin/pages/contact` | Contact form availability and response expectations. |
| `/privacy` | `/admin/pages/privacy` | Draft requires legal review and confirmed data-controller, contact, and privacy details. |
| `/terms` | `/admin/pages/terms` | Draft requires legal review and approved ownership and contact wording. |
| `/accessibility` | `/admin/pages/accessibility` | School-approved statement, contact, and feedback process. |
| Not found (404) | `/admin/pages/not-found` | No content placeholder; helpful links are editable. |
| Extra-page entries | `/admin/extra-pages` | No extra pages seeded; add only when approved. |

### Next

Phase G: Applications and enquiries — complete below.

## Phase G: Applications and enquiries

Status: complete. Waiting for approval before Phase H.

### Built

- Public application wizard with session draft recovery, required-field and entry-class validation, optional document uploads, consent confirmation, Turnstile verification, and a submission confirmation.
- Public contact enquiry form with validation, Turnstile verification, and confirmation.
- Application and enquiry records, Admissions/Admin review screens, status changes with history, and CSV exports.
- Email receipts and school notifications through Resend.
- Private application document storage outside `public/`, PDF/JPG/PNG signature validation, per-file and total upload limits, and short-lived signed download links restricted to authenticated Admissions/Admin staff.
- Hashed-IP rate limits, same-origin checks, and settings-based application closure.
- Content Security Policy allowances for Cloudflare Turnstile.
- Responsive Admissions admin styling consistent with the existing square-corner design and tokens. No intentional public design changes.

### Open questions

- The application fields, required documents, deadlines, eligibility criteria, retention period, and consent/privacy wording need school confirmation and legal review. No dates, fees, or entry criteria were invented.
- Production must provide `APPLICATION_PRIVATE_STORAGE_DIR` on a persistent private volume; development uses local private storage.
- Configure and verify the production email sender and delivery settings before accepting live submissions.

### Verification

- `pnpm db:migrate`: pass; development SQLite migration applied.
- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 24 tests.
- `pnpm build`: pass.
- `pnpm test:e2e`: pass, 44 tests, including application/contact submissions, Admissions access and review, closed applications, public routes, and responsive checks.
- Playwright ran the development server and checked relevant pages at 1440, 1024, 820, 640, and 375 px with no horizontal overflow. The browser/terminal showed a non-blocking Next.js image-dimension warning for the existing crest; no application errors were reported.

## Phase H: Images

Status: complete.

### Built

- Added ten licensed Pexels sample images for generic facilities, student-life atmosphere, and sports. No school-supplied photographs were available; all samples remain flagged for replacement.
- Added alt text, photographer, source URL, licence, stable media IDs, people flags, and centered focal points. Samples with people are not used for named staff, Old Boys, or achievements.
- Connected sample images to the Home panels, learning rows and sports wall, Academics and Student life pages, and the facilities collection.
- Updated seeding to store WebP files through the configured media adapter, resolve sample references to stored URLs, preserve existing editor content, and keep sample media dimensions current. Image encoding selects progressively smaller settings so every imported sample stays below 300 KB.
- Listed all sample photos and credits in the Dashboard's Needs attention section.
- Added `pnpm check:content` to report sample photos and remaining confirmation markers.
- Added image attribution records in `docs/IMAGE-CREDITS.md`.

### Differences from the reference

- Actual school photographs were not available. Generic licensed samples are visibly marked as samples in the media library and Dashboard; the site still needs school-approved images before launch.
- Every seeded image slot now uses a licensed local sample and is labelled as such. Non-person setting photos are used where a stock portrait could imply an unverified person or event.

### Open questions

- The school should provide approved photos and any required permissions or consent records to replace samples.
- The school should approve or replace the clearly labelled sample copy and photos before launch, especially examples about subjects, fees, dates, contact details, and legal wording.

### Verification

- `pnpm seed`: pass; development database migrated and seeded, existing admin credentials left unchanged.
- `pnpm check:content`: currently passes with 10 sample photos, 0 confirmation markers, and 0 unfilled photo slots.
- Sample image files: pass; all 10 generated WebP files are below 300 KB, largest 282 KB.
- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 24 tests.
- `pnpm build`: pass.
- `pnpm test:e2e`: pass, 44 tests, including public image loading, Dashboard visibility, and the five required responsive widths.
- Browser check: the homepage loaded at 1440, 1024, 820, 640, and 375 px with no horizontal scrolling or browser errors. The development server logged a non-blocking existing crest image-dimension warning.

## Phase I: OMBACIAN Assistant

Status: implementation and live model evaluation complete.

### Built

- Replaced the simulated assistant with a server-only OpenRouter streaming route and a responsive, keyboard-accessible chat panel. Conversation history stays in the browser's session storage.
- Kept the assistant launcher visible when its security setup is incomplete; it shows a setup notice and disables chat until Turnstile is configured. The WhatsApp action uses the number supplied by the owner.
- Compiled assistant knowledge from allowlisted published pages, approved FAQs, facilities, sports, notices, and safe school settings. The server rebuilds it for each request so newly published content is picked up without exposing private application or people records. The compiler is `src/lib/chat/knowledge.ts`; there is no separate model-training document.
- Added bounded request validation, same-origin checks, Turnstile verification with a signed HTTP-only cookie, per-IP rate limiting (20 messages per 10 minutes), the owner-confirmed global daily cap (1,000 messages per UTC day), anonymous 30-day question logging, and the Dashboard's unanswered-question list.
- Added a 30-case assistant evaluation dataset (15 answerable, 8 unanswerable, 7 adversarial) and an optional OpenRouter-backed script. CI runs it when `OPENROUTER_API_KEY` is configured; otherwise it reports a clear skip.
- Accepted the owner's existing `OPEN_ROUTER_API_KEY` environment variable as an alias for `OPENROUTER_API_KEY`; the key remains server-side and was never printed.
- Redesigned the launcher as a speech-bubble assistant icon that expands on hover and keyboard focus; the label stays visible on touch widths and while the panel is open.
- Replaced remaining public confirmation markers and empty seeded image slots with clearly labelled editable sample copy and licensed local images, including illustrative O-level and A-level subject examples. The sample text does not claim these subjects are confirmed offerings.
- Prevented successful page-editor submissions from dispatching a native reset into TinyMCE and added browser coverage for publishing content without page errors.
- Kept provider credentials server-side and documented the OpenRouter configuration. No new dependency was needed.

### Differences from the reference

- The owner requested an assistant-icon launcher that expands on hover; it replaces the reference's always-expanded navy pill while retaining the reference colours and square-corner styling.
- OpenRouter is used instead of the specification's Anthropic provider, following the owner's earlier instruction.

### Open questions

- Turnstile is not configured in the local environment, so chat remains disabled behind the visible setup notice until the school configures the security keys. Verification was not bypassed.
- Configure the key as a GitHub Actions secret if the live evaluation should run in CI. Do not put the key in source control or chat.
- The school should replace sample photos and approve sample content before launch.

### Verification

- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 12 files and 34 tests.
- `pnpm build`: pass; Next.js compiled the public, admin, and API routes.
- `pnpm test:e2e`: pass, 48 tests, including assistant behavior, sample subjects, admin publishing, and public routes.
- Responsive browser tests: pass at 1440, 1024, 820, 640, and 375 px with no horizontal overflow; Playwright screenshots were captured for Home and the design page.
- `pnpm check:content`: pass; 10 licensed sample photos, 0 confirmation markers, and 0 unfilled image slots.
- `pnpm eval:chat`: pass, 30/30 cases (100%) against the live OpenRouter model. The first run exposed the missing school motto in compiled knowledge; the compiler now includes it from published Settings and the full evaluation passed on rerun.
- The content-edit browser test reported no page errors after the TinyMCE reset fix. Playwright still logged non-blocking Next.js image sizing and above-the-fold loading warnings.
- Repository-wide `pnpm format:check` reports formatting differences in 78 files; the files changed in the final verification pass pass the targeted Prettier check.

### Next

Phase J is approved and in progress; performance budgets remain unresolved.

## Project-wide phase review — 2026-11-02

- Reviewed the completed phase records against the Phase A–K prompts and the acceptance checklist. Phases 0–3 and A–I have their implementation and verification recorded. The old Payload-based Phase 4 and pending Phase 5 entries above are historical; Phase A supersedes them.
- No unfinished Phase A–I code task was found that could be completed without school or production decisions. Remaining dependencies include production hosting/database/storage, the production domain and email sender, confirmed school details and images, and legal approval of privacy and admissions wording.
- Corrected the stale specification path in `AGENTS.md` and in the specification's own instructions. The canonical file is `docs/St. Joseph's College Ombaci Website Development Specification.md`.
- Phase D's editor now has rich-text fields in the later collection schemas; this resolves its earlier note that TinyMCE could not yet be exercised through content.
- Configuration presence was checked without displaying secret values: local `SESSION_SECRET`, `OPEN_ROUTER_API_KEY`, and `NEXT_PUBLIC_SITE_URL` are set; Turnstile and email credentials and a Plausible domain are not. Live chat/form verification therefore still needs Turnstile configuration.
- Phase K remains unstarted. It depends on finishing Phase J and owner-supplied launch decisions and approvals.

## Phase J: SEO, performance, accessibility and security

Status: incomplete. SEO, accessibility and security checks pass; performance budgets do not.

### Built

- Set up the Alicai Paul Neon organization and project `st-josephs-college-ombaci` in AWS US East (N. Virginia). The repository's ignored `.neon` context points to the isolated `dev` branch; the default `main` branch remains untouched.
- The app uses the pooled Neon `DATABASE_URL` from ignored `.env.local` at runtime and the direct `DATABASE_URL_UNPOOLED` for migrations. `.env.neon` keeps the default-branch connection values separate. Local development and isolated E2E tests use PGlite. No credentials are recorded in repository files.
- Migrated the PostgreSQL schema and public defaults to Neon `dev`. Verified 30 settings, 31 pages, and 40 list items; applications, application files, enquiries, and chat logs are empty. One development user exists. No private records from the legacy SQLite database were transferred; that database remains untouched.
- Fixed PGlite JSONB scalar parsing and shared the database instance across Next.js route bundles so API writes are visible in admin reads. The settings query reads JSONB text before parsing, preserving numeric-looking phone numbers across database drivers.
- The Neon migration and runtime changes pass `pnpm lint`, `pnpm typecheck`, `pnpm test` (40 tests), `pnpm build`, and `pnpm test:e2e` (59 tests). A development-server smoke test against the configured Neon branch returned HTTP 200 for `/` and `/apply`.
- Route metadata with canonical, Open Graph and Twitter fields; escaped, nonce-bearing JSON-LD; generated database-aware sitemap and robots files; and database-backed redirects for changed content addresses.
- Nonce-based Content Security Policy, production security headers, admin-only content backup download, local SQLite snapshot/restore script and instructions, production dependency audit, Lighthouse CI and axe browser coverage.
- Reused parsed page/settings validators and collection validators to avoid rebuilding Zod schemas for every request or list item.
- Split application, contact, and detail-page sharing controls into route-specific client bundles so their code is not loaded on unrelated content pages. Deferred forms display an accessible loading message until their event handlers are ready, preventing input from being lost before hydration.
- Kept the first-priority `next/image` behavior after testing explicit image preloading; the preload experiment did not improve the Lighthouse results.
- Corrected development-only CSP styling for Next.js tooling without relaxing the production `style-src-elem` policy.
- Made the multi-route accessibility scan wait for document parsing and gave it enough time for seven templates. Added a deterministic Turnstile verification stub to the isolated E2E server so admissions tests do not depend on Cloudflare availability.
- Fixed the stale canonical specification path in `AGENTS.md` and the specification.
- Replaced the admissions wizard with a single-page application form grouped by student, academic, guardian, emergency-contact, medical, document, and additional-note sections. The shared schema validates required details on both client and server; drafts persist in the browser, and submissions continue through the existing private upload, confirmation, Admissions review, and CSV export flow. Historical application fields remain visible in staff review and exports.
- Fixed application retry behavior by resetting Turnstile after a rejected request, preserving the server error while the new challenge loads, and clearing consent validation as soon as the applicant checks the box. The browser test now covers a service error followed by a successful retry.
- Added a server-side readiness gate for Turnstile, email delivery, session signing, and production database/private-file configuration. When services are missing, the form explains that submissions are unavailable and links to Contact; the API rejects submissions rather than accepting data without the required workflow.
- Added Home, Media and News to the main navigation, with Media linking to the existing Gallery page. Existing saved navigation receives any missing links without duplicating configured entries; all other menu links remain intact.
- Fixed GitHub Actions' pnpm setup failure by using the exact package-manager version already pinned in `package.json`. CI production-builds against a non-connectable PostgreSQL URL to verify the build does not need a live database, then migrates and seeds PGlite for Lighthouse.
- Made the database-backed sitemap render at request time so Vercel builds do not try to query an uninitialized production schema. Production requires an explicit PostgreSQL `DATABASE_URL`; it no longer silently falls back to an ephemeral local database. Added Vercel environment and database setup guidance.

### Differences from the reference and specification

- The owner selected nonce-based CSP. Next.js consequently renders public routes on demand rather than statically generating their HTML; published database content remains cached and revalidated.
- The owner selected OpenRouter for the assistant in Phase I, replacing the Anthropic provider described in the original specification.
- Application documents remain optional pending school confirmation of document requirements. Applicants' health details and other application fields are processed through the existing private admissions workflow.

### Open questions and blockers

- The latest three-run Lighthouse CI run (2026-11-05) misses the required performance score and 2.5-second LCP budget on every measured route. LCP varied between a home image or heading, an About image, the News introduction, the Contact heading, and the admin login introduction, so there is no single slow LCP asset. Warm requests had a first-byte time around 470 ms, with occasional initial requests around 2.8–2.9 seconds. Sampled traces show 2.5–2.8 seconds of main-thread work, including about 1.1–1.2 seconds of script evaluation; the remaining render delay is not yet isolated. Do not lower or remove the budgets to claim completion.
- The school still needs to confirm application field/document requirements and approve the admissions privacy and retention wording. In the current local database applications are marked open, but this checkout has no Turnstile or email-provider configuration; the form therefore clearly reports that it cannot accept submissions. Production intake also needs an explicitly configured persistent database and private file volume.
- Neon `dev` is migrated and seeded. After the owner's approval on 2026-11-05, the committed schema migrations were applied to `main`; production public defaults are not seeded because durable Cloudinary media storage has not been configured.
- The production Vercel environment values were generated in the ignored root `.env` file. Add its pooled `DATABASE_URL`, `SESSION_SECRET`, and `NEXT_PUBLIC_SITE_URL` to Vercel's Production scope. Preview needs its own `dev` branch pooled URL. Do not copy `.env` or its production credentials into Git.
- Production rollout still needs Vercel environment setup, Cloudinary media storage, production admin provisioning, application-service configuration, and production backup scheduling and restore testing.
- Production domain, analytics domain, email sender, and approved school content/legal wording still require owner or school input.
- A non-fatal Next.js image-dimension warning for the crest remains in browser test output.

### Verification

- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 13 files and 36 tests.
- `pnpm build`: pass; Next.js 16.4.3 compiled all public, admin and API routes. Public pages render dynamically to support the selected nonce CSP.
- `pnpm test:e2e`: pass, 57 tests, including application/contact submissions, deferred form hydration, seven public template/mobile axe checks, admin axe, reduced motion, SEO/security, publishing, and responsive checks.
- Neon migration follow-up: `pnpm lint`, `pnpm typecheck`, `pnpm test` (40 tests), and `pnpm build` pass. The latest full Playwright run passed all 59 tests in 8.5 minutes after fixing PGlite route-bundle sharing and JSONB string parsing; settings, media upload, application review, and enquiry coverage passed. The browser run logged non-fatal Next.js image sizing and LCP-priority warnings.
- Neon `dev` read-only verification: 30 settings, 31 pages, 40 items, 0 applications, 0 application files, 0 enquiries, 0 chat logs, and 1 development user. `neon status` confirmed `dev` is not the default branch. The `/` and `/apply` routes both returned HTTP 200 through `pnpm dev` with no application errors.
- The Node PostgreSQL driver emits a non-fatal SSL-mode deprecation warning for the current connection string; no connection values were printed or changed.
- `pnpm audit --prod`: pass; no known vulnerabilities.
- `pnpm check:content`: pass; 10 sample photos, 0 `[To be confirmed]` markers and 0 unfilled photo slots.
- Responsive browser tests: pass for 1440, 1024, 820, 640 and 375 px with no horizontal overflow.
- Lighthouse was rerun against the production build three times per route after route-specific client-code splitting. The latest medians are:

| Route | Median performance | Median LCP | Median accessibility | Median best practices | Median SEO |
|---|---:|---:|---:|---:|---:|
| `/` | 0.81 | 4.10 s | 1.00 | 1.00 | 1.00 |
| `/about` | 0.82 | 3.33 s | 1.00 | 1.00 | 1.00 |
| `/news` | 0.81 | 3.22 s | 1.00 | 1.00 | 1.00 |
| `/contact` | 0.72 | 3.96 s | 1.00 | 0.96 | 1.00 |
| `/admin/login` | 0.88 | 2.56 s | 1.00 | 0.96 | 0.54 |

- Public CLS was at most 0.001 and page transfer remained under 465 KB. Home JavaScript transfer was about 161 KB (under the 170 KB budget). Admin SEO is intentionally excluded from the Lighthouse assertion matrix because the admin is `noindex`.
- Route-specific splitting reduced JavaScript transfer on ordinary content pages by about 36 KB; the homepage remains within its configured JavaScript budget. Contact loads its form bundle by design.
- Tested preloading only Barlow weight 400 and explicit Next.js image preloading; neither produced a reliable improvement, and both experiments were reverted. Font strategy, image priority behavior, and Lighthouse budgets remain unchanged.
- Tested five-minute fallback cache lifetimes for settings, pages and redirects. Publishing invalidation passed focused browser tests, but Lighthouse showed no consistent improvement; the cache lifetimes were restored to 60 seconds.
- Deferred application/contact forms initially allowed input before their client handlers were ready; they now render an accessible loading status until the form bundle is available. The focused admissions and detail-sharing tests passed, followed by the full 57-test E2E suite.
- Reorganized the admin dashboard around publishing totals, recent activity, clearly grouped attention counts, and prominent quick actions. Visitor reports are identified as unavailable because no reporting store is connected.
- Replaced the admin sidebar text mark with the school crest and changed TinyMCE's sliding toolbar to a wrapping toolbar so configured tools remain visible.
- Added browser coverage for the visible crest, fetchable favicon, dashboard overview, and TinyMCE's complete configured toolbar and local script.
- Post-upload-layout verification: lint, typecheck, unit tests (40), production build, and the full Playwright suite (59) pass. Focused admissions browser coverage also passes the successful submission/retry flow and confirms application/contact layouts have no horizontal overflow at 1440, 1024, 820, 640, and 375 px. A pre-existing Next.js image-dimension warning remains on crest rendering.

### Next

Continue Phase J performance investigation and optimization, then rerun Lighthouse CI. Phase K remains unstarted; do not start it until Phase J's applicable budgets pass or the owner explicitly revises the requirements.
