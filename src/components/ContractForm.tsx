"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearCurrentId,
  getCurrentId,
  loadArchive,
  saveToArchive,
  setCurrentId,
  type ArchiveEntry,
} from "@/lib/archive";
import { computeTotals, emptyForm, type FormState } from "@/lib/form";
import { clearDraft, loadDraft, saveDraft } from "@/lib/storage";
import { ArchivePanel } from "./ArchivePanel";
import { Page1 } from "./Page1";
import { Page2 } from "./Page2";
import { Toolbar } from "./Toolbar";

const emptyJson = () => JSON.stringify(emptyForm());

/** After a reload: the linked entry (if it still exists) and its saved state. */
function restoreLink(): { id: string | null; snapshot: string } {
  const id = getCurrentId();
  const entry = id ? loadArchive().find((e) => e.id === id) : undefined;
  if (!entry) {
    if (id) clearCurrentId();
    return { id: null, snapshot: emptyJson() };
  }
  return { id: entry.id, snapshot: JSON.stringify(entry.form) };
}

export default function ContractForm() {
  const [form, setForm] = useState<FormState>(() => loadDraft() ?? emptyForm());
  // id = linked archive entry; snapshot = JSON of what was last saved/opened (or of the empty form).
  const [link, setLink] = useState(restoreLink);
  const [archiveOpen, setArchiveOpen] = useState(false);

  useEffect(() => {
    saveDraft(form);
  }, [form]);

  const totals = computeTotals(form);
  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));
  const dirty = JSON.stringify(form) !== link.snapshot;

  const unlink = () => {
    clearCurrentId();
    setLink({ id: null, snapshot: emptyJson() });
  };

  const closeArchive = useCallback(() => setArchiveOpen(false), []);

  const openEntry = (entry: ArchiveEntry) => {
    setForm(entry.form);
    setCurrentId(entry.id);
    setLink({ id: entry.id, snapshot: JSON.stringify(entry.form) });
    setArchiveOpen(false);
  };

  return (
    <>
      <Toolbar
        onSave={() => {
          const entry = saveToArchive(form, link.id);
          setCurrentId(entry.id);
          setLink({ id: entry.id, snapshot: JSON.stringify(entry.form) });
        }}
        onOpenArchive={() => setArchiveOpen(true)}
        onNew={() => {
          clearDraft();
          setForm(emptyForm());
          unlink();
        }}
      />
      {archiveOpen && (
        <ArchivePanel
          currentId={link.id}
          dirty={dirty}
          onOpen={openEntry}
          onDeleted={(id) => {
            if (id === link.id) unlink();
          }}
          onClose={closeArchive}
        />
      )}
      <main className="sheets">
        <Page1 form={form} totals={totals} update={update} />
        <Page2 form={form} totals={totals} update={update} />
      </main>
    </>
  );
}
