"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Uygulama hatası:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#0b1724] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl border border-stone-200 bg-white p-8 sm:p-10 text-center shadow-lg">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60">
          <AlertTriangle size={32} />
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8f7351] mb-1">
          DR · MARS HAUTE PARFUMERIE
        </p>
        <h1 className="text-xl sm:text-2xl font-serif text-stone-900 font-normal mb-3">
          Bir Şeyler Ters Gitti
        </h1>
        <p className="text-xs text-stone-600 leading-relaxed mb-6">
          İşleminiz gerçekleştirilirken beklenmeyen bir aksaklık oluştu. Lütfen sayfayı yenilemeyi deneyin veya anasayfaya dönün.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto rounded-xl bg-[#0e131a] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#dfcca8] hover:bg-[#c5a880] hover:text-[#0e131a] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw size={14} />
            <span>Yeniden Dene</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto rounded-xl border border-stone-300 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-stone-800 hover:border-stone-900 transition-all flex items-center justify-center gap-2 shadow-2xs"
          >
            <Home size={14} />
            <span>Anasayfa</span>
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-[10px] text-stone-400 font-mono">
            Hata Kodu: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
