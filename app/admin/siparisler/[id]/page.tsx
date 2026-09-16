import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { Printer } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { updateCargoAction, updateOrderStatusAction } from "../actions";

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

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  const addr = order.shippingAddress as Record<string, string>;

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

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Left Side: Order Items & Delivery Info */}
        <div className="space-y-6">
          {/* Items */}
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
                  <div>
                    <span className="font-bold block text-stone-900">{item.productName}</span>
                    <small className="text-stone-500">
                      {item.variantName} {item.sku ? `(${item.sku})` : ""}
                    </small>
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

          {/* Delivery & Customer info */}
          <section className="admin-panel p-6">
            <h2 className="text-base font-bold text-stone-900 mb-3">Teslimat & İletişim Bilgileri</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-xs text-stone-700">
              <div>
                <p className="font-bold text-stone-900 text-sm mb-1">{addr?.recipientName}</p>
                <p><strong>Telefon:</strong> {addr?.phone}</p>
                <p><strong>E-posta:</strong> {addr?.email}</p>
              </div>
              <div>
                <p className="font-bold text-stone-900 mb-1">Adres:</p>
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
        </div>

        {/* Right Side: Operational Actions */}
        <aside className="space-y-6">
          {/* Status Update Form */}
          <div className="admin-panel p-6">
            <h2 className="text-base font-bold text-stone-900 mb-4">Sipariş Durumu</h2>
            <form action={updateOrderStatusAction} className="space-y-3">
              <input type="hidden" name="orderId" value={order.id} />
              <label className="block text-xs font-bold text-stone-700">
                Sipariş Aşaması
                <select name="status" defaultValue={order.status} className="mt-1 w-full rounded border p-2 text-xs bg-white">
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
                  className="mt-1 w-full rounded border p-2 text-xs bg-white"
                >
                  <option value="pending">Ödeme Bekliyor</option>
                  <option value="paid">Tahsil Edildi (Ödendi)</option>
                  <option value="failed">Başarısız / İptal</option>
                  <option value="refunded">İade Edildi</option>
                </select>
              </label>

              <button
                type="submit"
                className="w-full rounded bg-[#101e2c] py-2.5 text-xs font-bold text-white hover:bg-black transition-colors"
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
                  className="mt-1 w-full rounded border p-2 text-xs"
                />
              </label>

              <label className="block text-xs font-bold text-stone-700">
                Kargo Takip Kodu
                <input
                  name="cargoTrackingNumber"
                  defaultValue={order.cargoTrackingNumber ?? ""}
                  placeholder="Örn: 123456789012"
                  className="mt-1 w-full rounded border p-2 text-xs font-mono"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded bg-[#849649] py-2.5 text-xs font-bold text-white hover:bg-[#6b7b39] transition-colors"
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
