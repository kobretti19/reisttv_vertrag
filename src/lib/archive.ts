import type { FormState } from "./form";
import { normalizeForm } from "./storage";

export type ArchiveEntry = { id: string; savedAt: string; form: FormState };

const ARCHIVE_KEY = "reist-vertraege-archive";
const CURRENT_KEY = "reist-vertrag-current-id";

function parseEntries(data: unknown): ArchiveEntry[] {
  if (!Array.isArray(data)) return [];
  const out: ArchiveEntry[] = [];
  for (const raw of data) {
    if (!raw || typeof raw !== "object") continue;
    const e = raw as Record<string, unknown>;
    if (typeof e.id !== "string" || !e.id) continue;
    if (!e.form || typeof e.form !== "object") continue;
    const savedAt =
      typeof e.savedAt === "string" && !Number.isNaN(Date.parse(e.savedAt))
        ? e.savedAt
        : new Date(0).toISOString();
    out.push({ id: e.id, savedAt, form: normalizeForm(e.form) });
  }
  return out;
}

const sortNewestFirst = (list: ArchiveEntry[]) =>
  [...list].sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt));

function write(list: ArchiveEntry[]): void {
  try {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(list));
  } catch {
    // Storage full or blocked: nothing we can do here.
  }
}

/** All saved contracts, newest first. */
export function loadArchive(): ArchiveEntry[] {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    if (!raw) return [];
    return sortNewestFirst(parseEntries(JSON.parse(raw)));
  } catch {
    return [];
  }
}

function newId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // fall through
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Creates a new entry, or updates the one with `id` (re-creating it under that id if it was deleted meanwhile). */
export function saveToArchive(form: FormState, id: string | null): ArchiveEntry {
  const entry: ArchiveEntry = {
    id: id ?? newId(),
    savedAt: new Date().toISOString(),
    form: JSON.parse(JSON.stringify(form)) as FormState,
  };
  write(sortNewestFirst([entry, ...loadArchive().filter((e) => e.id !== entry.id)]));
  return entry;
}

export function deleteFromArchive(id: string): void {
  write(loadArchive().filter((e) => e.id !== id));
}

export function exportArchive(): string {
  return JSON.stringify(loadArchive(), null, 2);
}

/** Merges a backup file into the archive by id (newer savedAt wins). Returns the number of valid entries read; throws on invalid files without touching the archive. */
export function importArchive(json: string): number {
  const data: unknown = JSON.parse(json);
  if (!Array.isArray(data)) throw new Error("invalid archive");
  const incoming = parseEntries(data);
  if (data.length > 0 && incoming.length === 0) throw new Error("invalid archive");
  const byId = new Map(loadArchive().map((e) => [e.id, e]));
  for (const e of incoming) {
    const have = byId.get(e.id);
    if (!have || Date.parse(e.savedAt) > Date.parse(have.savedAt)) byId.set(e.id, e);
  }
  write(sortNewestFirst([...byId.values()]));
  return incoming.length;
}

export function getCurrentId(): string | null {
  try {
    return localStorage.getItem(CURRENT_KEY);
  } catch {
    return null;
  }
}

export function setCurrentId(id: string): void {
  try {
    localStorage.setItem(CURRENT_KEY, id);
  } catch {
    // Ignore, see write.
  }
}

export function clearCurrentId(): void {
  try {
    localStorage.removeItem(CURRENT_KEY);
  } catch {
    // Ignore, see write.
  }
}
