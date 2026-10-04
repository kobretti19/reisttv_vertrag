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

  it("gives no Kaution for an unparseable manual Mietzins", () => {
    const f = emptyForm();
    f.rows[0] = { preis: "80.–", anzahl: "2" };
    f.mietzins = "ca. 300";
    const t = computeTotals(f);
    expect(t.mietzins).toBe("ca. 300");
    expect(t.kaution).toBe("");
  });

  it("keeps an emptied manual Mietzins empty", () => {
    const f = emptyForm();
    f.rows[0] = { preis: "80.–", anzahl: "2" };
    f.mietzins = "";
    const t = computeTotals(f);
    expect(t.mietzins).toBe("");
    expect(t.kaution).toBe("");
  });
});
