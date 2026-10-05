export type Equipment = {
  /** Empty for continuation rows of the same category, as on the paper form. */
  category: string;
  brand: string;
  model: string;
  /** Default price in whole francs. */
  price: number;
};

export const EQUIPMENT: Equipment[] = [
  { category: "Verstärker", brand: "Philips", model: "LBB 1143", price: 80 },
  { category: "Mischverstärker", brand: "IMG", model: "PMX-400", price: 120 },
  { category: "", brand: "El. Voice", model: "TAPCO 100", price: 120 },
  { category: "Lautsprecher", brand: "Aktiv", model: "Boombox", price: 150 },
  { category: "", brand: "El. Voice", model: "Musicaster", price: 45 },
  { category: "", brand: "Jamo", model: "Pro 200ex", price: 45 },
  { category: "", brand: "El. Voice", model: "100S", price: 45 },
  { category: "Funkanlage Mik", brand: "IMG", model: "TXS-812", price: 50 },
  { category: "", brand: "ANCOR", model: "Explorer", price: 100 },
  { category: "Tonsystem", brand: "Lindaco", model: "2519", price: 50 },
  { category: "", brand: "Schauf", model: "DS - 50", price: 70 },
  { category: "Mikrophon", brand: "Sennheiser", model: "Profi Power", price: 35 },
  { category: "", brand: "Sennheiser", model: "MD 442", price: 35 },
  { category: "Mischpult", brand: "Grauer + Müller", model: "PH 15 B", price: 45 },
  { category: "", brand: "Roclab", model: "MPX 7801", price: 45 },
  { category: "CD-Player", brand: "Philips", model: "", price: 25 },
  { category: "Mini-Disc", brand: "Sony", model: "", price: 25 },
  { category: "Autobeschallung", brand: "Opel Combo", model: "", price: 250 },
  { category: "Aktiv LS", brand: "Monacor", model: "MKA-80Set", price: 250 },
  { category: "Stativ", brand: "", model: "", price: 20 },
];

/** The free-text row is printed before EQUIPMENT[EXTRA_ROW_INDEX] (after Mischpult), as on the paper form. */
export const EXTRA_ROW_INDEX = 15;

/** Services without a fixed price; only the amount is entered. */
export const SERVICES: string[] = [
  "Bedienung der LS-Anlage",
  "Fahrt - Transport",
  "Montage",
  "Demontage",
];
