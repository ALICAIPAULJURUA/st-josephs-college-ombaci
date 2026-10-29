# St. Joseph's College, Ombaci

Official website for St. Joseph's College, Ombaci, a Catholic boys' boarding school in Arua City, West Nile, Uganda.

The approved visual design is Direction F (Panels), in `reference/f-panels/`. The development specification is `docs/St. Joseph's College Ombaci Website Development Specification.md`.

## Stack

- Next.js App Router with TypeScript strict
- Tailwind CSS 4 with design tokens in `src/styles/tokens.css`
- pnpm
- Payload CMS at `/admin` and PostgreSQL (planned, Phase 4)
- Vitest and Playwright

## Getting started

Requirements: Node.js 20 LTS or newer and pnpm.

```bash
pnpm install
copy .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

## Scripts

| Command                   | Purpose                                 |
| ------------------------- | --------------------------------------- |
| `pnpm dev`                | Start the development server            |
| `pnpm build`              | Production build                        |
| `pnpm start`              | Run the production build                |
| `pnpm lint`               | ESLint                                  |
| `pnpm typecheck`          | TypeScript without emit                 |
| `pnpm test`               | Vitest unit tests                       |
| `pnpm test:e2e`           | Playwright browser tests                |
| `pnpm check:placeholders` | Fail if literal placeholder text exists |
| `pnpm format`             | Format with Prettier                    |
| `pnpm format:check`       | Check formatting                        |

## Project layout

```text
docs/                  Development specification
reference/f-panels/    Approved static design reference
public/                Static assets, including the crest
scripts/               Repository checks
src/app/               App Router routes and layouts
src/components/        Layout, home, floating and UI components
src/content/           Typed seed content used before the CMS
src/lib/               Navigation, environment and shared logic
src/styles/            Design tokens
tests/                 Unit and Playwright tests
```

## Content rules

- Use only school facts supplied in the specification or the CMS.
- Never invent fees, dates, names, phone numbers, emails or statistics.
- Anything unknown must render through `Placeholder` as visible `[Placeholder: ...]` text.
- Do not publish the 1981 history.
- Do not publish a student's name or photo without recorded guardian consent.

## Design reference

The original mockup is plain HTML and CSS. Open `reference/f-panels/index.html` in a browser. Its photo blocks are labelled placeholders; real photographs come through `SitePhoto`. The reference crest is low resolution, so request a vector copy from the school.

## Environment

Copy `.env.example` to `.env.local` and fill in the values you need. Never commit `.env.local` or any secret. `ANTHROPIC_API_KEY` is server-side only.

## Status

Phases 1 to 3 are complete. The homepage and floating controls are built and verified at 1440, 1024, 820, 640 and 375. The assistant panel is a UI stub until Phase 7. The school WhatsApp number is configured through `NEXT_PUBLIC_WHATSAPP_NUMBER`. See `PROGRESS.md` for verification results, reference differences and open decisions.
