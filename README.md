# St. Joseph's College, Ombaci

Official website for St. Joseph's College, Ombaci, a Catholic boys' boarding school in Arua City, West Nile, Uganda.

The approved visual design is Direction F (Panels), in `reference/f-panels/`. The development specification is `docs/St. Joseph's College Ombaci Website Development Specification.md`.

## Stack

- Next.js App Router with TypeScript strict
- Tailwind CSS 4 with design tokens in `src/styles/tokens.css`
- pnpm
- A custom admin at `/admin` with role-based access and a photo library
- Vitest and Playwright

## Getting started

Requirements: Node.js 22.23.4 or newer in the 22.x line, or Node.js 24.22.1 or
newer, plus pnpm 12.4.2.

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
| `pnpm db:generate`        | Generate a Drizzle migration            |
| `pnpm db:migrate`         | Apply database migrations               |
| `pnpm seed`               | Seed Settings and Home defaults         |
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
drizzle/               Database migrations
scripts/               Seed, migration and repository checks
src/app/               App Router routes and layouts
src/components/        Layout, home, floating and UI components
src/content/defaults/  Typed starting content
src/content/schemas/   Typed page schemas and validators
src/db/                libSQL database schema, client and queries
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

## Local database

The development database is SQLite and defaults to `file:./data/site.db`. Production database selection remains open for owner guidance. Run `pnpm seed` to
apply migrations and add the initial Settings and Home content without
overwriting records that already exist. To create a local administrator, set
`SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `.env.local`; the password must
be at least 12 characters. Seed administrator credentials are refused outside
development and are never created in production.

## Admin and photo storage

Set `SESSION_SECRET` to a random value of at least 32 characters before signing
in. Generate one with
`node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`.
The development administrator created by `pnpm seed` can then sign in at
`/admin`. Administrators can add staff accounts and reset passwords there.
TinyMCE is self-hosted for rich-text editing; its local assets are copied into
`public/tinymce` during installation.

Photo storage defaults to local files in `public/uploads` for development. For
Cloudinary, set `STORAGE_DRIVER=cloudinary` and provide
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
Do not use local storage on hosts with read-only filesystems.

## Status

Phases 1 to 3 and Phases A to C are complete. The public homepage and floating
controls are verified at 1440, 1024, 820, 640 and 375. The custom admin and
media library are verified at the same widths. The assistant panel is a UI
stub until Phase 7. The school WhatsApp number is configured through
`NEXT_PUBLIC_WHATSAPP_NUMBER`. See `PROGRESS.md` for verification results,
reference differences and open decisions.
