import { parseChf } from "./calc";

/** Price as printed on the shop label: "499" → "Fr. 499.00". Text that isn't an amount is kept as typed. */
export function labelPrice(input: string): string {
  const rappen = parseChf(input);
  if (rappen === null) return input.trim();
  const francs = String(Math.floor(rappen / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `Fr. ${francs}.${String(rappen % 100).padStart(2, "0")}`;
}
