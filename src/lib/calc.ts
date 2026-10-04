/** Parses a CHF amount ("80", "80.50", "80,5", "80.–", "1'250.50", "Fr. 45") into Rappen. */
export function parseChf(input: string): number | null {
  const cleaned = input
    .trim()
    .replace(/^(Fr\.?|CHF)\s*/i, "")
    .replace(/['’\s]/g, "")
    .replace(/[.,]?[–-]+$/, "")
    .replace(",", ".");
  if (!/^(\d+\.?\d{0,2}|\.\d{1,2})$/.test(cleaned)) return null;
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
