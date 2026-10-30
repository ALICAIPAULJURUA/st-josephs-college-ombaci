1. Read docs/website-spec.md before every task. Work on one phase at a time.
2. Match /reference/f-panels/index.html. Use only the tokens in spec section 9. No gradients, no emojis, square corners.
3. Every piece of public text, every image and every list is editable from /admin. Never hard-code content in components. Components read from the database; defaults live in src/content/defaults/ and are loaded by `pnpm seed`.
4. Write real, original copy in plain English (spec section 8). Use only facts from spec section 2. Where a fact is unknown (fees, dates, names, emails), write the visible marker [To be confirmed: <what>] instead of inventing it.
5. Admin screens are for non-technical people: plain words, a hint under every field, big buttons, no jargon. See spec section 5.
6. Use TinyMCE for all rich text, configured exactly as in spec section 6. No raw HTML editing.
7. Images: follow spec section 7 (licences, local storage, alt text, sample flag). Never put a stock photo of a person next to a real person's name.
8. TypeScript strict, no `any`, validate all input with zod, sanitise all rich text on save.
9. Secrets in environment variables only. Never commit .env files or real passwords.
10. After each task run: pnpm lint && pnpm typecheck && pnpm test && pnpm build. Fix everything before reporting done.
11. Add a dependency only if needed and say why in the commit message. Conventional commits, one phase per branch.
12. Never publish a student's name or photo without the consent flag. Never publish the 1981 history.
13. If something is ambiguous, state your assumption at the top of your reply and continue.