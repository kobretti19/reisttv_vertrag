"use client";

import Image from "next/image";
import { useState } from "react";
import { labelPrice } from "@/lib/label";
import { Nav } from "./Nav";

type Label = { marke: string; modell: string; zusatz: string; preis: string };

const empty: Label = { marke: "", modell: "", zusatz: "", preis: "" };

/** Shop price label, 150 × 105 mm, printed one per page (see `.label` in globals.css). */
export function LabelEditor() {
  const [label, setLabel] = useState<Label>(empty);
  const set = (key: keyof Label) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setLabel((l) => ({ ...l, [key]: e.target.value }));

  const name = [label.marke, label.modell].map((s) => s.trim()).filter(Boolean).join(" ");
  const price = labelPrice(label.preis);

  return (
    <>
      <div className="toolbar no-print">
        <Nav />
        <button type="button" className="btn btn-primary" onClick={() => window.print()}>
          Drucken
        </button>
        <button type="button" className="btn" onClick={() => setLabel(empty)}>
          Neu
        </button>
      </div>
      <main className="label-page">
        <form className="label-form no-print" onSubmit={(e) => e.preventDefault()}>
          <label>
            Marke
            <input className="label-input" value={label.marke} onChange={set("marke")} placeholder="Metz" />
          </label>
          <label>
            Modell
            <input
              className="label-input"
              value={label.modell}
              onChange={set("modell")}
              placeholder="Blue 32MTB4001Y"
            />
          </label>
          <label>
            Zusatz (optional)
            <input className="label-input" value={label.zusatz} onChange={set("zusatz")} placeholder="TV 81 cm" />
          </label>
          <label>
            Preis
            <input
              className="label-input"
              value={label.preis}
              onChange={set("preis")}
              placeholder="499"
              inputMode="decimal"
            />
          </label>
        </form>
        <div className="label-wrap">
          <div className="label">
            <Image src="/reist_logo.png" alt="Radio TV Reist" width={640} height={232} className="label-logo" priority />
            <div className="label-name">{name}</div>
            <div className="label-bottom">
              <span className="label-zusatz">{label.zusatz.trim()}</span>
              <span className="label-price">{price}</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
