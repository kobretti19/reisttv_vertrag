import { STATIC_ARTICLES, type Article as ArticleData } from "@/data/texts";
import { AutoField } from "./AutoField";
import { PrintField } from "./PrintField";
import type { PageProps } from "./types";

function Article({ nr, title, bold = false, children }: { nr: number; title: string; bold?: boolean; children: React.ReactNode }) {
  return (
    <div className="article">
      <div className="art-nr">Art. {nr}</div>
      <div className={bold ? "font-bold" : ""}>{children}</div>
      <div className="art-title">{title}</div>
    </div>
  );
}

function StaticArticle({ article }: { article: ArticleData }) {
  return (
    <Article nr={article.nr} title={article.title} bold={article.bold}>
      {article.text}
    </Article>
  );
}

export function Page2({ form, totals, update }: PageProps) {
  const art6 = STATIC_ARTICLES.filter((a) => a.nr === 6);
  const after7 = STATIC_ARTICLES.filter((a) => a.nr > 7);

  return (
    <section className="sheet">
      <Article nr={2} title="Vorgesehener Gebrauch">
        Die Mietgegenstände{" "}
        <PrintField value={form.gebrauch} onChange={(v) => update({ gebrauch: v })} ariaLabel="Vorgesehener Gebrauch" line className="w-[75%]" />
      </Article>

      <Article nr={3} title="Mietdauer">
        Die Miete dauert vom{" "}
        <PrintField value={form.mietdauerVon} onChange={(v) => update({ mietdauerVon: v })} ariaLabel="Miete vom" placeholder="TT.MM.JJJJ" line className="w-40" />{" "}
        bis{" "}
        <PrintField value={form.mietdauerBis} onChange={(v) => update({ mietdauerBis: v })} ariaLabel="Miete bis" placeholder="TT.MM.JJJJ" line className="w-40" />
      </Article>

      <Article nr={4} title="Mietzins">
        Der Mietzins beträgt Fr.{" "}
        <AutoField
          value={totals.mietzins}
          overridden={form.mietzins !== null}
          onChange={(v) => update({ mietzins: v })}
          onReset={() => update({ mietzins: null })}
          ariaLabel="Mietzins"
        />
        . Er ist im Voraus, spätestens am Tage vor der Montage zu bezahlen. Reparaturen, Montage und Demontage sind darin inbegriffen.
      </Article>

      <Article nr={5} title="Transportkosten">
        Die Transportkosten von Fr.{" "}
        <PrintField value={form.transport} onChange={(v) => update({ transport: v })} ariaLabel="Transportkosten" align="right" line className="w-32" />{" "}
        bei Beginn und Ende der Miete gehen zu Lasten des Mieters. Sie sind gleichzeitig mit dem Mietzins vorauszuzahlen.
      </Article>

      {art6.map((a) => (
        <StaticArticle key={a.nr} article={a} />
      ))}

      <Article nr={7} title="Kaution">
        Der Mieter ist zur Leistung einer gleichzeitig mit dem Mietzins vorauszahlbaren Kaution in der Höhe von einem Drittel des Mietzinses, ausmachend Fr.{" "}
        <AutoField
          value={totals.kaution}
          overridden={form.kaution !== null}
          onChange={(v) => update({ kaution: v })}
          onReset={() => update({ kaution: null })}
          ariaLabel="Kaution"
        />{" "}
        verpflichtet. Diese dient insbesondere der Sicherung der Ansprüche gemäss Art. 8, Art. 11 und Art. 12 dieses Vertrages.
      </Article>

      {after7.map((a) => (
        <StaticArticle key={a.nr} article={a} />
      ))}

      <Article nr={17} title="">
        Besondere Abmachungen:
        <textarea
          className="abmachungen"
          value={form.abmachungen}
          aria-label="Besondere Abmachungen"
          onChange={(e) => update({ abmachungen: e.target.value })}
        />
      </Article>
    </section>
  );
}
