"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Sparkles, Trash2, X } from "lucide-react";
import { useCart } from "./cart-context";

export function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    isDrawerOpen,
    closeDrawer,
    subtotal,
    shippingCost,
    shippingDiff,
    freeShippingThreshold,
    total,
  } = useCart();

  if (!isDrawerOpen) return null;

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Karartma */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Kayar Panel */}
      <aside
        className="relative z-10 flex h-full w-full max-w-md flex-col bg-[#faf8f5] text-[#11161f] shadow-2xl transition-transform"
        role="dialog"
        aria-modal="true"
        aria-label="Alışveriş Çantası"
      >
        {/* Başlık */}
        <div className="flex items-center justify-between border-b border-[#e7e3d8] bg-white px-6 py-5">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={20} className="text-[#8f7351]" />
            <h2 className="text-base font-serif-luxury font-bold tracking-tight text-stone-950">
              Alışveriş Çantam
            </h2>
            <span className="rounded-full bg-[#0e131a] px-2 py-0.5 text-[11px] font-bold text-[#dfcca8]">
              {items.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={closeDrawer}
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Ücretsiz Kargo İlerleme Çubuğu */}
        <div className="border-b border-[#e7e3d8] bg-[#f5f2eb] px-6 py-3.5">
          {shippingDiff > 0 ? (
            <p className="text-xs text-stone-700">
              Ücretsiz sigortalı teslimat için sepetinize{" "}
              <strong className="text-stone-950 font-bold">
                ₺{shippingDiff.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </strong>{" "}
              daha ürün ekleyin.
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-xs font-bold text-[#8f7351]">
              <Sparkles size={14} className="text-[#c5a880]" /> Tebrikler! Siparişinizde kargo ücretsiz.
            </p>
          )}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#ded9cd]">
            <div
              className="h-full bg-[#c5a880] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Ürün Listesi */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="rounded-full bg-white border border-[#e7e3d8] p-6 text-stone-400 shadow-sm">
                <ShoppingBag size={44} strokeWidth={1.5} className="text-[#8f7351]" />
              </div>
              <h3 className="mt-4 text-base font-serif-luxury font-bold text-stone-900">
                Çantanız Henüz Boş
              </h3>
              <p className="mt-1 text-xs text-stone-500 max-w-xs leading-relaxed">
                Doğal akik taşlı niş kolonyalarımızı ve koku piramidi notalarını keşfedebilirsiniz.
              </p>
              <button
                onClick={closeDrawer}
                className="mt-6 rounded-xl bg-[#0e131a] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#dfcca8] hover:bg-[#1a2330] transition-colors cursor-pointer"
              >
                Koleksiyonu Keşfet
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#e7e3d8]">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4 py-4">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#111722] border border-[#c5a880]/30 text-[9px] font-bold text-[#dfcca8] tracking-widest uppercase overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <span>DR. MARS</span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/urun/${item.slug}`}
                          onClick={closeDrawer}
                          className="font-bold text-stone-900 hover:text-[#8f7351] transition-colors text-sm"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-stone-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                          aria-label="Ürünü sil"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {item.variantName} {item.sku ? `· ${item.sku}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center rounded-lg border border-[#ded9cd] bg-white">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 cursor-pointer"
                          aria-label="Adet azalt"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 cursor-pointer"
                          aria-label="Adet artır"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-black text-stone-950">
                        ₺{(item.price * item.quantity).toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Alt Toplam & Checkout */}
        {items.length > 0 && (
          <div className="border-t border-[#e7e3d8] bg-white p-6 shadow-xl">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Ara Toplam</span>
                <span>
                  ₺{subtotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Kargo</span>
                <span>
                  {shippingCost === 0 ? (
                    <strong className="text-emerald-700 font-bold">Ücretsiz</strong>
                  ) : (
                    `₺${shippingCost.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`
                  )}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#e7e3d8] pt-2 text-base font-black text-stone-950">
                <span>Toplam</span>
                <span>
                  ₺{total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Link
                href="/sepet"
                onClick={closeDrawer}
                className="flex items-center justify-center rounded-xl border border-[#232c3a] py-3 text-xs font-bold uppercase tracking-wider text-[#11161f] hover:bg-[#faf8f5] transition-colors"
              >
                Sepete Git
              </Link>
              <Link
                href="/odeme"
                onClick={closeDrawer}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#c5a880] py-3 text-xs font-bold uppercase tracking-wider text-[#0e131a] hover:bg-[#dfcca8] transition-colors shadow-md"
              >
                Ödemeye Geç <ArrowRight size={14} />
              </Link>
            </div>
            <p className="mt-3 text-center text-[10.5px] text-stone-500 font-mono">
              🔒 256-Bit SSL · 3D Secure Güvencesi
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
