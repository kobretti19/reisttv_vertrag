import { emptyForm, type FormState, type RowInput } from "./form";

const KEY = "reist-vertrag-draft";

const asObj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

/** Merges untrusted saved data (draft, archive entry, imported file) onto an empty form. */
export function normalizeForm(input: unknown): FormState {
  const saved = asObj(input) as Partial<FormState>;
  const base = emptyForm();
  return {
    ...base,
    ...saved,
    an: { ...base.an, ...asObj(saved.an) },
    mieter: { ...base.mieter, ...asObj(saved.mieter) },
    extra: { ...base.extra, ...asObj(saved.extra) },
    // If the equipment or service list changed since the draft was saved, start those fresh.
    // Same length: merge element-wise so bad entries can't break computeTotals.
    rows:
      Array.isArray(saved.rows) && saved.rows.length === base.rows.length
        ? base.rows.map((b, i) => {
            const r: Partial<RowInput> = asObj(saved.rows![i]);
            return {
              preis: typeof r.preis === "string" ? r.preis : b.preis,
              anzahl: typeof r.anzahl === "string" ? r.anzahl : b.anzahl,
            };
          })
        : base.rows,
    services:
      Array.isArray(saved.services) && saved.services.length === base.services.length
        ? saved.services.map((s) => (typeof s === "string" ? s : ""))
        : base.services,
  };
}

/** Returns the saved draft, or null if there is none or it can't be read. */
export function loadDraft(): FormState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return normalizeForm(JSON.parse(raw));
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
