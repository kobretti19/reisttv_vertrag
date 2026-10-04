# Miet- und Servicevertrag App – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A static Next.js page that reproduces Radio TV Reist's paper "Miet- und Servicevertrag" as a fillable form, calculates prices automatically, keeps a draft in the browser, and prints exactly two A4 pages.

**Architecture:** Fully static Next.js app (`output: 'export'`), no server, no database. All state is one `FormState` object held in a single client component, persisted to `localStorage`. Pure calculation functions (`src/lib/calc.ts`, `src/lib/form.ts`) are unit-tested with Vitest; components only render state. Printing is plain `window.print()` with print CSS.

**Tech Stack:** Next.js (App Router, TypeScript), React, Tailwind CSS v4, Vitest. Hosting: Cloudflare Pages (free).

**Spec:** `docs/superpowers/specs/2026-10-04-mietvertrag-app-design.md`

**Environment notes:**
- Windows machine. Node v22.14.0, npm 11.6.0, git 2.49. Commands below are written for Git Bash (they also work in PowerShell unless noted).
- Project root: `D:\NextJS\Reist_TV\Rechnung_App`. Logo source: `D:\NextJS\Reist_TV\reist_logo.png` (640×232 px).
- The project is set up by hand instead of using `create-next-app`, because `create-next-app .` rejects the folder name `Rechnung_App` (npm package names can't contain capital letters).
- No ESLint, to keep setup small. Type errors are caught by `npm run build`.
- **Tailwind v4 gotcha:** custom CSS must be inside `@layer components { … }`. Unlayered CSS beats Tailwind's utility layer, and then classes like `w-40` would stop working on `.field`.

---

## File Structure

| File | Responsibility |
|---|---|
| `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `.gitignore`, `.node-version` | Project setup |
| `public/reist_logo.png` | Logo |
| `src/data/equipment.ts` | Equipment list with prices, service lines |
| `src/data/texts.ts` | Fixed texts: header lines, intro text, contract articles |
| `src/lib/calc.ts` | Parse and format CHF amounts, row price, total, deposit |
| `src/lib/form.ts` | `FormState` type, `emptyForm()`, `computeTotals()` |
| `src/lib/storage.ts` | Draft load/save/clear in `localStorage` |
| `src/components/types.ts` | `PageProps` shared by both pages |
| `src/components/PrintField.tsx` | Text input that prints like plain text |
| `src/components/AutoField.tsx` | Field with auto value and "↺" reset button |
| `src/components/Toolbar.tsx` | Drucken / Neu buttons and the reset confirmation |
| `src/components/CustomerFields.tsx` | Renter details table |
| `src/components/EquipmentTable.tsx` | Equipment, services and total table |
| `src/components/Page1.tsx` | Sheet 1 |
| `src/components/Page2.tsx` | Sheet 2 (articles) |
| `src/components/ContractForm.tsx` | Holds state, saves draft, renders toolbar and sheets |
| `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` | App shell, page entry, styles and print CSS |

---

### Task 1: Project setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `.gitignore`, `.node-version`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `public/reist_logo.png`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "reist-mietvertrag",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "test": "vitest run"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install next@latest react@latest react-dom@latest
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss @tailwindcss/postcss vitest
```
Expected: both commands finish without `ERR!`. `node_modules/` exists.

- [ ] **Step 3: Create config files**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```
(Next.js may adjust some of these values on the first build. That's expected.)

`next.config.ts`:
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
```

`postcss.config.mjs`:
```js
export default {
  plugins: { "@tailwindcss/postcss": {} },
};
```

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
```

`.gitignore`:
```
node_modules/
.next/
out/
next-env.d.ts
*.tsbuildinfo
.env*
```

`.node-version` (Cloudflare Pages reads this for the build):
```
22
```

- [ ] **Step 4: Copy the logo**

Run:
```bash
mkdir -p public && cp ../reist_logo.png public/reist_logo.png
```
Expected: `public/reist_logo.png` exists.

- [ ] **Step 5: Minimal app shell**

`src/app/globals.css`:
```css
@import "tailwindcss";
```

`src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mietvertrag – Radio TV Reist",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
```

`src/app/page.tsx` (temporary, replaced in Task 11):
```tsx
export default function Home() {
  return <p>Setup OK</p>;
}
```

- [ ] **Step 6: Verify the build produces a static site**

Run: `npm run build`
Expected: build succeeds, and `out/index.html` exists and contains `Setup OK`.

- [ ] **Step 7: Init git and commit**

```bash
git init
git add -A
git commit -m "chore: set up static Next.js project"
```

---

### Task 2: CHF calculation helpers

**Files:**
- Create: `src/lib/calc.ts`
- Test: `src/lib/calc.test.ts`

All amounts are integers in **Rappen** (1 Fr. = 100 Rappen), so there are no floating-point errors.

- [ ] **Step 1: Write the failing tests**

`src/lib/calc.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { formatChf, kaution, parseChf, parseCount, rowPrice, total } from "./calc";

describe("parseChf", () => {
  it("parses plain and decimal amounts", () => {
    expect(parseChf("80")).toBe(8000);
    expect(parseChf("80.50")).toBe(8050);
    expect(parseChf("80,5")).toBe(8050);
  });
  it("accepts Swiss formatting", () => {
    expect(parseChf("80.–")).toBe(8000);
    expect(parseChf("80.--")).toBe(8000);
    expect(parseChf("1'250.50")).toBe(125050);
    expect(parseChf("Fr. 45")).toBe(4500);
    expect(parseChf(" 45 ")).toBe(4500);
  });
  it("returns null for empty or invalid input", () => {
    expect(parseChf("")).toBeNull();
    expect(parseChf("   ")).toBeNull();
    expect(parseChf("abc")).toBeNull();
    expect(parseChf("-5")).toBeNull();
    expect(parseChf("1.234")).toBeNull();
  });
});

describe("parseCount", () => {
  it("parses positive numbers", () => {
    expect(parseCount("2")).toBe(2);
    expect(parseCount("1,5")).toBe(1.5);
  });
  it("returns null for empty, zero or invalid", () => {
    expect(parseCount("")).toBeNull();
    expect(parseCount("0")).toBeNull();
    expect(parseCount("x")).toBeNull();
  });
});

describe("rowPrice", () => {
  it("multiplies price by count", () => {
    expect(rowPrice("80.–", "2")).toBe(16000);
    expect(rowPrice("45", "1,5")).toBe(6750);
  });
  it("is null when count or price is missing", () => {
    expect(rowPrice("80.–", "")).toBeNull();
    expect(rowPrice("80.–", "0")).toBeNull();
    expect(rowPrice("", "2")).toBeNull();
  });
});

describe("total", () => {
  it("sums amounts and ignores nulls", () => {
    expect(total([16000, null, 4500])).toBe(20500);
    expect(total([])).toBe(0);
  });
});

describe("kaution", () => {
  it("is one third, rounded to 5 Rappen", () => {
    expect(kaution(10000)).toBe(3335);
    expect(kaution(25000)).toBe(8335);
    expect(kaution(30000)).toBe(10000);
  });
});

describe("formatChf", () => {
  it("formats whole francs with a dash", () => {
    expect(formatChf(125000)).toBe("1'250.–");
    expect(formatChf(8000)).toBe("80.–");
  });
  it("formats Rappen with two digits", () => {
    expect(formatChf(125050)).toBe("1'250.50");
    expect(formatChf(3335)).toBe("33.35");
    expect(formatChf(805)).toBe("8.05");
  });
  it("adds thousand separators", () => {
    expect(formatChf(123456700)).toBe("1'234'567.–");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL, because `./calc` can't be resolved.

- [ ] **Step 3: Implement**

`src/lib/calc.ts`:
```ts
/** Parses a CHF amount ("80", "80.50", "80,5", "80.–", "1'250.50", "Fr. 45") into Rappen. */
export function parseChf(input: string): number | null {
  const cleaned = input
    .trim()
    .replace(/^Fr\.?\s*/i, "")
    .replace(/['’\s]/g, "")
    .replace(/[.,]?[–-]+$/, "")
    .replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(parseFloat(cleaned) * 100);
}

/** Parses a positive quantity ("2", "1,5"). Empty, zero or invalid input gives null. */
export function parseCount(input: string): number | null {
  const cleaned = input.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const n = parseFloat(cleaned);
  return n > 0 ? n : null;
}

/** Price × quantity in Rappen, or null if either is missing. */
export function rowPrice(preis: string, anzahl: string): number | null {
  const p = parseChf(preis);
  const n = parseCount(anzahl);
  if (p === null || n === null) return null;
  return Math.round(p * n);
}

export function total(amounts: (number | null)[]): number {
  return amounts.reduce<number>((sum, a) => sum + (a ?? 0), 0);
}

/** One third of the rent, rounded to 5 Rappen. */
export function kaution(mietzinsRappen: number): number {
  return Math.round(mietzinsRappen / 15) * 5;
}

/** 125000 → "1'250.–", 125050 → "1'250.50" */
export function formatChf(rappen: number): string {
  const francs = Math.floor(rappen / 100);
  const cents = rappen % 100;
  const f = String(francs).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return cents === 0 ? `${f}.–` : `${f}.${String(cents).padStart(2, "0")}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all tests in `calc.test.ts` PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/calc.ts src/lib/calc.test.ts
git commit -m "feat: add CHF parsing, formatting and price calculations"
```

---

### Task 3: Fixed data and texts

**Files:**
- Create: `src/data/equipment.ts`, `src/data/texts.ts`

- [ ] **Step 1: Equipment list**

`src/data/equipment.ts`:
```ts
export type Equipment = {
  /** Empty for continuation rows of the same category, as on the paper form. */
  category: string;
  brand: string;
  model: string;
  /** Default price in whole francs. */
  price: number;
};

export const EQUIPMENT: Equipment[] = [
  { category: "Verstärker", brand: "Philips", model: "LBB 1143", price: 80 },
  { category: "", brand: "Sony", model: "Mini-Disc inkl. LS", price: 150 },
  { category: "", brand: "Dynacord", model: "Disco inkl. LS", price: 250 },
  { category: "Lautsprecher", brand: "TOA", model: "Trichter LS", price: 45 },
  { category: "", brand: "El. Voice", model: "Musicaster", price: 45 },
  { category: "", brand: "Jamo", model: "Pro 200ex", price: 45 },
  { category: "", brand: "El. Voice", model: "100S", price: 45 },
  { category: "Funkanlage", brand: "TOA", model: "WT 02", price: 150 },
  { category: "", brand: "ANCOR", model: "Explorer", price: 100 },
  { category: "Tonsystem", brand: "Lindaco", model: "2519", price: 50 },
  { category: "", brand: "Schauf", model: "DS - 50", price: 70 },
  { category: "Mikrophon", brand: "Sennheiser", model: "Profi Power", price: 35 },
  { category: "", brand: "Sennheiser", model: "MD 442", price: 35 },
  { category: "Mischpult", brand: "Grauer + Müller", model: "PH 15 B", price: 45 },
  { category: "", brand: "Roclab", model: "MPX 7801", price: 45 },
  { category: "Tonband", brand: "Kenwood", model: "", price: 20 },
  { category: "CD-Player", brand: "Philips", model: "", price: 25 },
  { category: "Stativ", brand: "", model: "", price: 10 },
  { category: "Autobeschallung", brand: "Fiat Panda", model: "", price: 250 },
  { category: "", brand: "Toyota Bus", model: "", price: 250 },
];

/** Services without a fixed price; only the amount is entered. */
export const SERVICES: string[] = [
  "Bedienung der LS-Anlage",
  "Arbeit: Installation, inkl. Fahrt",
  "Montage",
  "Demontage",
];
```

- [ ] **Step 2: Fixed texts**

`src/data/texts.ts`:
```ts
export const HEADER_LINES: string[] = [
  "Vermietung von Lautsprecheranlagen",
  "Video-Überwachung-Satellitenanlagen (Camping)",
  "Reparatur: TV + Audiogeräte-PC Support",
  "Verkauf Reparatur und Installation aller Audio + TV Marken",
];

export const INTRO_TEXT: string[] = [
  "Es würde uns freuen, Ihnen mit unseren modernsten Anlagen die Beschallung zu verbessern.",
  "Falls Sie sich für unsere Offerte entschliessen können, erwarten wir die Rücksendung des Vertrages.",
];

export type Article = { nr: number; title: string; text: string; bold?: boolean };

/** Articles without input fields. Art. 2–5, 7 and 17 have fields and are written in Page2.tsx. */
export const STATIC_ARTICLES: Article[] = [
  {
    nr: 6,
    title: "Betriebskosten",
    text: "Alle weiteren mit dem Betrieb der Mietgegenstände verbundenen Kosten, soweit sie durch diesen Vertrag nicht ausdrücklich vom Vermieter übernommen werden, gehen zu Lasten des Mieters.",
  },
  {
    nr: 8,
    title: "Haftung des Mieters",
    text: "Für jede übermässige Abnützung ist der Mieter schadenersatzpflichtig. Gehen die Mietgegenstände während der Mietdauer aus irgend einem Grunde unter, so hat dafür auf jeden Fall der Mieter einzustehen.",
  },
  {
    nr: 9,
    title: "Versicherung",
    text: "Eine allfällige Versicherung der Mietgegenstände während der Mietdauer gegen Elementar- und andere Schäden sowie Diebstahls ist Sache des Mieters.",
  },
  {
    nr: 10,
    title: "Untermiete",
    text: "Der Mieter ist nicht berechtigt, die Mietgegenstände an Dritte abzutreten oder weiterzuvermieten.",
  },
  {
    nr: 11,
    title: "Reparaturservice",
    text: "Der Vermieter hält die Mietgegenstände in gutem Funktionszustand. Er repariert auf seine Kosten mangelhafte Mietgegenstände und ersetzt Einzelteile kostenlos. Ist die Reparatur auf unsachgemässe Behandlung zurückzuführen, so trägt der Mieter sämtliche Kosten.",
  },
  {
    nr: 12,
    title: "Andere Leistungen des Vermieters",
    text: "Zur Durchführung von Montage, Demontage, Änderungen an den Installationen und Reparaturen ist einzig der Vermieter oder von ihm bezeichnete Dritte berechtigt und verpflichtet. Der Mieter haftet für alle aus Missachtung dieser Vorschriften entstehenden Schäden.",
  },
  {
    nr: 13,
    title: "Wegbedingung der Haftung des Vermieters",
    text: "Die Haftung des Vermieters für allfällige Folgen einer Störung oder einer verspäteten Intervention ist ausgeschlossen.",
  },
  {
    nr: 14,
    title: "Obligationenrecht",
    text: "Im übrigen gelten, soweit in diesem Vertrag nicht etwas anderes vereinbart wurde, die Bestimmungen der OR.",
  },
  {
    nr: 16,
    title: "Gerichtsstand",
    text: "Für alle aus diesem Vertrag entstehenden Streitigkeiten gilt für beide Parteien ausschliesslich Bern als Gerichtsstand.",
    bold: true,
  },
];
```

- [ ] **Step 3: Commit**

```bash
git add src/data
git commit -m "feat: add equipment list and contract texts"
```

---

### Task 4: Form state and derived totals

**Files:**
- Create: `src/lib/form.ts`
- Test: `src/lib/form.test.ts`

- [ ] **Step 1: Write the failing tests**

`src/lib/form.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { EQUIPMENT, SERVICES } from "../data/equipment";
import { computeTotals, emptyForm } from "./form";

describe("emptyForm", () => {
  it("has one row per equipment item with the default price", () => {
    const f = emptyForm();
    expect(f.rows).toHaveLength(EQUIPMENT.length);
    expect(f.rows[0]).toEqual({ preis: "80.–", anzahl: "" });
    expect(f.services).toHaveLength(SERVICES.length);
    expect(f.mietzins).toBeNull();
    expect(f.kaution).toBeNull();
  });
});

describe("computeTotals", () => {
  it("is empty for an empty form", () => {
    const t = computeTotals(emptyForm());
    expect(t.total).toBe(0);
    expect(t.mietzins).toBe("");
    expect(t.kaution).toBe("");
    expect(t.rowPrices.every((p) => p === null)).toBe(true);
  });

  it("sums equipment, extra row and services", () => {
    const f = emptyForm();
    f.rows[0] = { preis: "80.–", anzahl: "2" }; // 160
    f.extra = { mietgegenstand: "Kabel", marke: "", modell: "", preis: "5", anzahl: "4" }; // 20
    f.services[2] = "100"; // Montage
    const t = computeTotals(f);
    expect(t.rowPrices[0]).toBe(16000);
    expect(t.extraPrice).toBe(2000);
    expect(t.servicePrices[2]).toBe(10000);
    expect(t.total).toBe(28000);
    expect(t.mietzins).toBe("280.–");
    expect(t.kaution).toBe("93.35");
  });

  it("uses a manual Mietzins for the Kaution", () => {
    const f = emptyForm();
    f.rows[0] = { preis: "80.–", anzahl: "2" };
    f.mietzins = "300";
    const t = computeTotals(f);
    expect(t.mietzins).toBe("300");
    expect(t.kaution).toBe("100.–");
  });

  it("keeps a manual Kaution", () => {
    const f = emptyForm();
    f.rows[0] = { preis: "80.–", anzahl: "2" };
    f.kaution = "50";
    expect(computeTotals(f).kaution).toBe("50");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL, because `./form` can't be resolved.

- [ ] **Step 3: Implement**

`src/lib/form.ts`:
```ts
import { EQUIPMENT, SERVICES } from "../data/equipment";
import { formatChf, kaution, parseChf, rowPrice, total } from "./calc";

export type RowInput = { preis: string; anzahl: string };

export type ExtraRow = {
  mietgegenstand: string;
  marke: string;
  modell: string;
  preis: string;
  anzahl: string;
};

export type FormState = {
  an: { name: string; adresse: string; wohnort: string };
  mieter: {
    name: string;
    vorname: string;
    strasse: string;
    wohnort: string;
    telefonP: string;
    telefonG: string;
  };
  /** Same order and length as EQUIPMENT. */
  rows: RowInput[];
  extra: ExtraRow;
  /** Mietpreis per service, same order and length as SERVICES. */
  services: string[];
  datum: string;
  quittungVon: string;
  quittungBis: string;
  gebrauch: string;
  mietdauerVon: string;
  mietdauerBis: string;
  /** null = automatic (equal to Total). */
  mietzins: string | null;
  transport: string;
  /** null = automatic (one third of Mietzins). */
  kaution: string | null;
  abmachungen: string;
};

export function emptyForm(): FormState {
  return {
    an: { name: "", adresse: "", wohnort: "" },
    mieter: { name: "", vorname: "", strasse: "", wohnort: "", telefonP: "", telefonG: "" },
    rows: EQUIPMENT.map((e) => ({ preis: formatChf(e.price * 100), anzahl: "" })),
    extra: { mietgegenstand: "", marke: "", modell: "", preis: "", anzahl: "" },
    services: SERVICES.map(() => ""),
    datum: "",
    quittungVon: "",
    quittungBis: "",
    gebrauch: "",
    mietdauerVon: "",
    mietdauerBis: "",
    mietzins: null,
    transport: "",
    kaution: null,
    abmachungen: "",
  };
}

export type Totals = {
  rowPrices: (number | null)[];
  extraPrice: number | null;
  servicePrices: (number | null)[];
  /** Rappen */
  total: number;
  /** Text shown in Art. 4 (manual value or formatted total). */
  mietzins: string;
  /** Text shown in Art. 7 (manual value or one third of Mietzins). */
  kaution: string;
};

export function computeTotals(form: FormState): Totals {
  const rowPrices = form.rows.map((r) => rowPrice(r.preis, r.anzahl));
  const extraPrice = rowPrice(form.extra.preis, form.extra.anzahl);
  const servicePrices = form.services.map(parseChf);
  const sum = total([...rowPrices, extraPrice, ...servicePrices]);

  const mietzins = form.mietzins ?? (sum > 0 ? formatChf(sum) : "");
  const mietzinsRappen = parseChf(mietzins);
  const kautionText =
    form.kaution ??
    (mietzinsRappen !== null && mietzinsRappen > 0 ? formatChf(kaution(mietzinsRappen)) : "");

  return { rowPrices, extraPrice, servicePrices, total: sum, mietzins, kaution: kautionText };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all tests in `calc.test.ts` and `form.test.ts` PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/form.ts src/lib/form.test.ts
git commit -m "feat: add form state and derived totals"
```

---

### Task 5: Draft storage

**Files:**
- Create: `src/lib/storage.ts`

There's no test because Vitest runs in Node without `localStorage`. It's checked by hand in Task 11.

- [ ] **Step 1: Implement**

`src/lib/storage.ts`:
```ts
import { emptyForm, type FormState } from "./form";

const KEY = "reist-vertrag-draft";

/** Returns the saved draft, or null if there is none or it can't be read. */
export function loadDraft(): FormState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<FormState>;
    const base = emptyForm();
    return {
      ...base,
      ...saved,
      an: { ...base.an, ...saved.an },
      mieter: { ...base.mieter, ...saved.mieter },
      extra: { ...base.extra, ...saved.extra },
      // If the equipment or service list changed since the draft was saved, start those fresh.
      rows: saved.rows?.length === base.rows.length ? saved.rows : base.rows,
      services: saved.services?.length === base.services.length ? saved.services : base.services,
    };
  } catch {
    return null;
  }
}

export function saveDraft(form: FormState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(form));
  } catch {
    // Storage full or blocked: the form still works, only the draft isn't kept.
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Ignore, see saveDraft.
  }
}
```

- [ ] **Step 2: Type-check via build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/lib/storage.ts
git commit -m "feat: keep form draft in localStorage"
```

---

### Task 6: Styles and print CSS

**Files:**
- Modify: `src/app/globals.css` (replace whole file)

- [ ] **Step 1: Write the stylesheet**

`src/app/globals.css`:
```css
@import "tailwindcss";

/* Keep custom styles in a layer so Tailwind utilities (w-40 etc.) can override them. */
@layer components {
  body {
    background: #e5e7eb;
    color: #000;
    font-family: Arial, Helvetica, sans-serif;
  }

  /* Toolbar */
  .toolbar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    padding: 0.75rem;
    background: #1e3a8a;
  }
  .btn {
    padding: 0.4rem 1rem;
    border-radius: 0.375rem;
    border: 1px solid #cbd5e1;
    background: #fff;
    color: #111;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-primary {
    background: #f97316;
    border-color: #f97316;
    color: #fff;
  }
  .btn-danger {
    background: #dc2626;
    border-color: #dc2626;
    color: #fff;
  }
  .confirm {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    color: #fff;
  }

  /* A4 sheets */
  .sheets {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem 1rem;
  }
  .sheet {
    width: 210mm;
    min-height: 297mm;
    padding: 12mm;
    background: #fff;
    box-shadow: 0 2px 8px rgb(0 0 0 / 0.2);
    font-size: 10pt;
  }

  /* Inputs */
  .field {
    width: 100%;
    padding: 0 2px;
    border: 0;
    border-bottom: 1px dotted #94a3b8;
    background: #eff6ff;
    font: inherit;
    color: inherit;
  }
  .field:focus {
    outline: 2px solid #3b82f6;
    background: #fff;
  }
  .field-line {
    border-bottom: 1px solid #000;
  }
  .reset {
    padding: 0 0.3rem;
    border: 1px solid #94a3b8;
    border-radius: 0.25rem;
    background: #fff;
    font-size: 9pt;
    cursor: pointer;
  }

  /* Sheet 1 */
  .logo {
    width: 85mm;
    height: auto;
  }
  .header-lines {
    font-size: 9pt;
    line-height: 1.35;
  }
  .title {
    font-size: 18pt;
    font-weight: 700;
  }
  .grid-table {
    border-collapse: collapse;
  }
  .grid-table th,
  .grid-table td {
    border: 1px solid #000;
    padding: 1px 4px;
    text-align: left;
    font-weight: normal;
  }
  .an {
    width: 85mm;
  }
  .an th {
    width: 22mm;
  }
  .cust th {
    width: 22mm;
  }
  .equip {
    width: 100%;
    border-collapse: collapse;
  }
  .equip th,
  .equip td {
    height: 5.6mm;
    padding: 0 4px;
    border: 1px solid #000;
    text-align: left;
  }
  .equip thead th {
    font-weight: 700;
    font-style: italic;
  }
  .equip .num {
    text-align: right;
  }
  .equip tr.total td {
    border: 0;
  }
  .equip tr.total th,
  .equip tr.total td:last-child {
    border: 1px solid #000;
    font-weight: 700;
    font-style: italic;
  }
  .money {
    display: flex;
    gap: 4px;
    align-items: center;
  }
  .money > :last-child {
    flex: 1;
    text-align: right;
  }
  .intro {
    margin-top: 4mm;
    line-height: 1.5;
  }
  .footer {
    width: 100%;
    margin-top: 4mm;
  }
  .footer th,
  .footer td {
    width: 33.33%;
    height: 7mm;
  }

  /* Sheet 2 */
  .article {
    display: grid;
    grid-template-columns: 16mm 1fr 34mm;
    gap: 4mm;
    padding: 2.2mm 0;
    line-height: 1.45;
  }
  .art-nr {
    font-style: italic;
  }
  .art-title {
    font-weight: 700;
    font-size: 9pt;
  }
  .abmachungen {
    display: block;
    width: 100%;
    height: 28mm;
    margin-top: 2mm;
    padding: 0 2px;
    border: 0;
    line-height: 7mm;
    background: linear-gradient(to bottom, transparent calc(7mm - 1px), #000 calc(7mm - 1px));
    background-size: 100% 7mm;
    font: inherit;
    resize: none;
  }
}

@media print {
  @page {
    size: A4;
    margin: 12mm;
  }
  body {
    background: #fff;
  }
  .no-print {
    display: none !important;
  }
  .sheets {
    display: block;
    padding: 0;
  }
  .sheet {
    width: auto;
    min-height: 0;
    padding: 0;
    box-shadow: none;
    break-after: page;
  }
  .sheet:last-child {
    break-after: auto;
  }
  .field {
    background: transparent;
    border-bottom-color: transparent;
  }
  .field.field-line {
    border-bottom-color: #000;
  }
  .field::placeholder {
    color: transparent;
  }
  .abmachungen {
    line-height: 7mm;
  }
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add sheet layout and print styles"
```

---

### Task 7: Basic components (PrintField, AutoField, Toolbar)

**Files:**
- Create: `src/components/PrintField.tsx`, `src/components/AutoField.tsx`, `src/components/Toolbar.tsx`, `src/components/types.ts`

- [ ] **Step 1: Shared page props**

`src/components/types.ts`:
```ts
import type { FormState, Totals } from "@/lib/form";

export type PageProps = {
  form: FormState;
  totals: Totals;
  update: (patch: Partial<FormState>) => void;
};
```

- [ ] **Step 2: PrintField**

`src/components/PrintField.tsx`:
```tsx
type Props = {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
  placeholder?: string;
  align?: "left" | "right";
  /** Show a solid line under the field, also when printed (for blanks inside running text). */
  line?: boolean;
};

export function PrintField({ value, onChange, ariaLabel, className = "", placeholder, align = "left", line = false }: Props) {
  const classes = ["field", line ? "field-line" : "", align === "right" ? "text-right" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <input
      type="text"
      className={classes}
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
```

- [ ] **Step 3: AutoField**

`src/components/AutoField.tsx`:
```tsx
import { PrintField } from "./PrintField";

type Props = {
  value: string;
  /** True when the user typed their own value instead of the automatic one. */
  overridden: boolean;
  onChange: (value: string) => void;
  onReset: () => void;
  ariaLabel: string;
};

export function AutoField({ value, overridden, onChange, onReset, ariaLabel }: Props) {
  return (
    <span className="inline-flex items-center gap-1">
      <PrintField value={value} onChange={onChange} ariaLabel={ariaLabel} align="right" line className="w-32" />
      {overridden && (
        <button type="button" className="reset no-print" title="Automatisch berechnen" onClick={onReset}>
          ↺
        </button>
      )}
    </span>
  );
}
```

- [ ] **Step 4: Toolbar**

`src/components/Toolbar.tsx`:
```tsx
"use client";

import { useState } from "react";

export function Toolbar({ onNew }: { onNew: () => void }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="toolbar no-print">
      <button type="button" className="btn btn-primary" onClick={() => window.print()}>
        Drucken
      </button>
      {confirming ? (
        <span className="confirm">
          Alle Eingaben löschen?
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              onNew();
              setConfirming(false);
            }}
          >
            Ja
          </button>
          <button type="button" className="btn" onClick={() => setConfirming(false)}>
            Abbrechen
          </button>
        </span>
      ) : (
        <button type="button" className="btn" onClick={() => setConfirming(true)}>
          Neu
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Verify the build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components
git commit -m "feat: add print field, auto field and toolbar components"
```

---

### Task 8: CustomerFields and EquipmentTable

**Files:**
- Create: `src/components/CustomerFields.tsx`, `src/components/EquipmentTable.tsx`

- [ ] **Step 1: CustomerFields**

`src/components/CustomerFields.tsx`:
```tsx
import type { FormState } from "@/lib/form";
import { PrintField } from "./PrintField";

type Mieter = FormState["mieter"];

export function CustomerFields({ mieter, onChange }: { mieter: Mieter; onChange: (m: Mieter) => void }) {
  const set = (key: keyof Mieter) => (value: string) => onChange({ ...mieter, [key]: value });

  return (
    <table className="grid-table cust mt-6 w-full">
      <tbody>
        <tr>
          <th>Name</th>
          <td><PrintField value={mieter.name} onChange={set("name")} ariaLabel="Name" /></td>
          <th>Vorname</th>
          <td><PrintField value={mieter.vorname} onChange={set("vorname")} ariaLabel="Vorname" /></td>
        </tr>
        <tr>
          <th>Strasse</th>
          <td><PrintField value={mieter.strasse} onChange={set("strasse")} ariaLabel="Strasse" /></td>
          <th>Wohnort</th>
          <td><PrintField value={mieter.wohnort} onChange={set("wohnort")} ariaLabel="Wohnort" /></td>
        </tr>
        <tr>
          <th>Telefon P</th>
          <td><PrintField value={mieter.telefonP} onChange={set("telefonP")} ariaLabel="Telefon P" /></td>
          <th>Telefon G</th>
          <td><PrintField value={mieter.telefonG} onChange={set("telefonG")} ariaLabel="Telefon G" /></td>
        </tr>
      </tbody>
    </table>
  );
}
```

- [ ] **Step 2: EquipmentTable**

`src/components/EquipmentTable.tsx`:
```tsx
import { EQUIPMENT, SERVICES } from "@/data/equipment";
import { formatChf } from "@/lib/calc";
import type { ExtraRow, RowInput } from "@/lib/form";
import { PrintField } from "./PrintField";
import type { PageProps } from "./types";

const fmt = (rappen: number | null) => (rappen === null ? "" : formatChf(rappen));

export function EquipmentTable({ form, totals, update }: PageProps) {
  const setRow = (i: number, patch: Partial<RowInput>) =>
    update({ rows: form.rows.map((r, j) => (j === i ? { ...r, ...patch } : r)) });
  const setExtra = (patch: Partial<ExtraRow>) => update({ extra: { ...form.extra, ...patch } });
  const setService = (i: number, value: string) =>
    update({ services: form.services.map((s, j) => (j === i ? value : s)) });

  return (
    <table className="equip mt-6">
      <colgroup>
        <col style={{ width: "22%" }} />
        <col style={{ width: "17%" }} />
        <col style={{ width: "20%" }} />
        <col style={{ width: "10%" }} />
        <col style={{ width: "9%" }} />
        <col style={{ width: "22%" }} />
      </colgroup>
      <thead>
        <tr>
          <th>Mietgegenstand</th>
          <th>Marke</th>
          <th>Modell</th>
          <th className="num">Preis</th>
          <th className="num">Anzahl</th>
          <th>Mietpreis</th>
        </tr>
      </thead>
      <tbody>
        {EQUIPMENT.map((e, i) => (
          <tr key={i}>
            <td>{e.category}</td>
            <td>{e.brand}</td>
            <td>{e.model}</td>
            <td>
              <PrintField
                value={form.rows[i].preis}
                onChange={(v) => setRow(i, { preis: v })}
                ariaLabel={`Preis ${e.brand} ${e.model}`.trim()}
                align="right"
              />
            </td>
            <td>
              <PrintField
                value={form.rows[i].anzahl}
                onChange={(v) => setRow(i, { anzahl: v })}
                ariaLabel={`Anzahl ${e.brand} ${e.model}`.trim()}
                align="right"
              />
            </td>
            <td>
              <div className="money">
                <span>Fr.</span>
                <span>{fmt(totals.rowPrices[i])}</span>
              </div>
            </td>
          </tr>
        ))}

        <tr>
          <td><PrintField value={form.extra.mietgegenstand} onChange={(v) => setExtra({ mietgegenstand: v })} ariaLabel="Weiterer Mietgegenstand" /></td>
          <td><PrintField value={form.extra.marke} onChange={(v) => setExtra({ marke: v })} ariaLabel="Weitere Marke" /></td>
          <td><PrintField value={form.extra.modell} onChange={(v) => setExtra({ modell: v })} ariaLabel="Weiteres Modell" /></td>
          <td><PrintField value={form.extra.preis} onChange={(v) => setExtra({ preis: v })} ariaLabel="Weiterer Preis" align="right" /></td>
          <td><PrintField value={form.extra.anzahl} onChange={(v) => setExtra({ anzahl: v })} ariaLabel="Weitere Anzahl" align="right" /></td>
          <td>
            <div className="money">
              <span>Fr.</span>
              <span>{fmt(totals.extraPrice)}</span>
            </div>
          </td>
        </tr>

        {SERVICES.map((label, i) => (
          <tr key={label}>
            <td colSpan={3}>{label}</td>
            <td />
            <td />
            <td>
              <div className="money">
                <span>Fr.</span>
                <PrintField value={form.services[i]} onChange={(v) => setService(i, v)} ariaLabel={label} align="right" />
              </div>
            </td>
          </tr>
        ))}

        <tr className="total">
          <td colSpan={4} />
          <th>Total</th>
          <td>
            <div className="money">
              <span>Fr.</span>
              <span>{totals.total > 0 ? formatChf(totals.total) : ""}</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/CustomerFields.tsx src/components/EquipmentTable.tsx
git commit -m "feat: add customer fields and equipment table"
```

---

### Task 9: Sheet 1

**Files:**
- Create: `src/components/Page1.tsx`

- [ ] **Step 1: Implement**

`src/components/Page1.tsx`:
```tsx
import Image from "next/image";
import { HEADER_LINES, INTRO_TEXT } from "@/data/texts";
import type { FormState } from "@/lib/form";
import { CustomerFields } from "./CustomerFields";
import { EquipmentTable } from "./EquipmentTable";
import { PrintField } from "./PrintField";
import type { PageProps } from "./types";

export function Page1({ form, totals, update }: PageProps) {
  const setAn = (key: keyof FormState["an"]) => (value: string) => update({ an: { ...form.an, [key]: value } });

  return (
    <section className="sheet">
      <header className="flex items-start justify-between gap-6">
        <Image src="/reist_logo.png" alt="Radio TV Reist" width={640} height={232} className="logo" priority />
        <ul className="header-lines">
          {HEADER_LINES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </header>

      <div className="mt-6 flex items-end justify-between gap-6">
        <h1 className="title">Miet- und Servicevertrag</h1>
        <table className="grid-table an">
          <tbody>
            <tr>
              <th />
              <td>An</td>
            </tr>
            <tr>
              <th>Name</th>
              <td><PrintField value={form.an.name} onChange={setAn("name")} ariaLabel="An Name" /></td>
            </tr>
            <tr>
              <th>Adresse</th>
              <td><PrintField value={form.an.adresse} onChange={setAn("adresse")} ariaLabel="An Adresse" /></td>
            </tr>
            <tr>
              <th>Wohnort</th>
              <td><PrintField value={form.an.wohnort} onChange={setAn("wohnort")} ariaLabel="An Wohnort" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <CustomerFields mieter={form.mieter} onChange={(mieter) => update({ mieter })} />

      <EquipmentTable form={form} totals={totals} update={update} />

      <div className="intro">
        {INTRO_TEXT.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <table className="grid-table footer">
        <tbody>
          <tr>
            <th>Datum:</th>
            <th>Der Mieter:</th>
            <th>Der Vermieter:</th>
          </tr>
          <tr>
            <td>
              <PrintField value={form.datum} onChange={(v) => update({ datum: v })} ariaLabel="Datum" placeholder="TT.MM.JJJJ" />
            </td>
            <td />
            <td>Radio TV Reist</td>
          </tr>
          <tr>
            <th>
              <span className="flex items-center gap-1">
                Quittung Miete vom:
                <PrintField value={form.quittungVon} onChange={(v) => update({ quittungVon: v })} ariaLabel="Quittung vom" placeholder="TT.MM.JJJJ" className="flex-1" />
              </span>
            </th>
            <th>
              <span className="flex items-center gap-1">
                bis:
                <PrintField value={form.quittungBis} onChange={(v) => update({ quittungBis: v })} ariaLabel="Quittung bis" placeholder="TT.MM.JJJJ" className="flex-1" />
              </span>
            </th>
            <th>Unterschrift:</th>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/Page1.tsx
git commit -m "feat: add contract sheet 1"
```

---

### Task 10: Sheet 2 (articles)

**Files:**
- Create: `src/components/Page2.tsx`

- [ ] **Step 1: Implement**

`src/components/Page2.tsx`:
```tsx
import { STATIC_ARTICLES, type Article as ArticleData } from "@/data/texts";
import { AutoField } from "./AutoField";
import { PrintField } from "./PrintField";
import type { PageProps } from "./types";

function Article({ nr, title, bold = false, children }: { nr: number; title: string; bold?: boolean; children: React.ReactNode }) {
  return (
    <div className="article">
      <div className="art-nr">Art. {nr}</div>
      <div className={bold ? "font-bold" : ""}>{children}</div>
      <div className="art-title">{title}</div>
    </div>
  );
}

function StaticArticle({ article }: { article: ArticleData }) {
  return (
    <Article nr={article.nr} title={article.title} bold={article.bold}>
      {article.text}
    </Article>
  );
}

export function Page2({ form, totals, update }: PageProps) {
  const art6 = STATIC_ARTICLES.filter((a) => a.nr === 6);
  const after7 = STATIC_ARTICLES.filter((a) => a.nr > 7);

  return (
    <section className="sheet">
      <Article nr={2} title="Vorgesehener Gebrauch">
        Die Mietgegenstände{" "}
        <PrintField value={form.gebrauch} onChange={(v) => update({ gebrauch: v })} ariaLabel="Vorgesehener Gebrauch" line className="w-[75%]" />
      </Article>

      <Article nr={3} title="Mietdauer">
        Die Miete dauert vom{" "}
        <PrintField value={form.mietdauerVon} onChange={(v) => update({ mietdauerVon: v })} ariaLabel="Miete vom" placeholder="TT.MM.JJJJ" line className="w-40" />{" "}
        bis{" "}
        <PrintField value={form.mietdauerBis} onChange={(v) => update({ mietdauerBis: v })} ariaLabel="Miete bis" placeholder="TT.MM.JJJJ" line className="w-40" />
      </Article>

      <Article nr={4} title="Mietzins">
        Der Mietzins beträgt Fr.{" "}
        <AutoField
          value={totals.mietzins}
          overridden={form.mietzins !== null}
          onChange={(v) => update({ mietzins: v })}
          onReset={() => update({ mietzins: null })}
          ariaLabel="Mietzins"
        />
        . Er ist im Voraus, spätestens am Tage vor der Montage zu bezahlen. Reparaturen, Montage und Demontage sind darin inbegriffen.
      </Article>

      <Article nr={5} title="Transportkosten">
        Die Transportkosten von Fr.{" "}
        <PrintField value={form.transport} onChange={(v) => update({ transport: v })} ariaLabel="Transportkosten" align="right" line className="w-32" />{" "}
        bei Beginn und Ende der Miete gehen zu Lasten des Mieters. Sie sind gleichzeitig mit dem Mietzins vorauszuzahlen.
      </Article>

      {art6.map((a) => (
        <StaticArticle key={a.nr} article={a} />
      ))}

      <Article nr={7} title="Kaution">
        Der Mieter ist zur Leistung einer gleichzeitig mit dem Mietzins vorauszahlbaren Kaution in der Höhe von einem Drittel des Mietzinses, ausmachend Fr.{" "}
        <AutoField
          value={totals.kaution}
          overridden={form.kaution !== null}
          onChange={(v) => update({ kaution: v })}
          onReset={() => update({ kaution: null })}
          ariaLabel="Kaution"
        />{" "}
        verpflichtet. Diese dient insbesondere der Sicherung der Ansprüche gemäss Art. 8, Art. 11 und Art. 12 dieses Vertrages.
      </Article>

      {after7.map((a) => (
        <StaticArticle key={a.nr} article={a} />
      ))}

      <Article nr={17} title="">
        Besondere Abmachungen:
        <textarea
          className="abmachungen"
          value={form.abmachungen}
          aria-label="Besondere Abmachungen"
          onChange={(e) => update({ abmachungen: e.target.value })}
        />
      </Article>
    </section>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/Page2.tsx
git commit -m "feat: add contract sheet 2 with articles"
```

---

### Task 11: Wire up the page

**Files:**
- Create: `src/components/ContractForm.tsx`
- Modify: `src/app/page.tsx` (replace whole file)

`ContractForm` reads the draft in its `useState` initializer, so it must never render on the server (there's no `localStorage` there). `page.tsx` loads it with `ssr: false` for that reason.

- [ ] **Step 1: ContractForm**

`src/components/ContractForm.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { computeTotals, emptyForm, type FormState } from "@/lib/form";
import { clearDraft, loadDraft, saveDraft } from "@/lib/storage";
import { Page1 } from "./Page1";
import { Page2 } from "./Page2";
import { Toolbar } from "./Toolbar";

export default function ContractForm() {
  const [form, setForm] = useState<FormState>(() => loadDraft() ?? emptyForm());

  useEffect(() => {
    saveDraft(form);
  }, [form]);

  const totals = computeTotals(form);
  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <>
      <Toolbar
        onNew={() => {
          clearDraft();
          setForm(emptyForm());
        }}
      />
      <main className="sheets">
        <Page1 form={form} totals={totals} update={update} />
        <Page2 form={form} totals={totals} update={update} />
      </main>
    </>
  );
}
```

- [ ] **Step 2: page.tsx**

`src/app/page.tsx`:
```tsx
"use client";

import dynamic from "next/dynamic";

// Client-only: the form reads its draft from localStorage on first render.
const ContractForm = dynamic(() => import("@/components/ContractForm"), { ssr: false });

export default function Home() {
  return <ContractForm />;
}
```

- [ ] **Step 3: Run tests and build**

Run: `npm test && npm run build`
Expected: all tests PASS, build succeeds, `out/index.html` exists.

- [ ] **Step 4: Manual check in the browser**

Run: `npm run dev` and open http://localhost:3000.
Check each item:
1. Logo, header lines, title and all 20 equipment rows are visible, and Preis shows `80.–`, `150.–` …
2. Type `2` in Anzahl of the Philips LBB 1143 row. Mietpreis shows `160.–`, Total `160.–`. On sheet 2, Art. 4 shows `160.–` and Art. 7 shows `53.35`.
3. Type `300` in Art. 4. Art. 7 changes to `100.–` and a ↺ button appears. Click ↺, and Art. 4 goes back to `160.–`.
4. Reload the page. All entries are still there.
5. Click Neu, then Abbrechen. Nothing is deleted. Click Neu, then Ja. Everything is empty and Preis is back to the defaults.

- [ ] **Step 5: Commit**

```bash
git add src/components/ContractForm.tsx src/app/page.tsx
git commit -m "feat: wire up contract form with draft saving"
```

---

### Task 12: Print check

**Files:**
- Modify (only if needed): `src/app/globals.css`

- [ ] **Step 1: Print to PDF**

With `npm run dev` running, fill in a few fields (name, 2–3 equipment rows, Montage, Mietdauer, Art. 17 text). Click **Drucken**, choose "Save as PDF" / "Als PDF speichern", paper A4, margins "Default", and save.

Check:
1. The PDF has **exactly 2 pages**: sheet 1 on page 1, the articles on page 2.
2. No toolbar, no blue field backgrounds, no ↺ buttons, no "TT.MM.JJJJ" placeholders.
3. Filled values are printed. Empty blanks in Art. 2, 3, 4, 5, 7 show a black line. Art. 17 shows 4 lines.
4. Do the same check in Edge.

- [ ] **Step 2: Fix overflow if needed**

If sheet 1 spills onto a third page, make the rows smaller in `src/app/globals.css` and check again:
- In `.equip th, .equip td` change `height: 5.6mm;` to `height: 5.2mm;`
- If it still doesn't fit, also add this inside `@media print`: `.sheet { font-size: 9pt; }`

If sheet 2 spills over, in `.article` change `padding: 2.2mm 0;` to `padding: 1.5mm 0;`.

- [ ] **Step 3: Commit (only if CSS changed)**

```bash
git add src/app/globals.css
git commit -m "fix: fit both sheets on one A4 page each"
```

---

### Task 13: CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Write the file**

`CLAUDE.md`:
````markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A digital version of Radio TV Reist's paper "Miet- und Servicevertrag" (sound equipment rental contract). One page, fill in, press "Drucken", get exactly two A4 pages. No backend, no database. Deployed as a static site on Cloudflare Pages (free plan). UI and printed text are German, and amounts use Swiss format (`1'250.–`).

Design spec: `docs/superpowers/specs/2026-10-04-mietvertrag-app-design.md`. Original paper form: `../scan.pdf`.

## Commands

```bash
npm run dev          # http://localhost:3000
npm run build        # static export to out/ (also the type check, there is no ESLint)
npm test             # Vitest, all tests
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

## Styling and print gotchas

- Tailwind v4. Custom CSS in `globals.css` must stay inside `@layer components`, or it overrides Tailwind utilities.
- Print layout: `@media print` in `globals.css`. `.no-print` hides elements, and `.field-line` keeps a black underline on blanks in printed text. After layout changes, print to PDF and check it's still exactly 2 pages.
````

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md"
```

---

### Task 14: Deploy to Cloudflare Pages

These steps need the user's own GitHub and Cloudflare accounts, so the user does them (an agent guides them through it).

- [ ] **Step 1: Push to GitHub**

On github.com, create a new **private** repository named `reist-mietvertrag`, without a README. Then:
```bash
git remote add origin https://github.com/<USERNAME>/reist-mietvertrag.git
git branch -M main
git push -u origin main
```
Expected: the code is visible on GitHub.

- [ ] **Step 2: Create the Cloudflare Pages project**

1. Go to dash.cloudflare.com (create a free account if needed) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select the `reist-mietvertrag` repository.
3. Build settings:
   - Framework preset: **Next.js (Static HTML Export)**
   - Build command: `npm run build`
   - Build output directory: `out`
4. **Save and Deploy**.

Expected: the build finishes and the site is live at `https://reist-mietvertrag.pages.dev` (or a similar name).

- [ ] **Step 3: Check the live site**

Open the live URL and repeat the checks from Task 11 Step 4 and the 2-page PDF check from Task 12 Step 1.

From now on, every `git push` to `main` deploys automatically.
