import { EQUIPMENT, SERVICES } from "../data/equipment";
import { formatChf, kaution, parseChf, rowPrice, total } from "./calc";

export type RowInput = { preis: string; anzahl: string };

export type ExtraRow = {
  mietgegenstand: string;
  marke: string;
  modell: string;
  preis: string;
  anzahl: string;
};

export type FormState = {
  an: { name: string; adresse: string; wohnort: string };
  mieter: {
    name: string;
    vorname: string;
    strasse: string;
    wohnort: string;
    telefonP: string;
    telefonG: string;
  };
  /** Same order and length as EQUIPMENT. */
  rows: RowInput[];
  extra: ExtraRow;
  /** Mietpreis per service, same order and length as SERVICES. */
  services: string[];
  datum: string;
  quittungVon: string;
  quittungBis: string;
  gebrauch: string;
  mietdauerVon: string;
  mietdauerBis: string;
  /** null = automatic (equal to Total). */
  mietzins: string | null;
  transport: string;
  /** null = automatic (one third of Mietzins). */
  kaution: string | null;
  abmachungen: string;
};

export function emptyForm(): FormState {
  return {
    an: { name: "", adresse: "", wohnort: "" },
    mieter: { name: "", vorname: "", strasse: "", wohnort: "", telefonP: "", telefonG: "" },
    rows: EQUIPMENT.map((e) => ({ preis: formatChf(e.price * 100), anzahl: "" })),
    extra: { mietgegenstand: "", marke: "", modell: "", preis: "", anzahl: "" },
    services: SERVICES.map(() => ""),
    datum: "",
    quittungVon: "",
    quittungBis: "",
    gebrauch: "",
    mietdauerVon: "",
    mietdauerBis: "",
    mietzins: null,
    transport: "",
    kaution: null,
    abmachungen: "",
  };
}

export type Totals = {
  rowPrices: (number | null)[];
  extraPrice: number | null;
  servicePrices: (number | null)[];
  /** Rappen */
  total: number;
  /** Text shown in Art. 4 (manual value or formatted total). */
  mietzins: string;
  /** Text shown in Art. 7 (manual value or one third of Mietzins). */
  kaution: string;
};

export function computeTotals(form: FormState): Totals {
  const rowPrices = form.rows.map((r) => rowPrice(r.preis, r.anzahl));
  const extraPrice = rowPrice(form.extra.preis, form.extra.anzahl);
  const servicePrices = form.services.map(parseChf);
  const sum = total([...rowPrices, extraPrice, ...servicePrices]);

  const mietzins = form.mietzins ?? (sum > 0 ? formatChf(sum) : "");
  const mietzinsRappen = parseChf(mietzins);
  const kautionText =
    form.kaution ??
    (mietzinsRappen !== null && mietzinsRappen > 0 ? formatChf(kaution(mietzinsRappen)) : "");

  return { rowPrices, extraPrice, servicePrices, total: sum, mietzins, kaution: kautionText };
}
