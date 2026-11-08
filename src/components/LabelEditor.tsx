"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  deleteLabel,
  emptyLabel,
  labelName,
  labelPrice,
  loadLabels,
  parseCopies,
  saveLabel,
  type Label,
  type LabelEntry,
} from "@/lib/label";
import { Nav } from "./Nav";

const FIELDS: { key: keyof Label; label: string; placeholder: string; decimal?: boolean }[] = [
  { key: "marke", label: "Marke", placeholder: "Metz" },
  { key: "modell", label: "Modell", placeholder: "Blue 32MTB4001Y" },
  { key: "zusatz", label: "Zusatz (optional)", placeholder: "TV 81 cm" },
  { key: "preis", label: "Preis", placeholder: "499", decimal: true },
];

function LabelSheet({ label, copy }: { label: Label; copy?: boolean }) {
  const line = [labelName(label), labelPrice(label.preis)].filter(Boolean).join(" ");
  return (
    <div className={copy ? "label label-copy" : "label"}>
      <Image src="/reist_logo.png" alt="Radio TV Reist" width={640} height={232} className="label-logo" priority />
      <div className="label-text">
        <div className="label-line">{line}</div>
        <div className="label-zusatz">{label.zusatz.trim()}</div>
      </div>
    </div>
  );
}

/** Shop price label, 150 × 105 mm, one per printed page (see `.label` in globals.css). */
export function LabelEditor() {
  const [label, setLabel] = useState<Label>(emptyLabel);
  const [copies, setCopies] = useState("1");
  // id = opened archive entry; snapshot = JSON of what was last saved/opened.
  const [link, setLink] = useState<{ id: string | null; snapshot: string }>(() => ({
    id: null,
    snapshot: JSON.stringify(emptyLabel()),
  }));
  const [entries, setEntries] = useState<LabelEntry[]>([]);
  const [pending, setPending] = useState<{ kind: "open" | "delete"; id: string } | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => setEntries(loadLabels()), []);
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  const dirty = JSON.stringify(label) !== link.snapshot;
  const n = parseCopies(copies);

  const open = (e: LabelEntry) => {
    setLabel(e.label);
    setLink({ id: e.id, snapshot: JSON.stringify(e.label) });
  };

  return (
    <>
      <div className="toolbar no-print">
        <Nav />
        <button type="button" className="btn btn-primary" onClick={() => window.print()}>
          Drucken{n > 1 ? ` (${n}×)` : ""}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            const entry = saveLabel(label, link.id);
            setLink({ id: entry.id, snapshot: JSON.stringify(entry.label) });
            setEntries(loadLabels());
            setSaved(true);
          }}
        >
          {saved ? "Gespeichert ✓" : "Speichern"}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setLabel(emptyLabel());
            setLink({ id: null, snapshot: JSON.stringify(emptyLabel()) });
          }}
        >
          Neu
        </button>
      </div>
      <main className="label-page">
        <div className="label-side no-print">
          <form className="label-form" onSubmit={(e) => e.preventDefault()}>
            {FIELDS.map((f) => (
              <label key={f.key}>
                {f.label}
                <input
                  className="label-input"
                  value={label[f.key]}
                  onChange={(e) => setLabel((l) => ({ ...l, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  inputMode={f.decimal ? "decimal" : undefined}
                />
              </label>
            ))}
            <label>
              Anzahl Etiketten
              <input
                className="label-input"
                type="number"
                min={1}
                max={50}
                value={copies}
                onChange={(e) => setCopies(e.target.value)}
                onBlur={() => setCopies(String(n))}
              />
            </label>
          </form>
          <section className="label-archive">
            <h2>Gespeicherte Etiketten</h2>
            {entries.length === 0 && <p className="archive-empty">Noch keine Etiketten gespeichert.</p>}
            <ul>
              {entries.map((e) => {
                const isPending = pending?.id === e.id ? pending.kind : null;
                return (
                  <li key={e.id} className={e.id === link.id ? "is-current" : undefined}>
                    <div className="label-archive-info">
                      <strong>{labelName(e.label) || "(ohne Name)"}</strong>
                      <span>{[labelPrice(e.label.preis), e.label.zusatz.trim()].filter(Boolean).join(" · ")}</span>
                    </div>
                    {isPending ? (
                      <span className="archive-confirm">
                        {isPending === "open" ? "Änderungen verwerfen?" : "Löschen?"}
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => {
                            setPending(null);
                            if (isPending === "open") return open(e);
                            deleteLabel(e.id);
                            setEntries(loadLabels());
                            if (e.id === link.id) setLink((l) => ({ ...l, id: null }));
                          }}
                        >
                          Ja
                        </button>
                        <button type="button" className="btn" onClick={() => setPending(null)}>
                          Nein
                        </button>
                      </span>
                    ) : (
                      <span className="archive-actions">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => (dirty ? setPending({ kind: "open", id: e.id }) : open(e))}
                        >
                          Öffnen
                        </button>
                        <button type="button" className="btn" onClick={() => setPending({ kind: "delete", id: e.id })}>
                          Löschen
                        </button>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
        <div className="label-wrap">
          {Array.from({ length: n }, (_, i) => (
            <LabelSheet key={i} label={label} copy={i > 0} />
          ))}
        </div>
      </main>
    </>
  );
}
