# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A digital version of Radio TV Reist's paper "Miet- und Servicevertrag" (sound equipment rental contract). One page, fill in, press "Drucken", get exactly two A4 pages. No backend, no database. Deployed as a static site on Cloudflare Pages (free plan). UI and printed text are German, and amounts use Swiss format (`1'250.–`).

Design spec: `docs/superpowers/specs/2026-10-04-mietvertrag-app-design.md`. Original paper form: `../scan.pdf`.

## Commands

```bash
npm run dev          # http://localhost:3000
npm run build        # static export to out/ (also the type check, there is no ESLint)
npm test             # Vitest (config: `vitest.config.mts`), all tests
npx vitest run src/lib/calc.test.ts   # single file
npx vitest run -t "kaution"           # tests matching a name
```

## Architecture

- `next.config.ts` sets `output: "export"`. Don't add API routes, server actions or anything needing a server.
- All form state is one `FormState` object (`src/lib/form.ts`) held in `ContractForm`. Components get `{ form, totals, update }` (`PageProps`) and never keep their own form state.
- Derived values (row prices, Total, Mietzins, Kaution) come from `computeTotals()`. `mietzins`/`kaution` in state are `null` while automatic and a string once the user overrides them.
- Money is handled as integer Rappen in `src/lib/calc.ts`. Input fields hold raw strings, which are parsed with `parseChf`.
- `ContractForm` is loaded with `dynamic(..., { ssr: false })` because it reads the `localStorage` draft during its first render.
- `rows` in state is index-aligned with `EQUIPMENT` and `services` with `SERVICES` (`src/data/equipment.ts`). Changing those lists resets old drafts' rows (see `loadDraft`).
- Fixed contract texts are in `src/data/texts.ts`. Article numbering follows the paper (no Art. 1 or 15).
- Next.js 16 ships its docs in `node_modules/next/dist/docs/`. Read the relevant guide there before using Next APIs from memory.
- `next.config.ts` sets `agentRules: false` so `npm run dev` doesn't auto-generate `AGENTS.md`/`CLAUDE.md` content.

## Styling and print gotchas

- Tailwind v4. Custom CSS in `globals.css` must stay inside `@layer components`, or it overrides Tailwind utilities.
- Print layout: `@media print` in `globals.css`. `.no-print` hides elements, and `.field-line` keeps a black underline on blanks in printed text. After layout changes, print to PDF and check it's still exactly 2 pages.
- The sheet font is 9pt (`.sheet` in `globals.css`) and sheet 1 has only a few mm of slack (about 6mm of extra height still fits, 9mm does not). Re-check the 2-page PDF after any layout change.
