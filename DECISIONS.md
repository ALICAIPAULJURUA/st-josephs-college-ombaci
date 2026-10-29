# Decisions

## D1: CMS

Payload CMS 3.92.1 embedded in the Next.js application at `/admin`.

## D2: Hosting and database

Production is Vercel with Neon PostgreSQL. Local development and CI use SQLite through `PAYLOAD_DATABASE=sqlite`, as instructed in October 2026. Set `PAYLOAD_DATABASE=postgres` and `DATABASE_URI` in production.

## D3: Production domain

Not yet supplied. `NEXT_PUBLIC_SITE_URL` remains a placeholder.

## D4: Sender address

Not yet supplied. Email fields remain placeholders.

## Image storage

Phase 4 uses Payload's local upload storage for development. Production storage (Cloudinary or Cloudflare R2) remains to be configured before launch.
