"use client";

import dynamic from "next/dynamic";

// Client-only: the form reads its draft from localStorage on first render.
const ContractForm = dynamic(() => import("@/components/ContractForm"), { ssr: false });

export default function Home() {
  return <ContractForm />;
}
