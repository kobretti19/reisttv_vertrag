import type { FormState, Totals } from "@/lib/form";

export type PageProps = {
  form: FormState;
  totals: Totals;
  update: (patch: Partial<FormState>) => void;
};
