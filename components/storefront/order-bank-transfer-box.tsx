"use client";

import { useState } from "react";
import { Check, Copy, AlertCircle } from "lucide-react";

interface BankAccount {
  bankName: string;
  accountHolder: string;
  iban: string;
  branch?: string;
}

export function OrderBankTransferBox({
  orderNumber,
  bankAccounts,
}: {
  orderNumber: string;
  bankAccounts: BankAccount[];
}) {
  const [copiedIban, setCopiedIban] = useState<string | null>(null);

  const copyIban = (iban: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(iban.replace(/\s+/g, ""));
      setCopiedIban(iban);
      setTimeout(() => setCopiedIban(null), 2500);
    }
  };

  return (
    <div className="mt-8 rounded-3xl border-2 border-[#101e2c] bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-900">
          <AlertCircle size={22} />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-black text-stone-900">
            Havale / EFT ile Ödeme Bilgileri
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Siparişinizin hazırlanıp kargolanabilmesi için lütfen aşağıdaki hesap numaralarımızdan birine sipariş tutarını gönderiniz.
          </p>
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        {bankAccounts.map((acc, idx) => (
          <div key={idx} className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-stone-900">{acc.bankName}</span>
              {acc.branch && <span className="text-[11px] text-stone-500">{acc.branch}</span>}
            </div>
            <p className="text-xs text-stone-600">
              <strong className="text-stone-700">Alıcı:</strong> {acc.accountHolder}
            </p>
            <div className="pt-2 border-t border-stone-200/60 flex flex-col gap-2">
              <span className="font-mono text-xs sm:text-sm font-bold text-stone-900 select-all">
                {acc.iban}
              </span>
              <button
                type="button"
                onClick={() => copyIban(acc.iban)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-stone-900 hover:bg-black text-white px-3 py-2 text-xs font-bold transition-colors cursor-pointer"
              >
                {copiedIban === acc.iban ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span>IBAN Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>IBAN&apos;ı Kopyala</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-950 flex items-center gap-2 font-medium">
        <span>⚠️</span>
        <span>
          <strong>Çok Önemli:</strong> Bankanızın havale/EFT açıklama kısmına yalnızca{" "}
          <strong className="font-mono bg-amber-200/70 px-1.5 py-0.5 rounded text-stone-900">
            {orderNumber}
          </strong>{" "}
          yazınız.
        </span>
      </div>
    </div>
  );
}
