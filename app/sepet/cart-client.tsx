"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Minus, Plus, ShoppingBag, Sparkles, Tag, Trash2, X } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";

export function CartClient() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    shippingCost,
    shippingDiff,
    freeShippingThreshold,
    discountAmount,
    total,
    coupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponMessage(null);

    const res = await applyCoupon(couponInput);
    setCouponLoading(false);
    setCouponMessage({
      text: res.message,
      isError: !res.success,
    });
    if (res.success) setCouponInput("");
  };

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-stone-200/70 text-stone-500">
          <ShoppingBag size={44} strokeWidth={1.5} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8f7351] block mt-6 mb-2">
          SEPETİNİZ HENÜZ BOŞ
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-stone-900 tracking-tight">
          Alışveriş Çantanızda Ürün Bulunmuyor
        </h1>
        <p className="mt-3 text-stone-600 max-w-md mx-auto text-xs leading-relaxed font-light">
          Kimya Mühendisliği formülasyonu ve hakiki akik taşlarıyla hazırlanan Dr. Mars kolonya koleksiyonumuzu inceleyebilirsiniz.
        </p>
        <Link
          href="/kategori/kolonyalar"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#0e131a] border border-[#c5a880]/30 px-8 py-4 text-xs font-bold uppercase tracking-wider text-[#dfcca8] shadow hover:bg-[#c5a880] hover:text-[#0e131a] transition-all"
        >
          Koleksiyonu Keşfet <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 sm:px-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#e7e3d8] pb-6 mb-8 gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8f7351] block mb-1">
            ALIŞVERİŞ ÇANTASI
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold tracking-tight text-stone-900">
            Sepetiniz ({items.reduce((s, i) => s + i.quantity, 0)} Ürün)
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-stone-500 hover:text-red-600 transition-colors self-start sm:self-auto"
        >
          Sepeti Temizle
        </button>
      </div>

      {/* Free shipping bar */}
      <div className="mb-8 rounded-xl border border-stone-200 bg-[#eef1ec] p-4 sm:p-6">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-stone-800 mb-2">
          {shippingDiff > 0 ? (
            <span>
              Ücretsiz kargo için sepetinize{" "}
              <strong className="text-stone-950 font-black">
                ₺{shippingDiff.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </strong>{" "}
              tutarında daha ürün ekleyin!
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-800">
              <Sparkles size={16} /> Tebrikler! Siparişinizde kargo ücretsiz.
            </span>
          )}
          <span className="text-xs text-stone-500">{progressPercent}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-300">
          <div
            className="h-full bg-[#101e2c] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Cart Grid: Items (Left) + Summary (Right) */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        {/* Items Table */}
        <div className="space-y-4">
          <div className="rounded-xl border border-stone-200 bg-white p-6 divide-y divide-stone-100">
            {items.map((item) => (
              <div key={item.variantId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-5 gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded bg-stone-100 text-xs font-black text-stone-700 overflow-hidden border border-stone-200">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <span>DR MARS</span>
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/urun/${item.slug}`}
                      className="text-base font-bold text-stone-900 hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {item.variantName} {item.sku ? `· SKU: ${item.sku}` : ""}
                    </p>
                    <p className="text-xs font-bold text-stone-800 mt-1 sm:hidden">
                      Birim: ₺{item.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Quantity */}
                  <div className="flex items-center rounded border border-stone-300 bg-stone-50">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="px-3 py-1.5 text-stone-600 hover:bg-stone-200"
                      aria-label="Azalt"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="px-3 py-1.5 text-stone-600 hover:bg-stone-200"
                      aria-label="Artır"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Price */}
                  <span className="text-base font-black text-stone-900 min-w-24 text-right">
                    ₺{(item.price * item.quantity).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </span>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-stone-400 hover:text-red-600 transition-colors p-1"
                    aria-label="Ürünü sil"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs text-stone-600 px-2">
            <Link href="/kategori/kolonyalar" className="font-bold underline hover:text-black">
              ← Alışverişe devam et
            </Link>
            <p>Fiyatlarımıza KDV dahildir.</p>
          </div>
        </div>

        {/* Aside Summary */}
        <aside className="space-y-6">
          {/* Coupon Box */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 mb-3 flex items-center gap-1.5">
              <Tag size={15} /> İndirim Kuponu
            </h3>
            {coupon ? (
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs">
                <div>
                  <span className="font-bold text-emerald-900">{coupon.code}</span>
                  <p className="text-emerald-700 mt-0.5">
                    {coupon.type === "percent" ? `%${coupon.value} indirim uygulandı` : `₺${coupon.value} indirim uygulandı`}
                  </p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="p-1 text-emerald-800 hover:text-red-600"
                  aria-label="Kuponu kaldır"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Örn: HOSGELDIN10"
                    className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-xs uppercase font-mono tracking-wider outline-none focus:border-stone-900"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="rounded-lg bg-[#101e2c] px-4 py-2 text-xs font-bold text-white hover:bg-black transition-colors shrink-0 disabled:opacity-50"
                  >
                    Uygula
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-xs font-semibold ${couponMessage.isError ? "text-red-600" : "text-emerald-700"}`}>
                    {couponMessage.text}
                  </p>
                )}
              </form>
            )}
          </div>

          {/* Totals Box */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold tracking-tight text-stone-900 border-b border-stone-100 pb-3">
              Sipariş Özeti
            </h2>

            <div className="space-y-2.5 text-sm text-stone-600">
              <div className="flex justify-between">
                <span>Ara Toplam</span>
                <span>₺{subtotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Kupon İndirimi</span>
                  <span>-₺{discountAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Kargo Bedeli</span>
                <span>
                  {shippingCost === 0 ? (
                    <strong className="text-emerald-700">Ücretsiz</strong>
                  ) : (
                    `₺${shippingCost.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`
                  )}
                </span>
              </div>

              <div className="flex justify-between border-t border-stone-200 pt-3 text-lg font-black text-stone-900">
                <span>Genel Toplam</span>
                <span>₺{total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <Link
              href="/odeme"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c5a880] py-4 text-xs font-bold uppercase tracking-[0.16em] text-[#0a0e14] shadow-lg hover:bg-[#dfcca8] transition-all"
            >
              Ödemeye Geç <ArrowRight size={16} />
            </Link>

            <div className="pt-2 text-center text-[11px] text-stone-500 space-y-1">
              <p>🔒 256-Bit SSL Sertifikalı Güvenli Ödeme</p>
              <p>14 Gün İade ve Değişim Garantisi</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
