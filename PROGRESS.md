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

