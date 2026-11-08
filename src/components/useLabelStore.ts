"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadLabels,
  mergeLabels,
  removeLabel,
  storeLabels,
  upsertLabel,
  type LabelEntry,
} from "@/lib/label";
import {
  createLabelFile,
  fileApiSupported,
  forgetLabelFile,
  hasPermission,
  isAbort,
  openLabelFile,
  parseLabelFile,
  readLabelFile,
  storedLabelFile,
  writeLabelFile,
  type LabelFileHandle,
} from "@/lib/labelFile";

export type FileStatus = { name: string; ok: boolean } | null;
export type StoreMessage = { text: string; error: boolean } | null;

/**
 * Saved labels. Always kept in localStorage; when a JSON file is connected (Chrome/Edge),
 * that file is the source of truth: every change reads it, applies the change and writes it back,
 * so several computers can share one file (e.g. in OneDrive).
 */
export function useLabelStore() {
  const [entries, setEntries] = useState<LabelEntry[]>([]);
  const [file, setFile] = useState<FileStatus>(null);
  const [message, setMessage] = useState<StoreMessage>(null);
  const [supported, setSupported] = useState(false);
  const handle = useRef<LabelFileHandle | null>(null);

  const show = (text: string, error = false) => setMessage({ text, error });

  /** Reads the file, merges in what only this browser has, writes both. */
  const syncFromFile = async (h: LabelFileHandle) => {
    const merged = mergeLabels(await readLabelFile(h), loadLabels());
    await writeLabelFile(h, merged);
    storeLabels(merged);
    setEntries(merged);
  };

  useEffect(() => {
    setEntries(loadLabels());
    if (!fileApiSupported()) return;
    setSupported(true);
    void (async () => {
      const h = await storedLabelFile();
      if (!h) return;
      handle.current = h;
      const ok = await hasPermission(h, false);
      setFile({ name: h.name, ok });
      if (!ok) return;
      try {
        await syncFromFile(h);
      } catch {
        show(`${h.name} konnte nicht gelesen werden`, true);
      }
    })();
  }, []);

  /** Applies a change to the file (if connected) and to localStorage. */
  const commit = async (change: (list: LabelEntry[]) => LabelEntry[]) => {
    const h = handle.current;
    if (h) {
      try {
        if (!(await hasPermission(h, true))) throw new Error("no permission");
        const next = change(await readLabelFile(h));
        await writeLabelFile(h, next);
        storeLabels(next);
        setEntries(next);
        setFile({ name: h.name, ok: true });
        setMessage(null);
        return;
      } catch {
        setFile({ name: h.name, ok: false });
        show(`Nicht in ${h.name} gespeichert, nur in diesem Browser`, true);
      }
    }
    const next = change(loadLabels());
    storeLabels(next);
    setEntries(next);
  };

  const connect = async (pick: () => Promise<LabelFileHandle>) => {
    try {
      const h = await pick();
      handle.current = h;
      await syncFromFile(h);
      setFile({ name: h.name, ok: true });
      show(`Verbunden mit ${h.name}`);
    } catch (err) {
      if (!isAbort(err)) show("Datei konnte nicht gelesen werden (keine Etiketten-Datei?)", true);
    }
  };

  return {
    entries,
    file,
    message,
    supported,
    save: (entry: LabelEntry) => commit((list) => upsertLabel(list, entry)),
    remove: (id: string) => commit((list) => removeLabel(list, id)),
    createFile: () => connect(createLabelFile),
    openFile: () => connect(openLabelFile),
    /** After a browser restart the permission has to be granted again, with a click. */
    allow: async () => {
      const h = handle.current;
      if (!h) return;
      try {
        if (!(await hasPermission(h, true))) return;
        await syncFromFile(h);
        setFile({ name: h.name, ok: true });
        setMessage(null);
      } catch {
        show(`${h.name} konnte nicht gelesen werden`, true);
      }
    },
    disconnect: async () => {
      handle.current = null;
      setFile(null);
      setMessage(null);
      await forgetLabelFile();
    },
    /** Fallback for browsers without file access: merge a downloaded/edited JSON file. */
    importText: (text: string) => {
      try {
        const merged = mergeLabels(loadLabels(), parseLabelFile(text));
        storeLabels(merged);
        setEntries(merged);
        show(`${merged.length} Etiketten geladen`);
      } catch {
        show("Datei konnte nicht gelesen werden (keine Etiketten-Datei?)", true);
      }
    },
  };
}
