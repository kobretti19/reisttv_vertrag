"use client";

import { useEffect, useRef, useState } from "react";
import {
  deleteFromArchive,
  exportArchive,
  importArchive,
  loadArchive,
  type ArchiveEntry,
} from "@/lib/archive";
import { formatChf } from "@/lib/calc";
import { computeTotals } from "@/lib/form";

type Props = {
  currentId: string | null;
  dirty: boolean;
  onOpen: (entry: ArchiveEntry) => void;
  onDeleted: (id: string) => void;
  onClose: () => void;
};

const pad = (n: number) => String(n).padStart(2, "0");

function formatSavedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function title(e: ArchiveEntry): string {
  const m = [e.form.mieter.name, e.form.mieter.vorname].map((s) => s.trim()).filter(Boolean);
  if (m.length) return m.join(" ");
  return e.form.an.name.trim() || "(ohne Name)";
}

function downloadText(filename: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ArchivePanel({ currentId, dirty, onOpen, onDeleted, onClose }: Props) {
  const [entries, setEntries] = useState<ArchiveEntry[]>(() => loadArchive());
  const [pending, setPending] = useState<{ kind: "open" | "delete"; id: string } | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const importFile = async (file: File) => {
    try {
      const n = importArchive(await file.text());
      setEntries(loadArchive());
      setMessage({ text: `${n} Verträge geladen`, error: false });
    } catch {
      setMessage({ text: "Datei konnte nicht gelesen werden", error: true });
    }
  };

  return (
    <div className="archive-overlay no-print" onClick={onClose}>
      <div
        className="archive-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Archiv"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="archive-head">
          <h2>Archiv</h2>
          <button type="button" className="btn" onClick={onClose} aria-label="Schliessen">
            ×
          </button>
        </div>
        <ul className="archive-list">
          {entries.length === 0 && <li className="archive-empty">Noch keine Verträge gespeichert.</li>}
          {entries.map((e) => {
            const totals = computeTotals(e.form);
            const von = e.form.mietdauerVon.trim();
            const bis = e.form.mietdauerBis.trim();
            const isPending = pending?.id === e.id ? pending.kind : null;
            return (
              <li key={e.id} className={`archive-item${e.id === currentId ? " is-current" : ""}`}>
                <div className="archive-info">
                  <strong>{title(e)}</strong>
                  {(von || bis) && (
                    <span>
                      Mietdauer: {von || "…"} – {bis || "…"}
                    </span>
                  )}
                  <span>Total: CHF {formatChf(totals.total)}</span>
                  <span className="archive-date">gespeichert am {formatSavedAt(e.savedAt)}</span>
                </div>
                <div className="archive-actions">
                  {isPending ? (
                    <span className="archive-confirm">
                      {isPending === "open"
                        ? "Ungespeicherte Änderungen verwerfen?"
                        : "Vertrag wirklich löschen?"}
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => {
                          setPending(null);
                          if (isPending === "open") {
                            onOpen(e);
                          } else {
                            deleteFromArchive(e.id);
                            setEntries(loadArchive());
                            onDeleted(e.id);
                          }
                        }}
                      >
                        Ja
                      </button>
                      <button type="button" className="btn" onClick={() => setPending(null)}>
                        Abbrechen
                      </button>
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          if (dirty) setPending({ kind: "open", id: e.id });
                          else onOpen(e);
                        }}
                      >
                        Öffnen
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => setPending({ kind: "delete", id: e.id })}
                      >
                        Löschen
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="archive-foot">
          <button
            type="button"
            className="btn"
            onClick={() => {
              const d = new Date();
              downloadText(
                `reist-vertraege-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`,
                exportArchive(),
              );
            }}
          >
            Backup herunterladen
          </button>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
            Backup laden
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(ev) => {
              const f = ev.target.files?.[0];
              ev.target.value = "";
              if (f) void importFile(f);
            }}
          />
          {message && (
            <span className={message.error ? "archive-msg archive-msg-error" : "archive-msg"}>
              {message.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
