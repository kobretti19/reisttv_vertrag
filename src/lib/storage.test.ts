import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { computeTotals, emptyForm } from "./form";
import { loadDraft, saveDraft } from "./storage";

const KEY = "reist-vertrag-draft";
let store: Map<string, string>;

beforeEach(() => {
  store = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("loadDraft", () => {
  it("returns null without a draft", () => {
    expect(loadDraft()).toBeNull();
  });
  it("returns null for invalid JSON", () => {
    store.set(KEY, "{nope");
    expect(loadDraft()).toBeNull();
  });
  it("round-trips a saved draft", () => {
    const f = emptyForm();
    f.mieter.name = "Muster";
    f.rows[0] = { preis: "90", anzahl: "2" };
    saveDraft(f);
    expect(loadDraft()).toEqual(f);
  });
  it("uses default rows when the length differs", () => {
    store.set(KEY, JSON.stringify({ rows: [{ preis: "1", anzahl: "1" }] }));
    expect(loadDraft()!.rows).toEqual(emptyForm().rows);
  });
  it("repairs null rows and rows with missing fields", () => {
    const rows: unknown[] = emptyForm().rows.map((r) => ({ ...r }));
    rows[0] = null;
    rows[1] = { anzahl: "3" };
    store.set(KEY, JSON.stringify({ rows, services: [1, null, "100", "x"] }));
    const d = loadDraft()!;
    expect(() => computeTotals(d)).not.toThrow();
    expect(d.rows[0].preis).toBe(emptyForm().rows[0].preis);
    expect(d.rows[1]).toEqual({ preis: emptyForm().rows[1].preis, anzahl: "3" });
    expect(d.services).toEqual(["", "", "100", "x"]);
  });
  it("fills missing nested keys", () => {
    store.set(KEY, JSON.stringify({ mieter: { name: "A" } }));
    const d = loadDraft()!;
    expect(d.mieter.name).toBe("A");
    expect(d.mieter.telefonG).toBe("");
  });
});
