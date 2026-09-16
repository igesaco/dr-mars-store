import Link from "next/link";
import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { CheckCircle2, Clock, Package, Search, Truck } from "lucide-react";
import { getDb } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sipariş Takibi | Dr. Mars Modern Cologne",
  description: "Dr. Mars siparişinizin kargo ve hazırlık durumunu sorgulayın.",
};

type Props = {
  searchParams: Promise<{ orderNumber?: string; email?: string }>;
};

const statusLabels: Record<string, { label: string; step: number; color: string }> = {
  pending: { label: "Sipariş Alındı / Onay Bekliyor", step: 1, color: "text-amber-600" },
  paid: { label: "Ödeme Onaylandı / Sıraya Alındı", step: 2, color: "text-blue-600" },
  preparing: { label: "Özenle Hazırlanıyor", step: 3, color: "text-indigo-600" },
  shipped: { label: "Kargoya Verildi", step: 4, color: "text-purple-600" },
  delivered: { label: "Teslim Edildi", step: 5, color: "text-emerald-600" },
  cancelled: { label: "İptal Edildi", step: 0, color: "text-red-600" },
  refunded: { label: "İade Edildi", step: 0, color: "text-stone-500" },
};

export default async function OrderTrackingPage({ searchParams }: Props) {
  const { orderNumber = "", email = "" } = await searchParams;
  const cleanOrder = orderNumber.trim().toUpperCase();
  const cleanEmail = email.trim().toLowerCase();

  let orderData = null;
  let itemsData: any[] = [];
  let errorMsg = null;

  if (cleanOrder) {
    try {
      const db = getDb();
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, cleanOrder))
        .limit(1);

      if (order) {
        // E-posta eşleşmesi kontrolü (eğer e-posta girilmişse)
        const addr = order.shippingAddress as Record<string, string>;
        if (cleanEmail && addr?.email?.toLowerCase() !== cleanEmail) {
          errorMsg = "Sipariş numarası ile e-posta adresi eşleşmiyor.";
        } else {
          orderData = order;
          itemsData = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, order.id));
        }
      } else {
        errorMsg = "Belirtilen sipariş numarasına ait kayıt bulunamadı.";
      }
    } catch {
      errorMsg = "Sipariş bilgisi sorgulanırken bir hata oluştu.";
    }
  }

  const [navCategories, settings] = await Promise.all([
    getStoreNavCategories(),
    getStoreSettings(),
  ]);

  const announcement = settings.announcement?.text ?? "1500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ";
  const currentStep = orderData ? statusLabels[orderData.status]?.step ?? 1 : 0;

  return (
    <main className="min-h-screen bg-[#f5f4ee] text-[#0b1724]">
      <Header categories={navCategories} announcementText={announcement} />

      <section className="mx-auto max-w-4xl px-6 py-16 sm:px-12">
        {/* Top heading */}
        <div className="text-center mb-12">
          <p className="eyebrow dark justify-center">GÖNDERİ DURUMU</p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900">
            Sipariş Takibi
          </h1>
          <p className="mt-2 text-stone-600 text-sm max-w-md mx-auto">
            Siparişinizin kargo ve teslimat aşamasını anlık olarak takip edebilirsiniz.
          </p>
        </div>

        {/* Tracking Query Form */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs mb-10">
          <form method="get" className="grid sm:grid-cols-[1fr_1fr_auto] gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Sipariş Numarası *
              </label>
              <input
                type="text"
                name="orderNumber"
                required
                defaultValue={cleanOrder}
                placeholder="Örn: DRM-2026-123456"
                className="w-full rounded-lg border border-stone-300 p-3 text-sm uppercase font-mono outline-none focus:border-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                E-posta Adresi (Doğrulama İçin)
              </label>
              <input
                type="email"
                name="email"
                defaultValue={cleanEmail}
                placeholder="ahmet@example.com"
                className="w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-stone-900"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#101e2c] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-black transition-colors"
              >
                <Search size={15} /> Sorgula
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Query Result Card */}
        {orderData && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-5 gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-stone-500">SİPARİŞ NO</span>
                  <h2 className="text-xl font-black text-stone-900">{orderData.orderNumber}</h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Tarih: {new Date(orderData.createdAt).toLocaleDateString("tr-TR", { dateStyle: "long" })}
                  </p>
                </div>
                <div className="sm:text-right">
                  <span className="text-xs font-bold text-stone-500 block mb-1">GÜNCEL DURUM</span>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-black bg-stone-100 ${statusLabels[orderData.status]?.color ?? "text-stone-900"}`}>
                    {statusLabels[orderData.status]?.label ?? orderData.status}
                  </span>
                </div>
              </div>

              {/* Progress Steps (Timeline) */}
              <div className="py-8">
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  {[
                    { step: 1, label: "Alındı" },
                    { step: 2, label: "Onaylandı" },
                    { step: 3, label: "Hazırlanıyor" },
                    { step: 4, label: "Kargoda" },
                    { step: 5, label: "Teslim Edildi" },
                  ].map((s) => {
                    const isDone = currentStep >= s.step;
                    const isCurrent = currentStep === s.step;
                    return (
                      <div key={s.step} className="flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all ${
                            isDone
                              ? "bg-[#101e2c] text-white"
                              : "bg-stone-200 text-stone-400"
                          } ${isCurrent ? "ring-4 ring-lime-300" : ""}`}
                        >
                          {isDone ? <CheckCircle2 size={16} /> : s.step}
                        </div>
                        <span className={`mt-2 font-bold text-[11px] ${isDone ? "text-stone-900" : "text-stone-400"}`}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cargo Information Box */}
              {orderData.cargoTrackingNumber && (
                <div className="rounded-xl bg-purple-50 border border-purple-200 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Truck className="text-purple-700" size={24} />
                    <div>
                      <p className="font-bold text-xs text-purple-950">
                        {orderData.cargoCompany ?? "Yurtiçi Kargo"} Takip Kodu
                      </p>
                      <p className="font-mono text-sm font-black text-purple-900 mt-0.5">
                        {orderData.cargoTrackingNumber}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-purple-700">Yolda</span>
                </div>
              )}

              {/* Items List */}
              <div className="mt-8 border-t border-stone-100 pt-6">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 mb-4 flex items-center gap-1.5">
                  <Package size={15} /> Sipariş Kalemleri
                </h3>
                <div className="divide-y divide-stone-100 text-xs text-stone-700">
                  {itemsData.map((item) => (
                    <div key={item.id} className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-stone-900">{item.productName}</span>
                        <p className="text-stone-500 text-[11px]">
                          {item.variantName} × {item.quantity} adet
                        </p>
                      </div>
                      <span className="font-extrabold text-stone-900">
                        ₺{Number(item.lineTotal).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
