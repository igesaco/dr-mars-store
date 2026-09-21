"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Menü açıkken arka plan kaydırmasını kilitle ve ESC tuşunu dinle
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const content = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 99999,
      }}
    >
      {/* 1. Karartma Arka Planı (Overlay) */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 1,
        }}
      />

      {/* 2. Menü Paneli (Soldan Sabit Çekmece) */}
      <nav
        role="dialog"
        aria-modal="true"
        aria-label="Mobil Menü"
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          width: "85%",
          maxWidth: "360px",
          height: "100%",
          backgroundColor: "#0b0f15",
          color: "#ffffff",
          zIndex: 10,
          boxShadow: "4px 0 25px rgba(0, 0, 0, 0.6)",
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          borderRight: "1px solid #1e2735",
        }}
      >
        {/* Üst Logo ve Kapat Butonu */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #1e2735",
            paddingBottom: "1.25rem",
            flexShrink: 0,
          }}
        >
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
            type="button"
            onClick={onClose}
            aria-label="Menüyü kapat"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              color: "#a8a29e",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Kaydırılabilir İçerik Alanı */}
        <div style={{ flex: "1 1 auto", overflowY: "auto", padding: "1.5rem 0" }} className="space-y-6">
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
              {Array.isArray(categories) &&
                categories
                  .filter(
                    (c) =>
                      c &&
                      c.slug &&
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
              Kurumsal & Bilgi
            </p>
            <div className="space-y-2">
              <Link
                href="/hakkimizda"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 text-xs font-medium text-stone-300 hover:text-white transition-colors"
              >
                <Box size={15} className="text-[#c5a880]" /> Hakkımızda & Kurumsal
              </Link>
              <Link
                href="/hikayemiz"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 text-xs font-medium text-stone-300 hover:text-white transition-colors"
              >
                <Box size={15} className="text-[#c5a880]" /> Hikayemiz & Koku Felsefesi
              </Link>
              <Link
                href="/hakkimizda#laboratuvar"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 text-xs font-medium text-stone-300 hover:text-white transition-colors"
              >
                <Box size={15} className="text-[#c5a880]" /> Laboratuvar & Üretim
              </Link>
              <Link
                href="/iletisim"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 text-xs font-medium text-stone-300 hover:text-white transition-colors"
              >
                <HelpCircle size={15} className="text-[#c5a880]" /> Butik Showroom & Fabrika
              </Link>
              <Link
                href="/iletisim#iletisim-formu"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 text-xs font-medium text-stone-300 hover:text-white transition-colors"
              >
                <HelpCircle size={15} className="text-[#c5a880]" /> İletişim & Danışma
              </Link>
              <Link
                href="/siparis-takip"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 text-xs font-medium text-stone-300 hover:text-white transition-colors"
              >
                <Package size={15} className="text-[#c5a880]" /> Sipariş & Kargo Takip
              </Link>
              <Link
                href="/hesabim"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 text-xs font-medium text-stone-300 hover:text-white transition-colors"
              >
                <User size={15} className="text-[#c5a880]" /> Müşteri Hesabı
              </Link>
            </div>
          </div>
        </div>

        {/* Alt Telif Metni */}
        <div
          style={{
            borderTop: "1px solid #1e2735",
            paddingTop: "1rem",
            fontSize: "11px",
            color: "#78716c",
            fontFamily: "monospace",
            flexShrink: 0,
          }}
        >
          <p>© 2026 Dr. Mars Kozmetik A.Ş.</p>
        </div>
      </nav>
    </div>
  );

  return createPortal(content, document.body);
}
