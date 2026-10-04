"use client";

import { useEffect, useState } from "react";

type ToolbarProps = {
  onNew: () => void;
  onSave: () => void;
  onOpenArchive: () => void;
};

export function Toolbar({ onNew, onSave, onOpenArchive }: ToolbarProps) {
  const [confirming, setConfirming] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  return (
    <div className="toolbar no-print">
      <button type="button" className="btn btn-primary" onClick={() => window.print()}>
        Drucken
      </button>
      <button
        type="button"
        className="btn"
        onClick={() => {
          onSave();
          setSaved(true);
        }}
      >
        {saved ? "Gespeichert ✓" : "Speichern"}
      </button>
      <button type="button" className="btn" onClick={onOpenArchive}>
        Archiv
      </button>
      {confirming ? (
        <span className="confirm">
          Alle Eingaben löschen?
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              onNew();
              setConfirming(false);
            }}
          >
            Ja
          </button>
          <button type="button" className="btn" onClick={() => setConfirming(false)}>
            Abbrechen
          </button>
        </span>
      ) : (
        <button type="button" className="btn" onClick={() => setConfirming(true)}>
          Neu
        </button>
      )}
    </div>
  );
}
