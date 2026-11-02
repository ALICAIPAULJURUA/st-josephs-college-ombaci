# AGENTS.md: St. Joseph's College Ombaci website

You are building the official website for St. Joseph's College Ombaci (West Nile, Uganda). The full specification is `docs/St. Joseph's College Ombaci Website Development Specification.md` (version 2). It is the single source of truth. The approved visual design is in `reference/f-panels/` (design "F Panels").

## What this project is

A normal Next.js website whose text, images and lists live in a database and are edited by a non-technical school staff member in a simple custom admin at `/admin`, using TinyMCE for rich text. It is NOT a CMS framework: do not use Payload, Strapi, WordPress-style plugins or any CMS product. If you find Payload code in the repo, Phase A of the spec removes it.

## First, every session

1. Read `docs/St. Joseph's College Ombaci Website Development Specification.md` in full before writing code. When resumed, re-read the sections for the current phase (Section 15).
2. Look at `reference/f-panels/` and match it. Do not redesign.
3. Read `PROGRESS.md` to see which phase is done and what is next. Create it if missing.

## Working rules

- One phase at a time, in the order in Section 15 (Phase A to K). Do not start the next phase until I say so.
- Follow the standing rules in Section 1 of the spec. If this file and the spec disagree, the spec wins unless I say otherwise in chat.
- Every public word and image must be editable in `/admin`. No hard-coded content in components; defaults live in `src/content/defaults/` and are loaded by `pnpm seed`.
- You write the starting content for every page (Section 8): original, plain English, only verified facts from Section 2. Anything unknown is `[To be confirmed: ...]`. Never invent fees, dates, names, numbers or contacts.
- Images: follow Section 7. Licence-safe only, download and host locally, record credits, flag samples, never put a stock photo of a person next to a real person's name.
- Do not enable Next.js Cache Components. Use normal static generation with `revalidate` and `revalidateTag`.
- Do not publish the 1981 history.
- Design: square corners, no gradients, no emojis, tokens from Section 9 only.
- Secrets only in environment variables. Keep `.env.example` current. Never commit real passwords.

## Before you say a phase is done

Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build` and fix every failure. For UI work, check 1440, 1024, 820, 640 and 375 px with Playwright screenshots and confirm there is no horizontal scroll. For content work, open `/admin`, change the field, and confirm the public page changes. Then update `PROGRESS.md` (phase, what was built, differences from the reference, open questions) and report in plain language what was built, what you could not do and what you need from me. Do not claim something passed unless you ran it.

## If unsure

Ask me. Do not guess and do not add features that are not in the spec.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
