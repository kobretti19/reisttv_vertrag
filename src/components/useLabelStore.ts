"use client";

import { useEffect, useState } from "react";
import {
  loadLabels,
  mergeLabels,
  parseLabelFile,
  removeLabel,
  storeLabels,
  upsertLabel,
  type LabelEntry,
} from "@/lib/label";
import { getPassword, labelApi, LabelApiError, setPassword, type LabelOp } from "@/lib/labelApi";

export type StoreMessage = { text: string; error: boolean } | null;

const errorText = (err: unknown) =>
  err instanceof LabelApiError && err.kind === "auth"
    ? "Falsches Passwort"
    : err instanceof LabelApiError && err.kind === "offline"
      ? "Keine Verbindung zum Server, nichts gespeichert"
      : "Serverfehler, nichts gespeichert";

/**
 * Saved labels. Logged in (password in localStorage), the list lives on the server
 * (Cloudflare KV, shared by all devices) and localStorage is only a copy.
 * Not logged in, it lives in this browser's localStorage only.
 */
export function useLabelStore() {
  const [entries, setEntries] = useState<LabelEntry[]>([]);
  const [online, setOnline] = useState(false);
  const [message, setMessage] = useState<StoreMessage>(null);

  const show = (text: string, error = false) => setMessage({ text, error });
  const apply = (list: LabelEntry[]) => {
    storeLabels(list);
    setEntries(list);
  };

  useEffect(() => {
    setEntries(loadLabels());
    const pw = getPassword();
    if (!pw) return;
    setOnline(true);
    labelApi(pw).then(apply, (err) => {
      if (err instanceof LabelApiError && err.kind === "auth") {
        setPassword(null);
        setOnline(false);
      }
      show(err instanceof LabelApiError && err.kind === "offline" ? "Keine Verbindung zum Server" : errorText(err), true);
    });
  }, []);

  /** Runs `op` on the server when logged in, otherwise on localStorage. Resolves to false if nothing was saved. */
  const commit = async (op: LabelOp, local: (list: LabelEntry[]) => LabelEntry[]): Promise<boolean> => {
    const pw = getPassword();
    if (!pw) {
      apply(local(loadLabels()));
      return true;
    }
    try {
      apply(await labelApi(pw, op));
      setMessage(null);
      return true;
    } catch (err) {
      show(errorText(err), true);
      return false;
    }
  };

  return {
    entries,
    online,
    message,
    save: (entry: LabelEntry) => commit({ op: "save", entry }, (list) => upsertLabel(list, entry)),
    remove: (id: string) => commit({ op: "delete", id }, (list) => removeLabel(list, id)),
    /** Checks the password; labels saved in this browser before are uploaded (merged) once. */
    login: async (pw: string) => {
      try {
        const local = loadLabels();
        apply(local.length ? await labelApi(pw, { op: "import", entries: local }) : await labelApi(pw));
        setPassword(pw);
        setOnline(true);
        show("Verbunden: Etiketten werden online gespeichert");
      } catch (err) {
        show(errorText(err).replace(", nichts gespeichert", ""), true);
      }
    },
    logout: () => {
      setPassword(null);
      setOnline(false);
      setMessage(null);
    },
    /** Merges a JSON backup into the archive. */
    importText: async (text: string) => {
      let incoming: LabelEntry[];
      try {
        incoming = parseLabelFile(text);
      } catch {
        return show("Datei konnte nicht gelesen werden (keine Etiketten-Datei?)", true);
      }
      const ok = await commit({ op: "import", entries: incoming }, (list) => mergeLabels(list, incoming));
      if (ok) show(`${incoming.length} Etiketten geladen`);
    },
  };
}
