"use client";

import Link from "next/link";
import { ArrowRight, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "@/components/wishlist/wishlist-context";
import { useCart } from "@/components/cart/cart-context";
import { toast } from "sonner";

export function WishlistClient() {
  const { items, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (item: any) => {
    addItem({
      variantId: item.id,
      productId: item.id,
      slug: item.slug,
      name: item.name,
      variantName: "100 ML",
      sku: "DRM-FAV",
      price: Number(item.price) || 349,
      image: item.imageUrl,
    });
    toast.success(`${item.name} sepete eklendi!`);
  };

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 text-rose-500">
          <Heart size={44} strokeWidth={1.5} />
        </div>
        <p className="eyebrow dark justify-center mt-6">İSTEK LİSTESİ</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Favori Listeniz Boş
        </h1>
        <p className="mt-3 text-stone-600 max-w-md mx-auto text-sm">
          Beğendiğiniz kolonyaları kalp ikonuna tıklayarak favorilerinize ekleyebilir, daha sonra kolayca sipariş verebilirsiniz.
        </p>
        <Link
          href="/kategori/kolonyalar"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#101e2c] px-8 py-4 text-xs font-black uppercase tracking-wider text-white shadow hover:bg-black transition-colors"
        >
          Koleksiyonu Keşfet <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 sm:px-12">
      <div className="border-b border-stone-200 pb-6 mb-8">
        <p className="eyebrow dark">BEĞENDİĞİNİZ KOKULAR</p>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-stone-900">
          Favorilerim ({items.length} Ürün)
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <article
            key={item.id}
            className="group rounded-2xl border border-stone-200 bg-white p-4 shadow-xs flex flex-col justify-between"
          >
            <div className="relative aspect-square rounded-xl bg-gradient-to-br from-[#d7ff99] to-[#849649] flex items-center justify-center text-white p-4 overflow-hidden">
              <span className="font-black text-2xl tracking-tighter text-center">
                DR
                <br />
                MARS
              </span>
              <button
                onClick={() => removeFromWishlist(item.id)}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-stone-700 hover:text-red-600 transition-colors"
                aria-label="Favorilerden kaldır"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="mt-4 flex flex-col flex-1 justify-between">
              <div>
                <Link href={`/urun/${item.slug}`} className="font-bold text-stone-900 hover:underline">
                  {item.name}
                </Link>
                {item.shortDescription && (
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                    {item.shortDescription}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-base font-black text-stone-900">
                  ₺{Number(item.price).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </span>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="flex items-center gap-1.5 rounded-lg bg-[#101e2c] px-3.5 py-2 text-xs font-bold text-white hover:bg-black transition-colors"
                >
                  <ShoppingBag size={14} /> Sepete Ekle
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
