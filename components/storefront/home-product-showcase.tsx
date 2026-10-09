"use client";

import { useState } from "react";
import { ProductCard } from "@/components/storefront/product-card";
import { ChevronDown, ChevronRight, SlidersHorizontal } from "lucide-react";

export type ShowcaseCategory = {
  id: string;
  name: string;
  slug: string;
};

export type ShowcaseProduct = {
  id: string;
  name: string;
  slug: string;
  categoryId: string | null;
  shortDescription?: string | null;
  fragranceNotes?: string[] | null;
  isFeatured?: boolean;
  sortOrder?: number | null;
  variants: {
    id: string;
    name: string;
    sku: string;
    volumeMl?: number | null;
    price: string;
    compareAtPrice?: string | null;
    stock: number;
  }[];
  imageUrl?: string | null;
};

export function HomeProductShowcase({
  categories,
  products,
}: {
  categories: ShowcaseCategory[];
  products: ShowcaseProduct[];
}) {
  const [selectedTab, setSelectedTab] = useState<"bestsellers" | "all">("bestsellers");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("featured");

  // Filtreleme
  let filtered =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.categoryId === selectedCategory);

  if (selectedTab === "bestsellers") {
    filtered = filtered.filter((p) => p.isFeatured).length > 0
      ? filtered.filter((p) => p.isFeatured)
      : filtered;
  }

  // Sıralama
  const sortedProducts = [...filtered].sort((a, b) => {
    const priceA = Number(a.variants[0]?.price ?? 0);
    const priceB = Number(b.variants[0]?.price ?? 0);
    if (sortOption === "price-asc") return priceA - priceB;
    if (sortOption === "price-desc") return priceB - priceA;
    if (sortOption === "name-asc") return a.name.localeCompare(b.name, "tr");

    // Vitrin / Varsayılan Sıralama: Belirtilen sıra numarasına (1, 2, 3...) göre
    const orderA = a.sortOrder && a.sortOrder > 0 ? a.sortOrder : 999999;
    const orderB = b.sortOrder && b.sortOrder > 0 ? b.sortOrder : 999999;
    if (orderA !== orderB) return orderA - orderB;
    return 0;
  });

  const activeCategoryName =
    selectedCategory === "all"
      ? "Özel Koleksiyon"
      : categories.find((c) => c.id === selectedCategory)?.name || "Koleksiyon";

  return (
    <section id="urunler" className="mx-auto max-w-7xl px-4 sm:px-8 py-10 sm:py-14 bg-white">
      {/* Üst Satır: [ Filtreleme > ]  [ Kategori / Koleksiyon (Ortalı Başlık) ]  [ Sıralama Seçiniz v ] */}
      <div className="relative flex items-center justify-between gap-4 pb-4">
        {/* Sol: Filtreleme Butonu */}
        <div
          onClick={() => setSelectedCategory("all")}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 cursor-pointer"
        >
          <span>Filtreleme</span>
          <ChevronRight size={14} className="text-stone-500" />
        </div>

        {/* Orta: Başlık */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#1b2b22] tracking-normal font-normal">
            {activeCategoryName}
          </h1>
        </div>

        {/* Sağ: Sıralama Dropdown */}
        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="appearance-none bg-transparent pr-6 text-xs sm:text-sm font-medium text-stone-700 hover:text-stone-900 cursor-pointer outline-none text-right"
          >
            <option value="featured">Sıralama Seçiniz</option>
            <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
            <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
            <option value="name-asc">Ürün Adı: A - Z</option>
          </select>
          <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500" />
        </div>
      </div>

      {/* Sekmeler: [ EN ÇOK SATANLAR ] [ TÜM ÜRÜNLER ] */}
      <div className="flex items-center justify-center gap-3 pt-2 pb-5">
        <button
          onClick={() => setSelectedTab("bestsellers")}
          className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            selectedTab === "bestsellers"
              ? "bg-[#27382f] text-white shadow-xs"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          EN ÇOK SATANLAR
        </button>

        <button
          onClick={() => setSelectedTab("all")}
          className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            selectedTab === "all"
              ? "bg-[#27382f] text-white shadow-xs"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          TÜM ÜRÜNLER ({products.length})
        </button>
      </div>

      {/* İnce Çizgi Ayracı */}
      <hr className="border-stone-200 mb-8" />

      {/* Ürün Listeleme Grid'i (4 Kolonlu, Beyaz, Temiz) */}
      {sortedProducts.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
            <SlidersHorizontal size={22} />
          </div>
          <h3 className="mt-3 text-sm font-bold text-stone-800">Ürün bulunamadı</h3>
          <p className="mt-1 text-xs text-stone-500">Seçili filtre için listelenecek ürün bulunmuyor.</p>
          <button
            onClick={() => {
              setSelectedTab("all");
              setSelectedCategory("all");
            }}
            className="mt-4 rounded-lg bg-[#27382f] px-4 py-2 text-xs font-semibold text-white"
          >
            Tüm Ürünleri Göster
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {sortedProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              shortDescription={product.shortDescription}
              fragranceNotes={product.fragranceNotes}
              variants={product.variants}
              imageUrl={product.imageUrl}
              index={idx}
            />
          ))}
        </div>
      )}
    </section>
  );
}
