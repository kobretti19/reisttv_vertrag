# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A digital version of Radio TV Reist's paper "Miet- und Servicevertrag" (sound equipment rental contract). One page, fill in, press "Drucken", get exactly two A4 pages. A second page, `/etikette`, prints shop price labels. Deployed on Cloudflare as the Worker `reisttv-vertrag` (free plan, Workers Builds from GitHub `main`: `npm run build`, then `npx wrangler deploy` with `wrangler.jsonc`). The Worker serves the static export from `out/`. Its only own code is the shared label archive API. UI and printed text are German, and amounts use Swiss format (`1'250.–`).

Design spec: `docs/superpowers/specs/2026-10-04-mietvertrag-app-design.md`. Original paper form: `../scan.pdf`.

## Commands

```bash
npm run dev          # http://localhost:3000
npm run build        # static export to out/ (also the type check, there is no ESLint)
npm test             # Vitest (config: `vitest.config.mts`), all tests
npx vitest run src/lib/calc.test.ts   # single file
npx vitest run -t "kaution"           # tests matching a name
npx wrangler dev     # after build: site + /api/labels as on Cloudflare (password from .dev.vars: LABELS_PASSWORD=...)
```

## Architecture

- `next.config.ts` sets `output: "export"`. Don't add Next API routes or server actions. Server code goes in `worker/` (`index.ts` routes `/api/labels`, everything else goes to the assets). Next doesn't build it, wrangler does, and Vitest tests it. Without `wrangler.jsonc`, `wrangler deploy` auto-converts the app with OpenNext, which fails for a static export. `npm run dev` has no `/api`, so the label page then works in local-only mode.
- All form state is one `FormState` object (`src/lib/form.ts`) held in `ContractForm`. Components get `{ form, totals, update }` (`PageProps`) and never keep their own form state.
- Derived values (row prices, Total, Mietzins, Kaution) come from `computeTotals()`. `mietzins`/`kaution` in state are `null` while automatic and a string once the user overrides them.
- Money is handled as integer Rappen in `src/lib/calc.ts`. Input fields hold raw strings, which are parsed with `parseChf`.
- `ContractForm` is loaded with `dynamic(..., { ssr: false })` because it reads the `localStorage` draft during its first render.
- `rows` in state is index-aligned with `EQUIPMENT` and `services` with `SERVICES` (`src/data/equipment.ts`). Changing those lists resets old drafts' rows (see `loadDraft`).
- Archive: "Speichern" stores contracts in localStorage (`reist-vertraege-archive`, array of `{id, savedAt, form}`; `src/lib/archive.ts`). `reist-vertrag-current-id` links the open form to its entry so Speichern updates it instead of copying; unsaved-changes detection compares `JSON.stringify` against a snapshot in `ContractForm`. The draft key stays separate.
- Anything read from storage or an imported backup must go through `normalizeForm()` (`storage.ts`, shared with `loadDraft`). Backup = JSON download/upload of the archive in `ArchivePanel`; import merges by id, newer `savedAt` wins.
- Price label: route `/etikette` (`LabelEditor`), 150 × 105 mm, one per printed page via the named page `@page etikett` in `globals.css`. Layout and font sizes copy the shop's paper label (`../Reist.pdf`). "Anzahl" renders extra `.label-copy` sheets, which are hidden on screen. The price comes from `labelPrice` (`src/lib/label.ts`) and prints as "Fr. 499.00", not in the contract's `.–` style. The 0.3mm border is the cut line and sits inside the 150 × 105 mm box. Saved labels (`useLabelStore`): after login with the shop password (stored in localStorage as `reist-etiketten-passwort`), the list lives in Cloudflare KV (`worker/labels.ts`). The KV binding `LABELS` in `wrangler.jsonc` has no id, so wrangler creates the namespace on the first deploy. The secret `LABELS_PASSWORD` is set in the dashboard. One key, `labels`, holds the JSON array. Every save or delete is an op the server applies (`save`, `delete`, `import`), and localStorage `reist-etiketten-archive` is only a copy. Without login, labels stay in localStorage only. At the first login, those local labels get imported. `worker/` imports the pure list helpers from `src/lib/label.ts`, so keep that file free of `@/` imports and browser APIs. `Nav` (in both toolbars) switches between the pages.
- Fixed contract texts are in `src/data/texts.ts`. Article numbering follows the paper (no Art. 1 or 15).
- Next.js 16 ships its docs in `node_modules/next/dist/docs/`. Read the relevant guide there before using Next APIs from memory.
- `next.config.ts` sets `agentRules: false` so `npm run dev` doesn't auto-generate `AGENTS.md`/`CLAUDE.md` content.

## Styling and print gotchas

- Tailwind v4. Custom CSS in `globals.css` must stay inside `@layer components`, or it overrides Tailwind utilities.
- Print layout: `@media print` in `globals.css`. `.no-print` hides elements, and `.field-line` keeps a black underline on blanks in printed text. After layout changes, print to PDF and check it's still exactly 2 pages.
- The sheet font is 9pt (`.sheet` in `globals.css`) and sheet 1 has only a few mm of slack (about 6mm of extra height still fits, 9mm does not). Re-check the 2-page PDF after any layout change.
