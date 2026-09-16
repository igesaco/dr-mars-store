"use client";

import Link from "next/link";
import { ArrowRight, Box, HelpCircle, Package, User, X } from "lucide-react";

export function MobileMenu({
  isOpen,
  onClose,
  categories,
}: {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: string; name: string; slug: string }[];
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <nav
        className="relative z-10 flex h-full w-4/5 max-w-sm flex-col bg-[#101e2c] text-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Mobil Menü"
      >
        <div className="flex items-center justify-between border-b border-stone-800 pb-5">
          <Link href="/" onClick={onClose} className="brand text-white">
            <span>DR</span>
            <i className="bg-[#caff73]" />
            <span>MARS</span>
          </Link>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white transition-colors"
            aria-label="Menüyü kapat"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-stone-400 mb-3">
              Koleksiyonlar
            </p>
            <div className="space-y-1">
              <Link
                href="/kategori/kolonyalar"
                onClick={onClose}
                className="flex items-center justify-between py-2.5 text-base font-bold text-stone-200 hover:text-[#caff73] transition-colors"
              >
                Tüm Kolonyalar <ArrowRight size={16} />
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/kategori/${cat.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between py-2 text-sm font-semibold text-stone-300 hover:text-[#caff73] transition-colors"
                >
                  {cat.name} <ArrowRight size={14} className="text-stone-500" />
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-stone-800 pt-6">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-stone-400 mb-3">
              Hızlı Erişim
            </p>
            <div className="space-y-2">
              <Link
                href="/siparis-takip"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 text-sm font-semibold text-stone-300 hover:text-white"
              >
                <Package size={17} className="text-lime-300" /> Sipariş Takip
              </Link>
              <Link
                href="/giris"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 text-sm font-semibold text-stone-300 hover:text-white"
              >
                <User size={17} className="text-lime-300" /> Giriş Yap / Üye Ol
              </Link>
              <Link
                href="/hakkimizda"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 text-sm font-semibold text-stone-300 hover:text-white"
              >
                <Box size={17} className="text-lime-300" /> Hakkımızda
              </Link>
              <Link
                href="/iletisim"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 text-sm font-semibold text-stone-300 hover:text-white"
              >
                <HelpCircle size={17} className="text-lime-300" /> İletişim & Destek
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-4 text-xs text-stone-400">
          <p>© 2026 Dr. Mars. Modern Cologne.</p>
        </div>
      </nav>
    </div>
  );
}
