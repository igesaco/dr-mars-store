import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orderItems, orders, productImages, productVariants } from "@/db/schema";
import { Building, Package, Printer, Receipt, TrendingUp } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { updateCargoAction, updateOrderStatusAction } from "../actions";
import { OrderTimeline } from "@/components/admin/order-timeline";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

const statuses: Record<string, string> = {
  pending: "Bekliyor",
  paid: "Ödendi",
  preparing: "Hazırlanıyor",
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi",
  refunded: "İade Edildi",
};

export default async function AdminOrderDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const db = getDb();

  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);

  if (!order) {
    notFound();
  }

  // Kalemleri ürün görselleri ile birlikte çek
  const items = await db
    .select({
      id: orderItems.id,
      productName: orderItems.productName,
      variantName: orderItems.variantName,
      sku: orderItems.sku,
      unitPrice: orderItems.unitPrice,
      unitCost: orderItems.unitCost,
      quantity: orderItems.quantity,
      lineTotal: orderItems.lineTotal,
      imageUrl: productImages.url,
    })
    .from(orderItems)
    .leftJoin(productVariants, eq(orderItems.variantId, productVariants.id))
    .leftJoin(
      productImages,
      and(eq(productVariants.productId, productImages.productId), eq(productImages.sortOrder, 0))
    )
    .where(eq(orderItems.orderId, id));

  const addr = order.shippingAddress as Record<string, string>;
  const billingAddr = (order.billingAddress as Record<string, string>) || addr;
  const isDifferentBilling =
    order.billingAddress && JSON.stringify(order.billingAddress) !== JSON.stringify(addr);

  // Kâr ve Maliyet Analizi Hesaplamaları
  const totalRevenue = Number(order.totalAmount);
  const totalProductCost = items.reduce((sum, item) => {
    const cost = Number(item.unitCost) || 0;
    return sum + cost * item.quantity;
  }, 0);
  const shippingAmount = Number(order.shippingAmount) || 0;
  const netProfit = totalRevenue - totalProductCost;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return (
    <main className="admin-main catalog-main">
      <header className="catalog-top flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="admin-kicker">
            <Link href="/admin/siparisler" className="underline">
              ← Siparişler
            </Link>{" "}
            / {order.orderNumber}
          </p>
          <h1>Sipariş Detayı</h1>
          <p className="admin-lead">
            {new Date(order.createdAt).toLocaleString("tr-TR", { dateStyle: "full", timeStyle: "medium" })}
          </p>
        </div>
        <div>
          <Link
            href={`/siparis/${order.orderNumber}/fatura`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-black transition-colors"
          >
            <Printer size={15} /> Fatura & İrsaliye Belgesi ↗
          </Link>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Left Side: Order Items, Profit Report & Delivery/Billing Info */}
        <div className="space-y-6">
          {/* Sipariş Kalemleri (4. Görsel Çözümü: Her ürünün başında minik ürün fotoğrafı) */}
          <section className="admin-panel p-6">
            <h2 className="text-base font-bold text-stone-900 mb-4">Sipariş Kalemleri ({items.length})</h2>
            <div className="report-table">
              <div className="report-table-head grid grid-cols-[2fr_1fr_1fr_1fr] gap-4">
                <span>Ürün / Varyant</span>
                <span>Birim Fiyat</span>
                <span>Adet</span>
                <span>Toplam</span>
              </div>
              {items.map((item) => (
                <div key={item.id} className="report-table-row grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-100 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-stone-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold block text-stone-900 truncate">{item.productName}</span>
                      <small className="text-stone-500">
                        {item.variantName} {item.sku ? `(${item.sku})` : ""}
                      </small>
                    </div>
                  </div>
                  <span>₺{Number(item.unitPrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                  <span>{item.quantity}</span>
                  <strong className="text-stone-900">
                    ₺{Number(item.lineTotal).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 border-t border-stone-200 pt-4 space-y-2 text-xs text-stone-600 max-w-xs ml-auto">
              <div className="flex justify-between">
                <span>Ara Toplam:</span>
                <span>₺{Number(order.subtotal).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>İndirim Tutarı ({order.couponCode ?? "Kupon"}):</span>
                  <span>-₺{Number(order.discountAmount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Kargo Bedeli:</span>
                <span>₺{Number(order.shippingAmount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-2 font-black text-stone-900 text-sm">
                <span>Genel Toplam:</span>
                <span>₺{Number(order.totalAmount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </section>

          {/* Kâr ve Maliyet Raporu Kartı */}
          <section className="admin-panel p-6">
            <h2 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-[#849649]" />
              <span>Kâr ve Maliyet Raporu</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl bg-stone-50 p-4 border border-stone-200">
                <span className="text-[11px] font-bold uppercase text-stone-500 block">Sipariş Tutarı</span>
                <strong className="text-base font-black text-stone-900 mt-1 block">
                  ₺{totalRevenue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </strong>
                <small className="text-[10px] text-stone-400">KDV Dahil Tahsilat</small>
              </div>

              <div className="rounded-xl bg-stone-50 p-4 border border-stone-200">
                <span className="text-[11px] font-bold uppercase text-stone-500 block">Ürün Maliyeti (COGS)</span>
                <strong className="text-base font-black text-red-700 mt-1 block">
                  -₺{totalProductCost.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </strong>
                <small className="text-[10px] text-stone-400">Hammadde, Şişe & Kutu</small>
              </div>

              <div className="rounded-xl bg-stone-50 p-4 border border-stone-200">
                <span className="text-[11px] font-bold uppercase text-stone-500 block">Tahmini Net Kâr</span>
                <strong
                  className={`text-base font-black mt-1 block ${
                    netProfit >= 0 ? "text-emerald-700" : "text-red-600"
                  }`}
                >
                  ₺{netProfit.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </strong>
                <small className="text-[10px] text-stone-400">Tahsilat - Üretim Maliyeti</small>
              </div>

              <div className="rounded-xl bg-stone-50 p-4 border border-stone-200">
                <span className="text-[11px] font-bold uppercase text-stone-500 block">Kâr Marjı</span>
                <strong
                  className={`text-base font-black mt-1 block ${
                    profitMargin >= 30 ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  %{profitMargin.toFixed(1)}
                </strong>
                <small className="text-[10px] text-stone-400">Net Kâr / Satış Oranı</small>
              </div>
            </div>
          </section>

          {/* Adres Bilgileri: Teslimat Adresi & Fatura Adresi */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Teslimat Bilgileri */}
            <section className="admin-panel p-6">
              <h2 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
                <Package size={17} className="text-stone-700" />
                <span>Teslimat & İletişim Bilgileri</span>
              </h2>
              <div className="text-xs text-stone-700 space-y-2">
                <div>
                  <p className="font-bold text-stone-900 text-sm mb-1">{addr?.recipientName}</p>
                  <p><strong>Telefon:</strong> {addr?.phone}</p>
                  <p><strong>E-posta:</strong> {addr?.email}</p>
                </div>
                <div className="pt-2 border-t border-stone-100">
                  <p className="font-bold text-stone-900 mb-1">Teslimat Adresi:</p>
                  <p>{addr?.addressLine}</p>
                  <p>{addr?.district} / {addr?.city} {addr?.postalCode}</p>
                </div>
              </div>
              {order.customerNote && (
                <div className="mt-4 rounded-lg bg-stone-50 p-3 text-xs border border-stone-200">
                  <strong>Müşteri Notu:</strong> {order.customerNote}
                </div>
              )}
            </section>

            {/* Fatura Bilgileri (Kullanıcının talep ettiği Fatura Adresi alanı) */}
            <section className="admin-panel p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Receipt size={17} className="text-[#849649]" />
                  <span>Fatura Bilgileri</span>
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isDifferentBilling
                      ? "bg-amber-100 text-amber-800"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {isDifferentBilling ? "Özel Fatura Adresi" : "Teslimatla Aynı"}
                </span>
              </div>
              <div className="text-xs text-stone-700 space-y-2">
                <div>
                  <p className="font-bold text-stone-900 text-sm mb-1">
                    {billingAddr?.companyName || billingAddr?.recipientName || addr?.recipientName}
                  </p>
                  {billingAddr?.companyName && (
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded mb-1">
                      <Building size={12} /> Kurumsal Fatura
                    </div>
                  )}
                  {billingAddr?.taxNumber ? (
                    <p className="font-mono text-stone-800">
                      <strong>VKN:</strong> {billingAddr.taxNumber}{" "}
                      {billingAddr.taxOffice ? `(${billingAddr.taxOffice})` : ""}
                    </p>
                  ) : billingAddr?.idNumber ? (
                    <p className="font-mono text-stone-800">
                      <strong>T.C. Kimlik No:</strong> {billingAddr.idNumber}
                    </p>
                  ) : (
                    <p className="text-stone-500">T.C. / VKN: Nihai Tüketici</p>
                  )}
                </div>
                <div className="pt-2 border-t border-stone-100">
                  <p className="font-bold text-stone-900 mb-1">Fatura Adresi:</p>
                  <p>{billingAddr?.addressLine || addr?.addressLine}</p>
                  <p>
                    {billingAddr?.district || addr?.district} / {billingAddr?.city || addr?.city}{" "}
                    {billingAddr?.postalCode || addr?.postalCode}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right Side: Operational Actions & 5. Fotoğraftaki Dikey Durum Akışı */}
        <aside className="space-y-6">
          {/* 5. Görseldeki Dikey Sipariş Durumu Zaman Çizelgesi */}
          <div className="space-y-3">
            <h3 className="text-xs font-black tracking-wider uppercase text-stone-500">
              Sipariş Durumu Akışı
            </h3>
            <OrderTimeline
              status={order.status}
              paymentStatus={order.paymentStatus}
              createdAt={order.createdAt}
              updatedAt={order.updatedAt}
              cargoCompany={order.cargoCompany}
              cargoTrackingNumber={order.cargoTrackingNumber}
            />
          </div>

          {/* Status Update Form */}
          <div className="admin-panel p-6">
            <h2 className="text-base font-bold text-stone-900 mb-4">Sipariş Durumunu Güncelle</h2>
            <form action={updateOrderStatusAction} className="space-y-3">
              <input type="hidden" name="orderId" value={order.id} />
              <label className="block text-xs font-bold text-stone-700">
                Sipariş Aşaması
                <select
                  name="status"
                  defaultValue={order.status}
                  className="mt-1 w-full rounded border p-2 text-xs bg-white outline-none focus:border-stone-900"
                >
                  {Object.entries(statuses).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs font-bold text-stone-700">
                Tahsilat / Ödeme Durumu
                <select
                  name="paymentStatus"
                  defaultValue={order.paymentStatus}
                  className="mt-1 w-full rounded border p-2 text-xs bg-white outline-none focus:border-stone-900"
                >
                  <option value="pending">Ödeme Bekliyor</option>
                  <option value="paid">Tahsil Edildi (Ödendi)</option>
                  <option value="failed">Başarısız / İptal</option>
                  <option value="refunded">İade Edildi</option>
                </select>
              </label>

              <button
                type="submit"
                className="w-full rounded bg-[#101e2c] py-2.5 text-xs font-bold text-white hover:bg-black transition-colors cursor-pointer"
              >
                Durumu Güncelle
              </button>
            </form>
          </div>

          {/* Cargo Tracking Form */}
          <div className="admin-panel p-6">
            <h2 className="text-base font-bold text-stone-900 mb-4">Kargo & Takip Bilgisi</h2>
            <form action={updateCargoAction} className="space-y-3">
              <input type="hidden" name="orderId" value={order.id} />
              <label className="block text-xs font-bold text-stone-700">
                Kargo Şirketi
                <input
                  name="cargoCompany"
                  defaultValue={order.cargoCompany ?? "Yurtiçi Kargo"}
                  className="mt-1 w-full rounded border p-2 text-xs outline-none focus:border-stone-900"
                />
              </label>

              <label className="block text-xs font-bold text-stone-700">
                Kargo Takip Kodu
                <input
                  name="cargoTrackingNumber"
                  defaultValue={order.cargoTrackingNumber ?? ""}
                  placeholder="Örn: 123456789012"
                  className="mt-1 w-full rounded border p-2 text-xs font-mono outline-none focus:border-stone-900"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded bg-[#849649] py-2.5 text-xs font-bold text-white hover:bg-[#6b7b39] transition-colors cursor-pointer"
              >
                Kargo Kodunu Kaydet
              </button>
            </form>
          </div>
        </aside>
      </div>
    </main>
  );
}
