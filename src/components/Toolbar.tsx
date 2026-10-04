"use client";

import { useState } from "react";

export function Toolbar({ onNew }: { onNew: () => void }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="toolbar no-print">
      <button type="button" className="btn btn-primary" onClick={() => window.print()}>
        Drucken
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
