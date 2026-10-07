"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Search } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";

export type ProductCardProps = {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  fragranceNotes?: string[] | null;
  tone?: string;
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
  index: number;
};

export function ProductCard({
  id,
  name,
  slug,
  variants,
  imageUrl,
  index,
}: ProductCardProps) {
  const { addItem, openDrawer } = useCart();
  const [added, setAdded] = useState(false);
  const defaultVariant = variants[0];

  const priceNum = defaultVariant ? Number(defaultVariant.price) : 0;
  const compareNum = defaultVariant?.compareAtPrice ? Number(defaultVariant.compareAtPrice) : 0;

  const isOutOfStock = !defaultVariant || defaultVariant.stock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant || isOutOfStock) return;

    addItem({
      variantId: defaultVariant.id,
      productId: defaultVariant.id,
      slug,
      name,
      variantName: defaultVariant.name,
      sku: defaultVariant.sku,
      price: priceNum,
      volumeMl: defaultVariant.volumeMl ?? undefined,
      image: imageUrl ?? undefined,
    });

    setAdded(true);
    openDrawer();
    setTimeout(() => setAdded(false), 2000);
  };

  const displayPrice = defaultVariant
    ? `₺${priceNum.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "—";

  return (
    <article className="group flex flex-col items-center text-center p-2 sm:p-4 bg-white transition-all">
      {/* Ürün Görseli (Saf Beyaz zemin, dikey stüdyo fotoğrafı) */}
      <Link
        href={`/urun/${slug}`}
        className="relative h-64 sm:h-80 w-full flex items-center justify-center mb-3 bg-white overflow-hidden"
      >
        {isOutOfStock && (
          <div className="absolute top-2 left-2 z-10 rounded-md bg-[#0e131a]/90 backdrop-blur-md px-2.5 py-1 text-[9.5px] font-black uppercase tracking-wider text-[#dfcca8] border border-[#c5a880]/40 shadow-sm">
            Tükendi · Yakında Stokta
          </div>
        )}

        {imageUrl ? (
          <div className="relative h-full w-full">
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              className="object-contain p-1 mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
              priority={index < 4}
            />
          </div>
        ) : (
          <div className="relative flex flex-col items-center transition-transform duration-300 group-hover:scale-105">
            <div className="h-6 w-8 rounded-t bg-stone-300" />
            <div className="h-2 w-4 bg-stone-200" />
            <div className="relative flex h-36 w-24 flex-col items-center justify-center rounded-xl border border-stone-200 bg-amber-50/40">
              <div className="text-[9px] font-bold text-stone-600">DR. MARS</div>
            </div>
          </div>
        )}
      </Link>

      {/* Ürün Başlığı (Ortalı ve Hacim Bilgili) */}
      <Link
        href={`/urun/${slug}`}
        className="text-xs sm:text-[13.5px] text-stone-800 hover:text-[#27382f] transition-colors leading-snug line-clamp-2 min-h-[2.4rem] flex items-center justify-center max-w-[260px] font-medium"
      >
        {name} {defaultVariant?.volumeMl ? `· ${defaultVariant.volumeMl} ml Sprey Flakon` : "· 150 ml Akik Taşlı"}
      </Link>

      {/* Fiyat (Ortalı) */}
      <div className="mt-2 mb-3.5 flex items-center justify-center gap-2">
        <span className="text-sm sm:text-base font-semibold text-stone-950">
          {displayPrice}
        </span>
        {compareNum > 0 && (
          <span className="text-xs text-stone-400 line-through">
            ₺{compareNum.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        )}
      </div>

      {/* Butonlar: [ 🔍 (İncele) ] [ Sepete Ekle / Tükendi ] */}
      <div className="w-full flex items-center justify-center gap-2 max-w-[230px]">
        <Link
          href={`/urun/${slug}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#27382f] text-white hover:bg-[#1a2620] transition-colors cursor-pointer shadow-xs"
          title="Ürünü İncele"
        >
          <Search size={16} />
        </Link>

        <button
          onClick={handleQuickAdd}
          disabled={isOutOfStock}
          className={`flex-1 h-10 flex items-center justify-center rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-xs ${
            isOutOfStock
              ? "bg-stone-200 text-stone-500 cursor-not-allowed hover:bg-stone-200"
              : "bg-[#27382f] text-white hover:bg-[#1a2620] cursor-pointer"
          }`}
        >
          {isOutOfStock ? (
            <span className="text-stone-500 font-medium">Tükendi</span>
          ) : added ? (
            <span className="flex items-center gap-1 text-emerald-300 font-bold">
              <Check size={14} className="stroke-[3]" /> Eklendi
            </span>
          ) : (
            "Sepete Ekle"
          )}
        </button>
      </div>

      {isOutOfStock && (
        <p className="mt-2 text-[10.5px] font-bold text-[#8f7351] tracking-wide">
          ✨ Çok yakında tekrar stoklarımızda
        </p>
      )}
    </article>
  );
}
