import { describe, expect, it } from "vitest";
import { labelPrice } from "./label";

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
