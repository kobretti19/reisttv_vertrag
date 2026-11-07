import type { Metadata } from "next";
import { LabelEditor } from "@/components/LabelEditor";

export const metadata: Metadata = {
  title: "Etikette – Radio TV Reist",
};

export default function EtikettePage() {
  return <LabelEditor />;
}
