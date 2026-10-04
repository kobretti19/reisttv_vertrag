import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearCurrentId,
  deleteFromArchive,
  exportArchive,
  getCurrentId,
  importArchive,
  loadArchive,
  saveToArchive,
  setCurrentId,
} from "./archive";
import { computeTotals, emptyForm } from "./form";

let store: Map<string, string>;

beforeEach(() => {
  store = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const formWith = (name: string) => {
  const f = emptyForm();
  f.mieter.name = name;
  return f;
};

describe("archive", () => {
  it("starts empty", () => {
    expect(loadArchive()).toEqual([]);
  });
  it("creates an entry", () => {
    const e = saveToArchive(formWith("A"), null);
    expect(e.id).toBeTruthy();
    expect(loadArchive()).toHaveLength(1);
    expect(loadArchive()[0].form.mieter.name).toBe("A");
  });
  it("updates the same id instead of copying", () => {
    const e = saveToArchive(formWith("A"), null);
    const e2 = saveToArchive(formWith("B"), e.id);
    expect(e2.id).toBe(e.id);
    expect(loadArchive()).toHaveLength(1);
    expect(loadArchive()[0].form.mieter.name).toBe("B");
  });
  it("orders newest first", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T10:00:00Z"));
    saveToArchive(formWith("old"), null);
    vi.setSystemTime(new Date("2026-01-02T10:00:00Z"));
    saveToArchive(formWith("new"), null);
    expect(loadArchive().map((e) => e.form.mieter.name)).toEqual(["new", "old"]);
  });
  it("deletes", () => {
    const e = saveToArchive(formWith("A"), null);
    saveToArchive(formWith("B"), null);
    deleteFromArchive(e.id);
    expect(loadArchive().map((x) => x.form.mieter.name)).toEqual(["B"]);
  });
  it("round-trips export and import", () => {
    const e = saveToArchive(formWith("A"), null);
    const json = exportArchive();
    deleteFromArchive(e.id);
    expect(importArchive(json)).toBe(1);
    expect(loadArchive()).toEqual([e]);
  });
  it("keeps the newer savedAt on merge", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T10:00:00Z"));
    const e = saveToArchive(formWith("old"), null);
    importArchive(
      JSON.stringify([{ id: e.id, savedAt: "2026-02-01T00:00:00.000Z", form: formWith("newer") }]),
    );
    expect(loadArchive()[0].form.mieter.name).toBe("newer");
    importArchive(
      JSON.stringify([{ id: e.id, savedAt: "2025-01-01T00:00:00.000Z", form: formWith("older") }]),
    );
    expect(loadArchive()[0].form.mieter.name).toBe("newer");
  });
  it("leaves the archive unchanged on invalid import", () => {
    saveToArchive(formWith("A"), null);
    expect(() => importArchive("{nope")).toThrow();
    expect(() => importArchive('{"a":1}')).toThrow();
    expect(() => importArchive('[{"x":1}]')).toThrow();
    expect(loadArchive()).toHaveLength(1);
  });
  it("skips invalid entries and normalises malformed forms", () => {
    const bad = JSON.stringify([
      { savedAt: "2026-01-01T00:00:00Z", form: {} },
      { id: "x" },
      { id: "m", savedAt: "2026-01-01T00:00:00Z", form: { rows: [null], mieter: "oops" } },
    ]);
    expect(importArchive(bad)).toBe(1);
    const [e] = loadArchive();
    expect(e.id).toBe("m");
    expect(() => computeTotals(e.form)).not.toThrow();
  });
  it("persists the current id", () => {
    expect(getCurrentId()).toBeNull();
    setCurrentId("abc");
    expect(getCurrentId()).toBe("abc");
    clearCurrentId();
    expect(getCurrentId()).toBeNull();
  });
});
