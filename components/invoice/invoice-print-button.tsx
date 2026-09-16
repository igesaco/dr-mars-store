"use client";

import { Printer } from "lucide-react";

export function InvoicePrintButton({ label = "Faturayı Yazdır" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl bg-[#101e2c] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow hover:bg-black transition-all cursor-pointer"
    >
      <Printer size={16} />
      {label}
    </button>
  );
}
