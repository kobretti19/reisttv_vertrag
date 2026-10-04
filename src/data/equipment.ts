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
  { category: "", brand: "Sony", model: "Mini-Disc inkl. LS", price: 150 },
  { category: "", brand: "Dynacord", model: "Disco inkl. LS", price: 250 },
  { category: "Lautsprecher", brand: "TOA", model: "Trichter LS", price: 45 },
  { category: "", brand: "El. Voice", model: "Musicaster", price: 45 },
  { category: "", brand: "Jamo", model: "Pro 200ex", price: 45 },
  { category: "", brand: "El. Voice", model: "100S", price: 45 },
  { category: "Funkanlage", brand: "TOA", model: "WT 02", price: 150 },
  { category: "", brand: "ANCOR", model: "Explorer", price: 100 },
  { category: "Tonsystem", brand: "Lindaco", model: "2519", price: 50 },
  { category: "", brand: "Schauf", model: "DS - 50", price: 70 },
  { category: "Mikrophon", brand: "Sennheiser", model: "Profi Power", price: 35 },
  { category: "", brand: "Sennheiser", model: "MD 442", price: 35 },
  { category: "Mischpult", brand: "Grauer + Müller", model: "PH 15 B", price: 45 },
  { category: "", brand: "Roclab", model: "MPX 7801", price: 45 },
  { category: "Tonband", brand: "Kenwood", model: "", price: 20 },
  { category: "CD-Player", brand: "Philips", model: "", price: 25 },
  { category: "Stativ", brand: "", model: "", price: 10 },
  { category: "Autobeschallung", brand: "Fiat Panda", model: "", price: 250 },
  { category: "", brand: "Toyota Bus", model: "", price: 250 },
];

/** Services without a fixed price; only the amount is entered. */
export const SERVICES: string[] = [
  "Bedienung der LS-Anlage",
  "Arbeit: Installation, inkl. Fahrt",
  "Montage",
  "Demontage",
];
