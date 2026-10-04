import Image from "next/image";
import { HEADER_LINES, INTRO_TEXT } from "@/data/texts";
import type { FormState } from "@/lib/form";
import { CustomerFields } from "./CustomerFields";
import { EquipmentTable } from "./EquipmentTable";
import { PrintField } from "./PrintField";
import type { PageProps } from "./types";

export function Page1({ form, totals, update }: PageProps) {
  const setAn = (key: keyof FormState["an"]) => (value: string) => update({ an: { ...form.an, [key]: value } });

  return (
    <section className="sheet">
      <header className="page-header flex items-start justify-between gap-6">
        <Image src="/reist_logo.png" alt="Radio TV Reist" width={640} height={232} className="logo" priority />
        <ul className="header-lines">
          {HEADER_LINES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </header>

      <div className="title-row mt-4 flex items-end justify-between gap-6">
        <h1 className="title">Miet- und Servicevertrag</h1>
        <table className="grid-table an">
          <tbody>
            <tr>
              <th />
              <td>An</td>
            </tr>
            <tr>
              <th>Name</th>
              <td><PrintField value={form.an.name} onChange={setAn("name")} ariaLabel="An Name" /></td>
            </tr>
            <tr>
              <th>Adresse</th>
              <td><PrintField value={form.an.adresse} onChange={setAn("adresse")} ariaLabel="An Adresse" /></td>
            </tr>
            <tr>
              <th>Wohnort</th>
              <td><PrintField value={form.an.wohnort} onChange={setAn("wohnort")} ariaLabel="An Wohnort" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <CustomerFields mieter={form.mieter} onChange={(mieter) => update({ mieter })} />

      <EquipmentTable form={form} totals={totals} update={update} />

      <div className="intro">
        {INTRO_TEXT.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <table className="grid-table footer">
        <tbody>
          <tr>
            <th>Datum:</th>
            <th>Der Mieter:</th>
            <th>Der Vermieter:</th>
          </tr>
          <tr>
            <td>
              <PrintField value={form.datum} onChange={(v) => update({ datum: v })} ariaLabel="Datum" placeholder="TT.MM.JJJJ" />
            </td>
            <td />
            <td>Radio TV Reist</td>
          </tr>
          <tr>
            <th>
              <span className="flex items-center gap-1">
                Quittung Miete vom:
                <PrintField value={form.quittungVon} onChange={(v) => update({ quittungVon: v })} ariaLabel="Quittung vom" placeholder="TT.MM.JJJJ" className="flex-1" />
              </span>
            </th>
            <th>
              <span className="flex items-center gap-1">
                bis:
                <PrintField value={form.quittungBis} onChange={(v) => update({ quittungBis: v })} ariaLabel="Quittung bis" placeholder="TT.MM.JJJJ" className="flex-1" />
              </span>
            </th>
            <th>Unterschrift:</th>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
