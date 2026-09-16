import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { ArrowRight, CheckCircle2, Package, Printer, ShieldCheck, Truck } from "lucide-react";
import { getDb } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orderNumber: string }>;
};

export const metadata: Metadata = {
  title: "Siparişiniz Alındı | Dr. Mars",
  description: "Dr. Mars siparişiniz başarıyla oluşturuldu.",
};

export default async function OrderSuccessPage({ params }: Props) {
  const { orderNumber } = await params;
  const db = getDb();

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);

  if (!order) {
    notFound();
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  const [navCategories, settings] = await Promise.all([
    getStoreNavCategories(),
    getStoreSettings(),
  ]);

  const announcement = settings.announcement?.text ?? "1500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ";
  const address = order.shippingAddress as Record<string, string>;

  return (
    <main className="min-h-screen bg-[#f5f4ee] text-[#0b1724]">
      <Header categories={navCategories} announcementText={announcement} />

      <section className="mx-auto max-w-4xl px-6 py-16 sm:px-12">
        {/* Success Banner */}
        <div className="rounded-3xl border border-stone-200 bg-white p-8 sm:p-12 shadow-sm text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={46} />
          </div>

          <p className="eyebrow dark justify-center mt-6">SİPARİŞİNİZ ALINDI</p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900">
            Teşekkür Ederiz!
          </h1>
          <p className="mt-3 text-stone-600 text-sm sm:text-base max-w-lg mx-auto">
            Siparişiniz başarıyla kaydedildi ve hazırlık aşamasına alındı. Sipariş detayları ve kargo bilgileri e-posta adresinize gönderildi.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-stone-100 px-6 py-3 font-mono text-sm font-bold text-stone-900">
            <span>Sipariş No:</span>
            <strong className="text-base text-[#101e2c]">{order.orderNumber}</strong>
          </div>

          {/* Quick Info Grid */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-stone-100 pt-8 text-left text-xs">
            <div className="rounded-xl bg-stone-50 p-4">
              <span className="text-stone-500 font-bold block mb-1">Sipariş Durumu</span>
              <strong className="text-sm font-black text-stone-900 capitalize">
                {order.status === "paid" ? "Ödeme Alındı (Hazırlanıyor)" : "Onay Bekliyor"}
              </strong>
            </div>
            <div className="rounded-xl bg-stone-50 p-4">
              <span className="text-stone-500 font-bold block mb-1">Kargo Firması</span>
              <strong className="text-sm font-black text-stone-900">
                {order.cargoCompany ?? "Yurtiçi Kargo"}
              </strong>
            </div>
            <div className="rounded-xl bg-stone-50 p-4">
              <span className="text-stone-500 font-bold block mb-1">Ödeme Durumu</span>
              <strong className="text-sm font-black text-emerald-800 capitalize">
                {order.paymentStatus === "paid" ? "Tahsil Edildi" : "Havale / Kapıda Ödeme"}
              </strong>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="mt-8 grid sm:grid-cols-2 gap-8">
          {/* Teslimat Bilgisi */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-black uppercase tracking-wider text-stone-900 mb-4 flex items-center gap-2">
              <Truck size={17} /> Teslimat Adresi
            </h3>
            <div className="space-y-1 text-xs text-stone-600">
              <p className="font-bold text-stone-900 text-sm">{address.recipientName}</p>
              <p>{address.phone}</p>
              <p>{address.addressLine}</p>
              <p>
                {address.district} / {address.city} {address.postalCode}
              </p>
            </div>
          </div>

          {/* Sipariş Özeti */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-black uppercase tracking-wider text-stone-900 mb-4 flex items-center gap-2">
              <Package size={17} /> Sipariş Kalemleri
            </h3>
            <div className="divide-y divide-stone-100 text-xs text-stone-700">
              {items.map((item) => (
                <div key={item.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-bold">{item.productName}</span>
                    <p className="text-stone-500 text-[11px]">
                      {item.variantName} × {item.quantity} adet
                    </p>
                  </div>
                  <strong className="font-bold text-stone-900">
                    ₺{Number(item.lineTotal).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-stone-200 pt-3 space-y-1 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Ara Toplam</span>
                <span>₺{Number(order.subtotal).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>İndirim</span>
                  <span>-₺{Number(order.discountAmount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Kargo</span>
                <span>
                  {Number(order.shippingAmount) === 0 ? "Ücretsiz" : `₺${Number(order.shippingAmount).toLocaleString("tr-TR")}`}
                </span>
              </div>
              <div className="flex justify-between font-black text-stone-900 text-sm pt-2 border-t border-stone-100">
                <span>Toplam Tutar</span>
                <span>₺{Number(order.totalAmount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/siparis/${order.orderNumber}/fatura`}
            target="_blank"
            className="flex items-center gap-2 rounded-xl bg-stone-900 px-7 py-4 text-xs font-black uppercase tracking-wider text-white shadow hover:bg-black transition-colors"
          >
            <Printer size={16} /> E-Arşiv Faturası / Fiş
          </Link>
          <Link
            href="/siparis-takip"
            className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-7 py-4 text-xs font-black uppercase tracking-wider text-stone-800 hover:bg-stone-50 transition-colors"
          >
            Sipariş Takibi <ArrowRight size={16} />
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-stone-200 bg-stone-100 px-7 py-4 text-xs font-black uppercase tracking-wider text-stone-700 hover:bg-stone-200 transition-colors"
          >
            Alışverişe Devam Et
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
