"use client";

import Link from "next/link";
import { ArrowUpRight, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { useWishlist } from "@/components/wishlist/wishlist-context";

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

const tones = ["lime", "blue", "violet", "lime", "blue"];

export function ProductCard({
  id,
  name,
  slug,
  shortDescription,
  fragranceNotes,
  variants,
  imageUrl,
  index,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();
  const defaultVariant = variants[0];
  const toneClass = tones[index % tones.length];
  const isFav = isFavorite(id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant) return;

    addItem({
      variantId: defaultVariant.id,
      productId: defaultVariant.id,
      slug,
      name,
      variantName: defaultVariant.name,
      sku: defaultVariant.sku,
      price: Number(defaultVariant.price),
      volumeMl: defaultVariant.volumeMl ?? undefined,
      image: imageUrl ?? undefined,
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({
      id,
      name,
      slug,
      price: defaultVariant?.price ?? "0",
      imageUrl,
      shortDescription,
    });
  };

  const displayPrice = defaultVariant
    ? `₺${Number(defaultVariant.price).toLocaleString("tr-TR")}`
    : "—";

  const notesText = fragranceNotes && fragranceNotes.length > 0
    ? fragranceNotes.slice(0, 3).join(" · ")
    : shortDescription ?? "Özel koku notaları";

  return (
    <article className="product group flex flex-col justify-between">
      <Link className={`product-art ${toneClass} relative block overflow-hidden rounded`} href={`/urun/${slug}`}>
        <span>0{index + 1}</span>
        <b>
          DR
          <br />
          MARS
        </b>

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          aria-label="Favorilere ekle"
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-white hover:text-rose-600 transition-all shadow-xs"
        >
          <Heart size={18} className={isFav ? "fill-rose-500 text-rose-500" : ""} />
        </button>

        {/* Quick Add Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleQuickAdd}
            className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#101e2c] shadow-lg hover:bg-[#caff73] transition-all transform translate-y-2 group-hover:translate-y-0"
          >
            <ShoppingBag size={15} /> Sepete Ekle
          </button>
        </div>
      </Link>

      <div className="product-details mt-3 flex items-start justify-between">
        <div>
          <Link href={`/urun/${slug}`}>
            <h3 className="text-base font-bold text-stone-900 group-hover:underline">
              {name}
            </h3>
          </Link>
          <p className="text-xs text-stone-500 mt-1 capitalize">{notesText}</p>
        </div>
        <div className="text-right">
          <strong className="text-base font-black text-stone-900">{displayPrice}</strong>
          {defaultVariant?.compareAtPrice && (
            <span className="block text-xs text-stone-400 line-through">
              ₺{Number(defaultVariant.compareAtPrice).toLocaleString("tr-TR")}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
