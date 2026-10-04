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
  it("accepts trailing dot, leading-dot decimals and CHF/Fr prefixes", () => {
    expect(parseChf("80.")).toBe(8000);
    expect(parseChf(".50")).toBe(50);
    expect(parseChf("CHF 45")).toBe(4500);
    expect(parseChf("Fr 45")).toBe(4500);
  });
  it("returns null for empty or invalid input", () => {
    expect(parseChf("")).toBeNull();
    expect(parseChf("   ")).toBeNull();
    expect(parseChf("abc")).toBeNull();
    expect(parseChf("-5")).toBeNull();
    expect(parseChf("1.234")).toBeNull();
    expect(parseChf("–")).toBeNull();
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
