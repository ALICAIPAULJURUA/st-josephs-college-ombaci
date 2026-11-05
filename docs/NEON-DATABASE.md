# Neon database setup

The website uses PostgreSQL with Drizzle ORM. `.env.local` holds the pooled
`DATABASE_URL` for application requests and `DATABASE_URL_UNPOOLED` for schema
migrations. Do not copy real connection values into this guide or commit them.

## Local development

When `DATABASE_URL` is unset, the app uses PGlite in `data/postgres/`. Create
the schema and load the public defaults before starting the website:

1. Run `pnpm db:migrate`.
2. Run `pnpm seed`.
3. Run `pnpm dev`.

The previous SQLite database at `data/site.db` is retained as a separate legacy
file. It is not automatically copied or used by the app. The `pnpm backup:sqlite`
command can create a backup of that legacy database.

## Neon development branch

The repository's ignored `.neon` context is pinned to the `dev` branch. The
development `DATABASE_URL` and direct migration URL live in ignored
`.env.local`; the default branch's credentials are kept separately in ignored
`.env.neon`. Use `neon env pull --branch dev --file .env.local` to refresh
development credentials, or `neon env pull --branch main --file .env.neon` to
refresh the default-branch credentials.

Apply committed migrations with `pnpm db:migrate`. This selects
`DATABASE_URL_UNPOOLED` for Neon migrations and the configured local PGlite
directory for local development. Seed public defaults with `pnpm seed`.

## Database contents and production readiness

The Neon `dev` branch has the versioned schema and public school defaults. The
`main` branch schema was migrated from the committed Drizzle migrations on
2026-11-05 with the owner's approval; production defaults have not been seeded.
Applications, application files, enquiries, chat logs and local user accounts
were not copied from SQLite. The seed command created one development admin;
no legacy passwords or production user accounts were transferred. Keep
applicant records in the legacy database until the school approves the
destination and a secure transfer and retention plan.

Before seeding `main`, configure durable media storage (Cloudinary) so sample
photos are stored somewhere that survives Vercel deployments. Production admin
provisioning, application private storage, email delivery, Turnstile, backups,
and school approval of application/privacy wording are also launch requirements.

## Vercel deployments

The sitemap and public pages read from the database at request time. Vercel
requires `DATABASE_URL` to be set for each environment, but the build does not
connect to it or require the schema to exist. After deployment, the selected
branch must be migrated and seeded before its pages can load. Use a pooled Neon
URL for the app. Set `DATABASE_URL` in Vercel's Preview and Production scopes as
appropriate; never use the development branch for Production. Production fails
explicitly when `DATABASE_URL` is missing instead of falling back to a local
database that Vercel cannot persist.

Set `NEXT_PUBLIC_SITE_URL` to the canonical URL for each environment and provide
a `SESSION_SECRET` of at least 32 characters for admin sessions. Before
Production can build against Neon `main`, explicitly migrate and seed that
branch; it is currently unmigrated. For Production media uploads, configure
`STORAGE_DRIVER=cloudinary` and the Cloudinary credentials. Application intake
also remains unavailable until its email, Turnstile, and private-storage
requirements are configured.
