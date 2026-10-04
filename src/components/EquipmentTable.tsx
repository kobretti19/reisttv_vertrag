import { EQUIPMENT, SERVICES } from "@/data/equipment";
import { formatChf } from "@/lib/calc";
import type { ExtraRow, RowInput } from "@/lib/form";
import { PrintField } from "./PrintField";
import type { PageProps } from "./types";

const fmt = (rappen: number | null) => (rappen === null ? "" : formatChf(rappen));

export function EquipmentTable({ form, totals, update }: PageProps) {
  const setRow = (i: number, patch: Partial<RowInput>) =>
    update({ rows: form.rows.map((r, j) => (j === i ? { ...r, ...patch } : r)) });
  const setExtra = (patch: Partial<ExtraRow>) => update({ extra: { ...form.extra, ...patch } });
  const setService = (i: number, value: string) =>
    update({ services: form.services.map((s, j) => (j === i ? value : s)) });

  return (
    <table className="equip mt-4">
      <colgroup>
        <col style={{ width: "22%" }} />
        <col style={{ width: "17%" }} />
        <col style={{ width: "20%" }} />
        <col style={{ width: "10%" }} />
        <col style={{ width: "9%" }} />
        <col style={{ width: "22%" }} />
      </colgroup>
      <thead>
        <tr>
          <th>Mietgegenstand</th>
          <th>Marke</th>
          <th>Modell</th>
          <th className="num">Preis</th>
          <th className="num">Anzahl</th>
          <th>Mietpreis</th>
        </tr>
      </thead>
      <tbody>
        {EQUIPMENT.map((e, i) => (
          <tr key={i}>
            <td>{e.category}</td>
            <td>{e.brand}</td>
            <td>{e.model}</td>
            <td>
              <PrintField
                value={form.rows[i].preis}
                onChange={(v) => setRow(i, { preis: v })}
                ariaLabel={`Preis ${e.brand} ${e.model}`.trim()}
                align="right"
              />
            </td>
            <td>
              <PrintField
                value={form.rows[i].anzahl}
                onChange={(v) => setRow(i, { anzahl: v })}
                ariaLabel={`Anzahl ${e.brand} ${e.model}`.trim()}
                align="right"
              />
            </td>
            <td>
              <div className="money">
                <span>Fr.</span>
                <span>{fmt(totals.rowPrices[i])}</span>
              </div>
            </td>
          </tr>
        ))}

        <tr>
          <td><PrintField value={form.extra.mietgegenstand} onChange={(v) => setExtra({ mietgegenstand: v })} ariaLabel="Weiterer Mietgegenstand" /></td>
          <td><PrintField value={form.extra.marke} onChange={(v) => setExtra({ marke: v })} ariaLabel="Weitere Marke" /></td>
          <td><PrintField value={form.extra.modell} onChange={(v) => setExtra({ modell: v })} ariaLabel="Weiteres Modell" /></td>
          <td><PrintField value={form.extra.preis} onChange={(v) => setExtra({ preis: v })} ariaLabel="Weiterer Preis" align="right" /></td>
          <td><PrintField value={form.extra.anzahl} onChange={(v) => setExtra({ anzahl: v })} ariaLabel="Weitere Anzahl" align="right" /></td>
          <td>
            <div className="money">
              <span>Fr.</span>
              <span>{fmt(totals.extraPrice)}</span>
            </div>
          </td>
        </tr>

        {SERVICES.map((label, i) => (
          <tr key={label}>
            <td colSpan={3}>{label}</td>
            <td />
            <td />
            <td>
              <div className="money">
                <span>Fr.</span>
                <PrintField value={form.services[i]} onChange={(v) => setService(i, v)} ariaLabel={label} align="right" />
              </div>
            </td>
          </tr>
        ))}

        <tr className="total">
          <td colSpan={4} />
          <th>Total</th>
          <td>
            <div className="money">
              <span>Fr.</span>
              <span>{totals.total > 0 ? formatChf(totals.total) : ""}</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
