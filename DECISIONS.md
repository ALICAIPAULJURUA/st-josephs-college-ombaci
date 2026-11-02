# Decisions

## D1: CMS

Payload CMS has been removed. A small custom admin will be built at `/admin` in a later phase. Until then the public site reads the defaults in `src/content/defaults/`.

## D2: Hosting and database

Development uses a local SQLite database at `file:./data/site.db` through Drizzle ORM. Production hosting and database are undecided; the owner will guide this choice. Do not assume Vercel, Turso, or another provider.

## D3: Production domain

Not yet supplied. `NEXT_PUBLIC_SITE_URL` remains a placeholder.

## D4: Sender address

Not yet supplied. Email fields remain placeholders.

## D5: TinyMCE licence

Use the self-hosted GPL route with `license_key: "gpl"` and local package assets. Do not configure a TinyMCE cloud API key.

## D6: Assistant provider

The owner selected OpenRouter for the OMBACIAN Assistant. The server accepts `OPENROUTER_API_KEY` and the owner's existing `OPEN_ROUTER_API_KEY`; `OPENROUTER_MODEL` is overridable. Never copy credentials into source or documentation. The live evaluation passed all 30 cases using the locally configured key.

## D7: Assistant daily message cap

The owner confirmed a limit of 1,000 messages globally per UTC day.

## Image storage

The custom admin will store uploads locally in `public/uploads` for development. Production storage (Cloudinary or Cloudflare R2) remains to be configured before launch.
