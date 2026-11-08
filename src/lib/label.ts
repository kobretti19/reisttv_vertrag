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

const byNewest = (a: LabelEntry, b: LabelEntry) => Date.parse(b.savedAt) - Date.parse(a.savedAt);

/** Reads saved labels from untrusted data (localStorage, JSON file), newest first. Non-arrays give []. */
export function parseLabelEntries(data: unknown): LabelEntry[] {
  if (!Array.isArray(data)) return [];
  const out: LabelEntry[] = [];
  for (const raw of data) {
    if (!raw || typeof raw !== "object") continue;
    const e = raw as Record<string, unknown>;
    if (typeof e.id !== "string" || !e.id) continue;
    const savedAt =
      typeof e.savedAt === "string" && !Number.isNaN(Date.parse(e.savedAt)) ? e.savedAt : new Date(0).toISOString();
    out.push({ id: e.id, savedAt, label: normalizeLabel(e.label) });
  }
  return out.sort(byNewest);
}

/** Saved labels from localStorage, newest first. */
export function loadLabels(): LabelEntry[] {
  try {
    return parseLabelEntries(JSON.parse(localStorage.getItem(ARCHIVE_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

export function storeLabels(list: LabelEntry[]): void {
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

/** A new entry for `label`, or the updated version of entry `id`. */
export function newLabelEntry(label: Label, id: string | null): LabelEntry {
  return { id: id ?? newId(), savedAt: new Date().toISOString(), label: { ...label } };
}

/** Puts `entry` first, replacing an older version with the same id. */
export function upsertLabel(list: LabelEntry[], entry: LabelEntry): LabelEntry[] {
  return [entry, ...list.filter((e) => e.id !== entry.id)];
}

export function removeLabel(list: LabelEntry[], id: string): LabelEntry[] {
  return list.filter((e) => e.id !== id);
}

/** Union by id; when both lists have an entry, the newer savedAt wins. */
export function mergeLabels(a: LabelEntry[], b: LabelEntry[]): LabelEntry[] {
  const byId = new Map(a.map((e) => [e.id, e]));
  for (const e of b) {
    const have = byId.get(e.id);
    if (!have || Date.parse(e.savedAt) > Date.parse(have.savedAt)) byId.set(e.id, e);
  }
  return [...byId.values()].sort(byNewest);
}

/** Creates a new entry in localStorage, or updates the one with `id`. */
export function saveLabel(label: Label, id: string | null): LabelEntry {
  const entry = newLabelEntry(label, id);
  storeLabels(upsertLabel(loadLabels(), entry));
  return entry;
}

export function deleteLabel(id: string): void {
  storeLabels(removeLabel(loadLabels(), id));
}

/** Parses a label JSON backup. Empty text is an empty list; anything that isn't a JSON array throws. */
export function parseLabelFile(text: string): LabelEntry[] {
  if (!text.trim()) return [];
  const data: unknown = JSON.parse(text);
  if (!Array.isArray(data)) throw new Error("not a label file");
  return parseLabelEntries(data);
}

export const labelsJson = (list: LabelEntry[]) => JSON.stringify(list, null, 2);
