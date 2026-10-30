# Decisions

## D1: CMS

Payload CMS has been removed. A small custom admin will be built at `/admin` in a later phase. Until then the public site reads the defaults in `src/content/defaults/`.

## D2: Hosting and database

Production is Vercel with Turso. The custom admin will use libSQL through Drizzle ORM, as specified in section 3 of the website specification.

## D3: Production domain

Not yet supplied. `NEXT_PUBLIC_SITE_URL` remains a placeholder.

## D4: Sender address

Not yet supplied. Email fields remain placeholders.

## Image storage

The custom admin will store uploads locally in `public/uploads` for development. Production storage (Cloudinary or Cloudflare R2) remains to be configured before launch.
