import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteLabel,
  emptyLabel,
  labelPrice,
  loadLabels,
  mergeLabels,
  newLabelEntry,
  parseCopies,
  saveLabel,
} from "./label";
import { labelsJson, parseLabelFile } from "./labelFile";

describe("label JSON file", () => {
  it("round-trips entries", () => {
    const list = [newLabelEntry({ ...emptyLabel(), marke: "Metz", preis: "499" }, null)];
    expect(parseLabelFile(labelsJson(list))).toEqual(list);
  });
  it("treats an empty file as an empty list", () => {
    expect(parseLabelFile("")).toEqual([]);
    expect(parseLabelFile("  \n")).toEqual([]);
  });
  it("rejects files that aren't a label list", () => {
    expect(() => parseLabelFile('{"a":1}')).toThrow();
    expect(() => parseLabelFile("nope")).toThrow();
  });
});

describe("mergeLabels", () => {
  const e = (id: string, savedAt: string, preis: string) => ({ id, savedAt, label: { ...emptyLabel(), preis } });
  it("unions by id, newer savedAt wins, newest first", () => {
    const fromFile = [e("a", "2026-11-01T10:00:00Z", "100"), e("b", "2026-11-02T10:00:00Z", "200")];
    const local = [e("a", "2026-11-03T10:00:00Z", "150"), e("c", "2026-10-01T10:00:00Z", "300")];
    expect(mergeLabels(fromFile, local).map((x) => [x.id, x.label.preis])).toEqual([
      ["a", "150"],
      ["b", "200"],
      ["c", "300"],
    ]);
  });
});

describe("labelPrice", () => {
  it("formats parsable amounts like the paper label (Fr. 499.00)", () => {
    expect(labelPrice("499")).toBe("Fr. 499.00");
    expect(labelPrice("1299.5")).toBe("Fr. 1'299.50");
    expect(labelPrice("Fr. 45.–")).toBe("Fr. 45.00");
  });
  it("keeps unparsable text as typed and empty as empty", () => {
    expect(labelPrice("auf Anfrage")).toBe("auf Anfrage");
    expect(labelPrice("  ")).toBe("");
  });
});

describe("parseCopies", () => {
  it("clamps to 1–50", () => {
    expect(parseCopies("3")).toBe(3);
    expect(parseCopies("")).toBe(1);
    expect(parseCopies("0")).toBe(1);
    expect(parseCopies("abc")).toBe(1);
    expect(parseCopies("200")).toBe(50);
  });
});

describe("label archive", () => {
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

  const metz = { ...emptyLabel(), marke: "Metz", modell: "Blue 32MTB4001Y", preis: "499" };

  it("saves, updates by id and deletes", () => {
    const a = saveLabel(metz, null);
    saveLabel({ ...metz, preis: "449" }, a.id);
    expect(loadLabels()).toHaveLength(1);
    expect(loadLabels()[0].label.preis).toBe("449");
    const b = saveLabel({ ...metz, marke: "Sony" }, null);
    expect(loadLabels().map((e) => e.id)).toEqual([b.id, a.id]);
    deleteLabel(a.id);
    expect(loadLabels().map((e) => e.id)).toEqual([b.id]);
  });

  it("ignores broken storage data", () => {
    store.set("reist-etiketten-archive", JSON.stringify([null, { id: "x", label: { marke: 5, modell: "M" } }]));
    expect(loadLabels()).toEqual([
      { id: "x", savedAt: new Date(0).toISOString(), label: { ...emptyLabel(), modell: "M" } },
    ]);
    store.set("reist-etiketten-archive", "{not json");
    expect(loadLabels()).toEqual([]);
  });
});
