import { parseChf } from "./calc";

/** Price as printed on the shop label: "499" → "Fr. 499.00". Text that isn't an amount is kept as typed. */
export function labelPrice(input: string): string {
  const rappen = parseChf(input);
  if (rappen === null) return input.trim();
  const francs = String(Math.floor(rappen / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `Fr. ${francs}.${String(rappen % 100).padStart(2, "0")}`;
}

export type Label = { marke: string; modell: string; zusatz: string; preis: string };
export type LabelEntry = { id: string; savedAt: string; label: Label };

export const emptyLabel = (): Label => ({ marke: "", modell: "", zusatz: "", preis: "" });

const ARCHIVE_KEY = "reist-etiketten-archive";

/** Merges untrusted saved data onto an empty label. */
export function normalizeLabel(input: unknown): Label {
  const base = emptyLabel();
  if (!input || typeof input !== "object") return base;
  const raw = input as Record<string, unknown>;
  const out = { ...base };
  for (const k of Object.keys(base) as (keyof Label)[]) {
    if (typeof raw[k] === "string") out[k] = raw[k];
  }
  return out;
}

/** "Metz Blue 32MTB4001Y" */
export function labelName(l: Label): string {
  return [l.marke, l.modell].map((s) => s.trim()).filter(Boolean).join(" ");
}

/** Number of copies to print: whole number 1–50, anything else gives 1. */
export function parseCopies(input: string): number {
  const n = Number.parseInt(input, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 50);
}

/** Saved labels, newest first. */
export function loadLabels(): LabelEntry[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(ARCHIVE_KEY) ?? "[]");
    if (!Array.isArray(data)) return [];
    const out: LabelEntry[] = [];
    for (const raw of data) {
      if (!raw || typeof raw !== "object") continue;
      const e = raw as Record<string, unknown>;
      if (typeof e.id !== "string" || !e.id) continue;
      const savedAt = typeof e.savedAt === "string" && !Number.isNaN(Date.parse(e.savedAt)) ? e.savedAt : new Date(0).toISOString();
      out.push({ id: e.id, savedAt, label: normalizeLabel(e.label) });
    }
    return out.sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt));
  } catch {
    return [];
  }
}

function writeLabels(list: LabelEntry[]): void {
  try {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(list));
  } catch {
    // Storage full or blocked: nothing we can do here.
  }
}

function newId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {
    // fall through
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Creates a new entry, or updates the one with `id`. */
export function saveLabel(label: Label, id: string | null): LabelEntry {
  const entry: LabelEntry = { id: id ?? newId(), savedAt: new Date().toISOString(), label: { ...label } };
  writeLabels([entry, ...loadLabels().filter((e) => e.id !== entry.id)]);
  return entry;
}

export function deleteLabel(id: string): void {
  writeLabels(loadLabels().filter((e) => e.id !== id));
}
