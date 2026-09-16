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
  announcementText = "1500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ",
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
        <div className="announcement bg-[#caff73] text-[#101e2c] text-center text-xs font-bold tracking-wider py-2 px-4 uppercase">
          {announcementText}
        </div>
      )}

      <header className="site-header sticky top-0 z-40 bg-[#f5f4ee]/90 backdrop-blur-md border-b border-stone-200/60 transition-all">
        <Link className="brand text-[#0b1724]" href="/">
          <span>DR</span>
          <i className="inline-block w-1.5 h-1.5 bg-[#849649] rounded-full mx-0.5" />
          <span>MARS</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-xs font-extrabold tracking-wider uppercase text-stone-700">
          <Link href="/kategori/kolonyalar" className="hover:text-black transition-colors">
            Kolonyalar
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              className="hover:text-black transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          <Link href="/hakkimizda" className="hover:text-black transition-colors">
            Kurumsal
          </Link>
          <Link href="/siparis-takip" className="hover:text-black transition-colors">
            Sipariş Takip
          </Link>
        </nav>

        <div className="header-actions flex items-center gap-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            aria-label="Ürün Ara"
            className="p-2 text-stone-700 hover:text-black transition-colors"
          >
            <Search size={19} />
          </button>

          <Link
            href="/favorilerim"
            aria-label="Favorilerim"
            className="relative p-2 text-stone-700 hover:text-black transition-colors"
          >
            <Heart size={19} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white animate-in zoom-in">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href="/giris"
            aria-label="Hesabım"
            className="p-2 text-stone-700 hover:text-black transition-colors hidden sm:inline-flex"
          >
            <User size={19} />
          </Link>

          <button
            onClick={openDrawer}
            aria-label="Alışveriş Çantası"
            className="relative p-2 text-stone-700 hover:text-black transition-colors flex items-center"
          >
            <ShoppingBag size={19} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#101e2c] px-1 text-[10px] font-bold text-white animate-in zoom-in">
                {itemCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Menüyü Aç"
            className="lg:hidden p-2 text-stone-700 hover:text-black transition-colors"
          >
            <Menu size={22} />
          </button>
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
