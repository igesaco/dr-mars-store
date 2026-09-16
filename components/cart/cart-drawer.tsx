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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Slide-over Panel */}
      <aside
        className="relative z-10 flex h-full w-full max-w-md flex-col bg-[#fbfbfa] text-[#0b1724] shadow-2xl transition-transform"
        role="dialog"
        aria-modal="true"
        aria-label="Alışveriş Sepeti"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} />
            <h2 className="text-lg font-extrabold tracking-tight">Sepetim</h2>
            <span className="rounded-full bg-[#101e2c] px-2 py-0.5 text-xs font-bold text-white">
              {items.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={closeDrawer}
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors"
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="border-b border-stone-200 bg-[#eef1ec] px-6 py-3">
          {shippingDiff > 0 ? (
            <p className="text-xs font-semibold text-stone-700">
              Ücretsiz kargo için sepetinize{" "}
              <strong className="text-stone-900">
                ₺{shippingDiff.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </strong>{" "}
              daha ürün ekleyin!
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <Sparkles size={14} /> Tebrikler! Kargo ücretsiz.
            </p>
          )}
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-300">
            <div
              className="h-full bg-[#101e2c] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="rounded-full bg-stone-100 p-6 text-stone-400">
                <ShoppingBag size={48} strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 text-lg font-bold">Sepetiniz şu an boş</h3>
              <p className="mt-1 text-sm text-stone-500">
                Eşsiz kokularımızı keşfetmeye başlayabilirsiniz.
              </p>
              <button
                onClick={closeDrawer}
                className="mt-6 rounded bg-[#101e2c] px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-black transition-colors"
              >
                Koleksiyonu İncele
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-stone-200">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4 py-4">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded bg-stone-200 text-xs font-black">
                    DR MARS
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/urun/${item.slug}`}
                          onClick={closeDrawer}
                          className="font-bold text-stone-900 hover:underline"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-stone-400 hover:text-red-600 transition-colors p-1"
                          aria-label="Ürünü sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {item.variantName} {item.sku ? `· ${item.sku}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center rounded border border-stone-300 bg-white">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-2.5 py-1 text-stone-600 hover:bg-stone-100"
                          aria-label="Adet azalt"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="px-2.5 py-1 text-stone-600 hover:bg-stone-100"
                          aria-label="Adet artır"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <span className="text-sm font-extrabold text-stone-900">
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

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-200 bg-white p-6 shadow-lg">
            <div className="space-y-2 text-sm">
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
                    <strong className="text-emerald-700">Ücretsiz</strong>
                  ) : (
                    `₺${shippingCost.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`
                  )}
                </span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-extrabold text-stone-900">
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
                className="flex items-center justify-center rounded border border-[#101e2c] py-3 text-xs font-bold uppercase tracking-wider text-[#101e2c] hover:bg-stone-100 transition-colors"
              >
                Sepete Git
              </Link>
              <Link
                href="/odeme"
                onClick={closeDrawer}
                className="flex items-center justify-center gap-1.5 rounded bg-[#101e2c] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-black transition-colors"
              >
                Ödemeye Geç <ArrowRight size={15} />
              </Link>
            </div>
            <p className="mt-3 text-center text-[11px] text-stone-500">
              🔒 256-Bit SSL ile Güvenli Alışveriş
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
