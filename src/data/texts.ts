export const HEADER_LINES: string[] = [
  "Vermietung von Lautsprecheranlagen",
  "Video-Überwachung-Satellitenanlagen (Camping)",
  "Reparatur: TV + Audiogeräte-PC Support",
  "Verkauf Reparatur und Installation aller Audio + TV Marken",
];

export const INTRO_TEXT: string[] = [
  "Es würde uns freuen, Ihnen mit unseren modernsten Anlagen die Beschallung zu verbessern.",
  "Falls Sie sich für unsere Offerte entschliessen können, erwarten wir die Rücksendung des Vertrages.",
];

export type Article = { nr: number; title: string; text: string; bold?: boolean };

/** Articles without input fields. Art. 2–5, 7 and 17 have fields and are written in Page2.tsx. */
export const STATIC_ARTICLES: Article[] = [
  {
    nr: 6,
    title: "Betriebskosten",
    text: "Alle weiteren mit dem Betrieb der Mietgegenstände verbundenen Kosten, soweit sie durch diesen Vertrag nicht ausdrücklich vom Vermieter übernommen werden, gehen zu Lasten des Mieters.",
  },
  {
    nr: 8,
    title: "Haftung des Mieters",
    text: "Für jede übermässige Abnützung ist der Mieter schadenersatzpflichtig. Gehen die Mietgegenstände während der Mietdauer aus irgend einem Grunde unter, so hat dafür auf jeden Fall der Mieter einzustehen.",
  },
  {
    nr: 9,
    title: "Versicherung",
    text: "Eine allfällige Versicherung der Mietgegenstände während der Mietdauer gegen Elementar- und andere Schäden sowie Diebstahls ist Sache des Mieters.",
  },
  {
    nr: 10,
    title: "Untermiete",
    text: "Der Mieter ist nicht berechtigt, die Mietgegenstände an Dritte abzutreten oder weiterzuvermieten.",
  },
  {
    nr: 11,
    title: "Reparaturservice",
    text: "Der Vermieter hält die Mietgegenstände in gutem Funktionszustand. Er repariert auf seine Kosten mangelhafte Mietgegenstände und ersetzt Einzelteile kostenlos. Ist die Reparatur auf unsachgemässe Behandlung zurückzuführen, so trägt der Mieter sämtliche Kosten.",
  },
  {
    nr: 12,
    title: "Andere Leistungen des Vermieters",
    text: "Zur Durchführung von Montage, Demontage, Änderungen an den Installationen und Reparaturen ist einzig der Vermieter oder von ihm bezeichnete Dritte berechtigt und verpflichtet. Der Mieter haftet für alle aus Missachtung dieser Vorschriften entstehenden Schäden.",
  },
  {
    nr: 13,
    title: "Wegbedingung der Haftung des Vermieters",
    text: "Die Haftung des Vermieters für allfällige Folgen einer Störung oder einer verspäteten Intervention ist ausgeschlossen.",
  },
  {
    nr: 14,
    title: "Obligationenrecht",
    text: "Im übrigen gelten, soweit in diesem Vertrag nicht etwas anderes vereinbart wurde, die Bestimmungen der OR.",
  },
  {
    nr: 16,
    title: "Gerichtsstand",
    text: "Für alle aus diesem Vertrag entstehenden Streitigkeiten gilt für beide Parteien ausschliesslich Bern als Gerichtsstand.",
    bold: true,
  },
];
