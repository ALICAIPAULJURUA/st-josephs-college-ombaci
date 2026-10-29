# AGENTS.md: St. Joseph's College Ombaci website

You are building the official website for St. Joseph's College Ombaci (West Nile, Uganda). The full specification is in `docs/website-spec.md`. It is the single source of truth. The approved visual design is in `reference/f-panels/` (design "F Panels").

## First, every session

1. Read `docs/website-spec.md` in full before writing any code. If a session is resumed, re-read the sections for the current phase (listed in section 14 of the spec).
2. Open `reference/f-panels/` and look at the HTML and CSS. Match it. Do not redesign it.
3. Check `PROGRESS.md` at the repo root to see which phase is done and what is next. Create it in Phase 0 if it does not exist.

## Working rules

- Work on ONE phase at a time, in the order given in section 14 of the spec (Phase 0 to Phase 9). Do not start the next phase until I say so.
- Follow the rules block in section 1 of the spec. If anything here conflicts with the spec, the spec wins, except where I tell you otherwise in chat.
- Stack: Next.js App Router, TypeScript strict, Tailwind with CSS variable tokens, pnpm, Payload CMS at /admin, PostgreSQL. Use the choices already decided in section 3. If a decision (D1 to D4) is still open, stop and ask me.
- Do not invent content. Facts come only from section 2 of the spec or from the CMS. Anything the school has not supplied (fees, term dates, emails, names, numbers) is a visible `[Placeholder: ...]` and is listed in section 13. Never write realistic made-up fees, names, dates or statistics.
- Do not publish the 1981 history. See section 8.
- Design: square corners, no gradients, no emojis, no generic AI-style UI. Use only the tokens and fonts in section 4. Photos are placeholders until real ones are supplied.
- Accessibility, performance and security budgets in section 12 apply to every phase, not only Phase 8.
- Never put secrets in the repo. `ANTHROPIC_API_KEY` stays server-side. Keep `.env.example` current.

## Before you say a phase is done

Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build` and fix every failure. For UI work, also check these widths with Playwright screenshots: 1440, 1024, 820, 640, 375, and confirm there is no horizontal scroll. Then:

1. Update `PROGRESS.md`: phase, what was built, what differs from the reference, open questions.
2. Report back in plain language: what was built, what you could not match, what you need from me. Do not claim something passed unless you ran it.

## If unsure

Ask me. Do not guess, and do not add features that are not in the spec.