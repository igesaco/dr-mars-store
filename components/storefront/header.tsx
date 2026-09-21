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

  return (
    <>
      {announcementText && (
        <div className="bg-[#0b0f15] text-[#dfcca8] border-b border-[#c5a880]/20 text-center text-[10.5px] font-bold tracking-[0.18em] py-2 px-4 uppercase">
          {announcementText}
        </div>
      )}

      <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#e7e3d8] transition-all">
        <div className="mx-auto max-w-7xl h-20 px-4 sm:px-8 flex items-center justify-between">
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

          {/* Orta Kurumsal Menü */}
          <nav className="hidden lg:flex items-center gap-9 text-[11px] font-bold tracking-[0.16em] uppercase text-stone-700">
            <Link href="/kategori/kolonyalar" className="hover:text-[#91754f] transition-colors">
              Kolonyalar
            </Link>
            {categories
              .filter((c) => c.slug !== "kolonyalar")
              .map((cat) => (
                <Link
                  key={cat.id}
                  href={`/kategori/${cat.slug}`}
                  className="hover:text-[#91754f] transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            <Link href="/hakkimizda" className="hover:text-[#91754f] transition-colors">
              Hakkımızda
            </Link>
            <Link href="/iletisim" className="hover:text-[#91754f] transition-colors">
              Butik & Fabrika
            </Link>
            <Link href="/siparis-takip" className="hover:text-[#91754f] transition-colors">
              Sipariş Takip
            </Link>
          </nav>

          {/* Sağ Aksiyon İkonları */}
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
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Menüyü Aç"
              className="lg:hidden p-2 text-stone-700 hover:text-[#0b0f15] transition-colors"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
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
