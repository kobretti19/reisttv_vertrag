"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  emptyLabel,
  labelName,
  labelPrice,
  labelsJson,
  newLabelEntry,
  parseCopies,
  type Label,
  type LabelDesign,
  type LabelEntry,
  type PriceForm,
} from "@/lib/label";
import { Nav } from "./Nav";
import { useLabelStore } from "./useLabelStore";

type TextKey = "marke" | "modell" | "zusatz" | "preis" | "neupreis";
type Field = { key: TextKey; label: string; placeholder: string; decimal?: boolean };

const NAME_FIELDS: Field[] = [
  { key: "marke", label: "Marke", placeholder: "Metz" },
  { key: "modell", label: "Modell", placeholder: "Blue 32MTB4001Y" },
  { key: "zusatz", label: "Zusatz (optional)", placeholder: "TV 81 cm" },
];
const NEUPREIS: Field = { key: "neupreis", label: "Neupreis", placeholder: "899", decimal: true };
const PREIS: Field = { key: "preis", label: "Preis", placeholder: "499", decimal: true };

const LOGO = { src: "/reist_logo.png", alt: "Radio TV Reist", width: 640, height: 232, priority: true };

function LabelSheet({ label, copy }: { label: Label; copy?: boolean }) {
  const neupreis = label.occasion ? labelPrice(label.neupreis) : "";
  const cls = ["label", label.design === "tv" && "label-tv", copy && "label-copy"].filter(Boolean).join(" ");
  const name = (
    <div className="label-text">
      <div className="label-line">{labelName(label)}</div>
      <div className="label-zusatz">{label.zusatz.trim()}</div>
    </div>
  );
  const info = label.occasion && (
    <div className="label-occasion-box">
      <div className="label-occasion">Occasion</div>
      {neupreis && <div className="label-neupreis">Neupreis {neupreis}</div>}
    </div>
  );
  const price = <div className={`label-price label-price-${label.form}`}>{labelPrice(label.preis)}</div>;

  if (label.design === "tv") {
    return (
      <div className={cls}>
        <div className="tv">
          <div className="tv-screen">
            <Image {...LOGO} className="tv-logo" />
            {name}
          </div>
        </div>
        <div className="tv-stand" />
        <div className={info ? "komoda" : "komoda komoda-solo"}>
          {info}
          {price}
        </div>
        <div className="komoda-legs">
          <span />
          <span />
        </div>
      </div>
    );
  }
  return (
    <div className={cls}>
      <Image {...LOGO} className="label-logo" />
      {name}
      <div className="label-price-box">
        {info}
        {price}
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
  const store = useLabelStore();
  const { entries } = store;
  const [pw, setPw] = useState("");
  const importRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ kind: "open" | "delete"; id: string } | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  const dirty = JSON.stringify(label) !== link.snapshot;
  const n = parseCopies(copies);

  const input = (f: Field) => (
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
  );

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
            const entry = newLabelEntry(label, link.id);
            void store.save(entry).then((ok) => {
              if (!ok) return;
              setLink({ id: entry.id, snapshot: JSON.stringify(entry.label) });
              setSaved(true);
            });
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
            {NAME_FIELDS.map(input)}
            <label>
              Zustand
              <select
                className="label-input"
                value={label.occasion ? "occasion" : "neu"}
                onChange={(e) => setLabel((l) => ({ ...l, occasion: e.target.value === "occasion" }))}
              >
                <option value="neu">Neu</option>
                <option value="occasion">Occasion</option>
              </select>
            </label>
            {label.occasion && input(NEUPREIS)}
            {input(PREIS)}
            <label>
              Design
              <select
                className="label-input"
                value={label.design}
                onChange={(e) => setLabel((l) => ({ ...l, design: e.target.value as LabelDesign }))}
              >
                <option value="klassisch">Klassisch</option>
                <option value="tv">Fernseher auf Kommode</option>
              </select>
            </label>
            <label>
              Preis-Form
              <select
                className="label-input"
                value={label.form}
                onChange={(e) => setLabel((l) => ({ ...l, form: e.target.value as PriceForm }))}
              >
                <option value="oval">Oval (rot, weisse Schrift)</option>
                <option value="stern">Stern (rot, weisse Schrift)</option>
                <option value="text">Einfach (rote Schrift)</option>
              </select>
            </label>
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
                      <span>
                        {[e.label.occasion && "Occasion", labelPrice(e.label.preis), e.label.zusatz.trim()]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
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
                            void store.remove(e.id);
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
            <div className="label-file">
              {store.online ? (
                <>
                  <span>Online gespeichert ✓ (für alle Geräte)</span>
                  <button type="button" className="btn" onClick={store.logout}>
                    Abmelden
                  </button>
                </>
              ) : (
                <form
                  className="label-login"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (pw) void store.login(pw).then(() => setPw(""));
                  }}
                >
                  <span>Nur in diesem Browser gespeichert. Für alle Geräte online speichern:</span>
                  <input
                    className="label-input"
                    type="password"
                    placeholder="Passwort"
                    autoComplete="current-password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    Verbinden
                  </button>
                </form>
              )}
              <div className="label-backup">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    const url = URL.createObjectURL(new Blob([labelsJson(entries)], { type: "application/json" }));
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "reist-etiketten.json";
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  }}
                >
                  Backup herunterladen
                </button>
                <button type="button" className="btn" onClick={() => importRef.current?.click()}>
                  Backup laden
                </button>
                <input
                  ref={importRef}
                  type="file"
                  accept=".json,application/json"
                  hidden
                  onChange={(ev) => {
                    const f = ev.target.files?.[0];
                    ev.target.value = "";
                    if (f) void f.text().then(store.importText);
                  }}
                />
              </div>
              {store.message && (
                <span className={store.message.error ? "archive-msg archive-msg-error" : "archive-msg"}>
                  {store.message.text}
                </span>
              )}
            </div>
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
