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
      {/* Karartma */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menü Paneli */}
      <nav
        className="relative z-10 flex h-full w-4/5 max-w-sm flex-col bg-[#0b0f15] text-white p-6 shadow-2xl border-r border-[#1e2735]"
        role="dialog"
        aria-modal="true"
        aria-label="Mobil Menü"
      >
        <div className="flex items-center justify-between border-b border-[#1e2735] pb-5">
          <Link href="/" onClick={onClose} className="flex flex-col items-start leading-none">
            <div className="flex items-center gap-1.5 text-xl font-black tracking-widest text-white">
              <span>DR</span>
              <span className="inline-block w-1.5 h-1.5 bg-[#c5a880] rounded-full mx-0.5" />
              <span>MARS</span>
            </div>
            <span className="text-[7.5px] font-bold tracking-[0.28em] text-[#c5a880] uppercase mt-1">
              HAUTE PARFUMERIE · MARDİN
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Menüyü kapat"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {/* 1. ÜRÜN KATEGORİLERİ */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#c5a880] mb-3">
              Ürün Kategorileri
            </p>
            <div className="space-y-1">
              <Link
                href="/#urunler"
                onClick={onClose}
                className="flex items-center justify-between py-2 text-xs font-semibold text-stone-300 hover:text-[#dfcca8] transition-colors"
              >
                <span>✨ Tüm Koleksiyon</span>
                <ArrowRight size={13} className="text-stone-600" />
              </Link>
              <Link
                href="/kategori/kolonyalar"
                onClick={onClose}
                className="flex items-center justify-between py-2 text-xs font-semibold text-stone-300 hover:text-[#dfcca8] transition-colors"
              >
                <span>🌿 Kolonyalar</span>
                <ArrowRight size={13} className="text-stone-600" />
              </Link>
              <Link
                href="/kategori/oda-kokulari"
                onClick={onClose}
                className="flex items-center justify-between py-2 text-xs font-semibold text-stone-300 hover:text-[#dfcca8] transition-colors"
              >
                <span>🏠 Oda Kokuları</span>
                <ArrowRight size={13} className="text-stone-600" />
              </Link>
              <Link
                href="/kategori/oto-kokulari"
                onClick={onClose}
                className="flex items-center justify-between py-2 text-xs font-semibold text-stone-300 hover:text-[#dfcca8] transition-colors"
              >
                <span>🚗 Oto Kokuları</span>
                <ArrowRight size={13} className="text-stone-600" />
              </Link>
              <Link
                href="/kategori/parfumler"
                onClick={onClose}
                className="flex items-center justify-between py-2 text-xs font-semibold text-stone-300 hover:text-[#dfcca8] transition-colors"
              >
                <span>💎 Parfümler</span>
                <ArrowRight size={13} className="text-stone-600" />
              </Link>
              <Link
                href="/kategori/hediye-setleri"
                onClick={onClose}
                className="flex items-center justify-between py-2 text-xs font-semibold text-[#dfcca8] hover:text-white transition-colors"
              >
                <span>🎁 Hediye Setleri</span>
                <ArrowRight size={13} className="text-[#c5a880]" />
              </Link>
              {categories
                .filter(
                  (c) =>
                    !["kolonyalar", "oda-kokulari", "oto-kokulari", "parfumler", "hediye-setleri"].includes(
                      c.slug
                    )
                )
                .map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/kategori/${cat.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between py-2 text-xs font-semibold text-stone-300 hover:text-[#dfcca8] transition-colors"
                  >
                    <span>{cat.name}</span>
                    <ArrowRight size={13} className="text-stone-600" />
                  </Link>
                ))}
            </div>
          </div>

          {/* 2. KURUMSAL BİLGİLER & HİZMETLER */}
          <div className="border-t border-[#1e2735] pt-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#c5a880] mb-3">
              Kurumsal Bilgiler
            </p>
            <div className="space-y-2">
              <Link
                href="/hakkimizda"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 text-xs font-medium text-stone-300 hover:text-white"
              >
                <Box size={15} className="text-[#c5a880]" /> Hakkımızda & Kurumsal
              </Link>
              <Link
                href="/hikayemiz"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 text-xs font-medium text-stone-300 hover:text-white"
              >
                <Box size={15} className="text-[#c5a880]" /> Hikayemiz & Koku Felsefesi
              </Link>
              <Link
                href="/hakkimizda#laboratuvar"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 text-xs font-medium text-stone-300 hover:text-white"
              >
                <Box size={15} className="text-[#c5a880]" /> Laboratuvar & Üretim
              </Link>
              <Link
                href="/iletisim"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 text-xs font-medium text-stone-300 hover:text-white"
              >
                <HelpCircle size={15} className="text-[#c5a880]" /> Butik Showroom & Fabrika
              </Link>
              <Link
                href="/iletisim#iletisim-formu"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 text-xs font-medium text-stone-300 hover:text-white"
              >
                <HelpCircle size={15} className="text-[#c5a880]" /> İletişim & Danışma
              </Link>
              <Link
                href="/siparis-takip"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 text-xs font-medium text-stone-300 hover:text-white"
              >
                <Package size={15} className="text-[#c5a880]" /> Sipariş & Kargo Takip
              </Link>
              <Link
                href="/hesabim"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 text-xs font-medium text-stone-300 hover:text-white"
              >
                <User size={15} className="text-[#c5a880]" /> Müşteri Hesabı
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-[#1e2735] pt-4 text-[11px] text-stone-500 font-mono">
          <p>© 2026 Dr. Mars Kozmetik A.Ş.</p>
        </div>
      </nav>
    </div>
  );
}
