import type { FormState } from "@/lib/form";
import { PrintField } from "./PrintField";

type Mieter = FormState["mieter"];

export function CustomerFields({ mieter, onChange }: { mieter: Mieter; onChange: (m: Mieter) => void }) {
  const set = (key: keyof Mieter) => (value: string) => onChange({ ...mieter, [key]: value });

  return (
    <table className="grid-table cust mt-6 w-full">
      <tbody>
        <tr>
          <th>Name</th>
          <td><PrintField value={mieter.name} onChange={set("name")} ariaLabel="Name" /></td>
          <th>Vorname</th>
          <td><PrintField value={mieter.vorname} onChange={set("vorname")} ariaLabel="Vorname" /></td>
        </tr>
        <tr>
          <th>Strasse</th>
          <td><PrintField value={mieter.strasse} onChange={set("strasse")} ariaLabel="Strasse" /></td>
          <th>Wohnort</th>
          <td><PrintField value={mieter.wohnort} onChange={set("wohnort")} ariaLabel="Wohnort" /></td>
        </tr>
        <tr>
          <th>Telefon P</th>
          <td><PrintField value={mieter.telefonP} onChange={set("telefonP")} ariaLabel="Telefon P" /></td>
          <th>Telefon G</th>
          <td><PrintField value={mieter.telefonG} onChange={set("telefonG")} ariaLabel="Telefon G" /></td>
        </tr>
      </tbody>
    </table>
  );
}
