"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Search, X } from "lucide-react";

type SearchResult = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: string | null;
  imageUrl: string | null;
};

export function SearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = (await res.json()) as { results?: SearchResult[] };
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl text-[#0b1724] mx-4"
        role="dialog"
        aria-modal="true"
        aria-label="Ürün Arama"
      >
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3 flex-1">
            <Search className="text-stone-400 shrink-0" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Koku notası, ürün adı veya numara ara... (örn: Citrus, Bergamot)"
              className="w-full bg-transparent text-base font-medium outline-none placeholder:text-stone-400"
              autoFocus
            />
            {loading && <Loader2 size={18} className="animate-spin text-stone-400 shrink-0" />}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-800 transition-colors ml-2"
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results */}
        <div className="mt-4 max-h-96 overflow-y-auto">
          {query.trim().length >= 2 && !loading && results.length === 0 && (
            <p className="py-8 text-center text-sm text-stone-500">
              &quot;{query}&quot; için arama sonucu bulunamadı.
            </p>
          )}

          {results.length > 0 && (
            <ul className="divide-y divide-stone-100">
              {results.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/urun/${item.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between py-3 px-2 hover:bg-stone-50 rounded-lg transition-colors group"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 group-hover:text-black">
                        {item.name}
                      </h4>
                      {item.shortDescription && (
                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                          {item.shortDescription}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {item.price && (
                        <span className="text-sm font-extrabold text-stone-900">
                          ₺{Number(item.price).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                        </span>
                      )}
                      <ArrowRight size={16} className="text-stone-400 group-hover:text-stone-900 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {query.trim().length < 2 && (
            <div className="py-6 text-center text-xs text-stone-400">
              Popüler aramalar: <strong className="text-stone-700">Citrus</strong>,{" "}
              <strong className="text-stone-700">Mineral</strong>,{" "}
              <strong className="text-stone-700">Night</strong>,{" "}
              <strong className="text-stone-700">Amber</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
