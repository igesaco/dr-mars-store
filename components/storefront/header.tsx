"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { useWishlist } from "@/components/wishlist/wishlist-context";
import { SearchModal } from "./search-modal";
import { MobileMenu } from "./mobile-menu";

export type NavCategory = {
  id: string;
  name: string;
  slug: string;
};

export const getCategoryIcon = (slug: string, name: string) => {
  const s = `${slug} ${name}`.toLowerCase();
  if (s.includes("kolonya")) return "🌿";
  if (s.includes("oda")) return "🏠";
  if (s.includes("oto") || s.includes("arac") || s.includes("araç")) return "🚗";
  if (s.includes("parfum") || s.includes("parfüm")) return "💎";
  if (s.includes("hediye") || s.includes("set")) return "🎁";
  if (s.includes("özel") || s.includes("ozel")) return "✨";
  if (s.includes("mum")) return "🕯️";
  if (s.includes("sabun") || s.includes("banyo")) return "🫧";
  return "🏷️";
};

const DEFAULT_CATEGORIES: NavCategory[] = [
  { id: "def-1", name: "KOLONYALAR", slug: "kolonyalar" },
  { id: "def-2", name: "ODA KOKULARI", slug: "oda-kokulari" },
  { id: "def-3", name: "OTO KOKULARI", slug: "oto-kokulari" },
  { id: "def-4", name: "PARFÜMLER", slug: "parfumler" },
  { id: "def-5", name: "HEDİYE SETLERİ", slug: "hediye-setleri" },
];

export function Header({
  categories = [],
  announcementText = "MARDİN OSB LABORATUVARLARINDAN · 1500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ",
}: {
  categories?: NavCategory[];
  announcementText?: string;
}) {
  const { itemCount, openDrawer } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navList = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  return (
    <>
      {announcementText && (
        <div className="bg-[#0b0f15] text-[#dfcca8] border-b border-[#c5a880]/20 text-center text-[10.5px] font-bold tracking-[0.18em] py-2 px-4 uppercase">
          {announcementText}
        </div>
      )}

      <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#e7e3d8] transition-all">
        <div className="mx-auto max-w-7xl h-16 sm:h-20 px-3.5 sm:px-8 flex items-center justify-between">
          {/* Lüks Marka Logosu */}
          <Link className="flex flex-col items-start leading-none group cursor-pointer" href="/">
            <div className="flex items-center gap-1.5 text-xl sm:text-2xl font-black tracking-widest text-[#0b0f15] group-hover:text-[#91754f] transition-colors">
              <span>DR</span>
              <span className="inline-block w-1.5 h-1.5 bg-[#c5a880] rounded-full mx-0.5" />
              <span>MARS</span>
            </div>
            <span className="text-[8.5px] font-bold tracking-[0.3em] text-[#8f7351] uppercase mt-1">
              HAUTE PARFUMERIE · MARDİN
            </span>
          </Link>

          {/* ORTA: KURUMSAL MENÜ (Sadece Kurumsal & Marka Sayfaları) */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-8 text-[11px] font-bold tracking-[0.16em] uppercase text-stone-700">
            <Link
              href="/hakkimizda"
              className="hover:text-[#91754f] transition-colors py-1 relative group"
            >
              <span>Hakkımızda</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#91754f] group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="/hikayemiz"
              className="hover:text-[#91754f] transition-colors py-1 relative group"
            >
              <span>Hikayemiz</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#91754f] group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="/hakkimizda#laboratuvar"
              className="hover:text-[#91754f] transition-colors py-1 relative group"
            >
              <span>Laboratuvar & Üretim</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#91754f] group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="/iletisim"
              className="hover:text-[#91754f] transition-colors py-1 relative group"
            >
              <span>Butik & Fabrika</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#91754f] group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="/iletisim#iletisim-formu"
              className="hover:text-[#91754f] transition-colors py-1 relative group"
            >
              <span>İletişim</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#91754f] group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="/siparis-takip"
              className="hover:text-[#91754f] transition-colors py-1 relative group"
            >
              <span>Sipariş Takip</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#91754f] group-hover:w-full transition-all duration-300" />
            </Link>
          </nav>

          {/* SAĞ: AKSİYON İKONLARI */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Koleksiyonda Ara"
              className="p-2 text-stone-700 hover:text-[#0b0f15] transition-colors cursor-pointer"
            >
              <Search size={18} />
            </button>

            <Link
              href="/favorilerim"
              aria-label="Favorilerim"
              className="relative p-2 text-stone-700 hover:text-[#0b0f15] transition-colors"
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#91754f] px-1 text-[9.5px] font-bold text-white shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/hesabim"
              aria-label="Müşteri Hesabı"
              className="p-2 text-stone-700 hover:text-[#0b0f15] transition-colors hidden sm:inline-flex"
            >
              <User size={18} />
            </Link>

            <button
              onClick={openDrawer}
              aria-label="Alışveriş Çantası"
              className="relative p-2 text-stone-700 hover:text-[#0b0f15] transition-colors flex items-center cursor-pointer"
            >
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0b0f15] border border-[#c5a880] px-1 text-[9.5px] font-bold text-[#dfcca8] shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Menüyü Aç"
              className="lg:hidden p-2 text-stone-700 hover:text-[#0b0f15] transition-colors cursor-pointer"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* ALT HEADER: KATEGORİLER (Sadece Ürün Kategorileri) */}
        <nav
          aria-label="Ürün Kategorileri"
          className="border-t border-[#e7e3d8] bg-[#f4f1ea]/95 backdrop-blur-xs py-2 px-3 sm:px-8 overflow-x-auto no-scrollbar shadow-2xs"
        >
          <div className="mx-auto max-w-7xl flex items-center justify-start lg:justify-center gap-1 sm:gap-3 text-[11px] font-black uppercase tracking-[0.13em] text-stone-700 whitespace-nowrap">
            <Link
              href="/#urunler"
              className="px-3.5 py-1.5 rounded-full hover:bg-white hover:text-stone-950 transition-all flex items-center gap-1.5"
            >
              <span className="text-xs">✨</span>
              <span>TÜM ÜRÜNLER</span>
            </Link>

            {navList.map((cat) => (
              <span key={cat.id} className="flex items-center gap-1 sm:gap-3">
                <span className="text-stone-300 select-none">•</span>
                <Link
                  href={`/kategori/${cat.slug}`}
                  className="px-3.5 py-1.5 rounded-full hover:bg-white hover:text-stone-950 transition-all flex items-center gap-1.5"
                >
                  <span className="text-xs">{getCategoryIcon(cat.slug, cat.name)}</span>
                  <span>{cat.name}</span>
                </Link>
              </span>
            ))}
          </div>
        </nav>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={categories}
      />
    </>
  );
}
