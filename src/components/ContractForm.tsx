"use client";

import { useEffect, useState } from "react";
import { computeTotals, emptyForm, type FormState } from "@/lib/form";
import { clearDraft, loadDraft, saveDraft } from "@/lib/storage";
import { Page1 } from "./Page1";
import { Page2 } from "./Page2";
import { Toolbar } from "./Toolbar";

export default function ContractForm() {
  const [form, setForm] = useState<FormState>(() => loadDraft() ?? emptyForm());

  useEffect(() => {
    saveDraft(form);
  }, [form]);

  const totals = computeTotals(form);
  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <>
      <Toolbar
        onNew={() => {
          clearDraft();
          setForm(emptyForm());
        }}
      />
      <main className="sheets">
        <Page1 form={form} totals={totals} update={update} />
        <Page2 form={form} totals={totals} update={update} />
      </main>
    </>
  );
}
