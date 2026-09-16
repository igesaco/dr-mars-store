import Link from "next/link";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const statuses: Record<string, { label: string; badgeClass: string }> = {
  pending: { label: "Bekliyor", badgeClass: "bg-amber-100 text-amber-800" },
  paid: { label: "Ödendi", badgeClass: "bg-blue-100 text-blue-800" },
  preparing: { label: "Hazırlanıyor", badgeClass: "bg-indigo-100 text-indigo-800" },
  shipped: { label: "Kargoda", badgeClass: "bg-purple-100 text-purple-800" },
  delivered: { label: "Teslim Edildi", badgeClass: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "İptal Edildi", badgeClass: "bg-red-100 text-red-800" },
  refunded: { label: "İade", badgeClass: "bg-stone-200 text-stone-700" },
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();
  const { q = "", status = "all" } = await searchParams;
  const cleanQ = q.trim();

  const db = getDb();
  const conditions = [];

  if (status !== "all") {
    conditions.push(eq(orders.status, status as any));
  }
  if (cleanQ) {
    conditions.push(or(ilike(orders.orderNumber, `%${cleanQ}%`)));
  }

  const orderRows = await db
    .select()
    .from(orders)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(100);

  const totalRevenue = orderRows
    .filter((o) => o.paymentStatus === "paid" && o.status !== "cancelled" && o.status !== "refunded")
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  return (
    <main className="admin-main catalog-main">
      <header className="catalog-top">
        <div>
          <p className="admin-kicker">E-TİCARET / OPERASYON</p>
          <h1>Siparişler</h1>
          <p className="admin-lead">Gelen siparişleri görüntüle, kargo bilgilerini gir ve durumları güncelle.</p>
        </div>
      </header>

      {/* Metrics */}
      <section className="catalog-metrics">
        <article>
          <span>Toplam Sipariş</span>
          <strong>{orderRows.length}</strong>
        </article>
        <article>
          <span>Bekleyen / Hazırlanan</span>
          <strong>
            {orderRows.filter((o) => o.status === "pending" || o.status === "paid" || o.status === "preparing").length}
          </strong>
        </article>
        <article>
          <span>Kargodakiler</span>
          <strong>{orderRows.filter((o) => o.status === "shipped").length}</strong>
        </article>
        <article>
          <span>Seçili Tutar</span>
          <strong>₺{totalRevenue.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}</strong>
        </article>
      </section>

      {/* Filter Panel */}
      <section className="admin-panel catalog-panel">
        <form method="get" className="catalog-filters">
          <label className="catalog-search">
            <span>Sipariş No Ara</span>
            <input name="q" defaultValue={cleanQ} placeholder="Örn: DRM-2026-..." />
          </label>
          <label>
            <span>Durum</span>
            <select name="status" defaultValue={status}>
              <option value="all">Tüm Durumlar</option>
              <option value="pending">Bekliyor</option>
              <option value="paid">Ödendi</option>
              <option value="preparing">Hazırlanıyor</option>
              <option value="shipped">Kargoda</option>
              <option value="delivered">Teslim Edildi</option>
              <option value="cancelled">İptal</option>
            </select>
          </label>
          <button type="submit">Filtrele</button>
          {(cleanQ || status !== "all") && <Link href="/admin/siparisler">Temizle</Link>}
        </form>

        {/* Orders Table */}
        {orderRows.length === 0 ? (
          <p className="catalog-empty">Kayıtlı sipariş bulunamadı.</p>
        ) : (
          <div className="report-table">
            <div className="report-table-head grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_auto] gap-4">
              <span>Sipariş No / Tarih</span>
              <span>Alıcı & İletişim</span>
              <span>Durum</span>
              <span>Ödeme</span>
              <span>Tutar</span>
              <span>İşlem</span>
            </div>
            {orderRows.map((o) => {
              const addr = o.shippingAddress as Record<string, string>;
              const st = statuses[o.status] ?? { label: o.status, badgeClass: "bg-stone-100" };
              return (
                <div
                  key={o.id}
                  className="report-table-row grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_auto] gap-4 items-center"
                >
                  <div>
                    <strong className="block font-mono text-sm text-stone-900">
                      {o.orderNumber}
                    </strong>
                    <small className="text-stone-400">
                      {new Date(o.createdAt).toLocaleString("tr-TR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </small>
                  </div>

                  <div>
                    <span className="font-bold block text-stone-800">{addr?.recipientName ?? "Misafir"}</span>
                    <small className="text-stone-500">{addr?.phone ?? addr?.email}</small>
                  </div>

                  <div>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${st.badgeClass}`}>
                      {st.label}
                    </span>
                  </div>

                  <div>
                    <span
                      className={`inline-block text-xs font-bold ${
                        o.paymentStatus === "paid" ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {o.paymentStatus === "paid" ? "Tahsil Edildi" : "Bekliyor"}
                    </span>
                  </div>

                  <div>
                    <strong className="text-sm font-black text-stone-900">
                      ₺{Number(o.totalAmount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </strong>
                  </div>

                  <div>
                    <Link
                      href={`/admin/siparisler/${o.id}`}
                      className="rounded bg-stone-100 px-3 py-1 text-xs font-bold text-stone-800 hover:bg-[#101e2c] hover:text-white transition-colors"
                    >
                      İncele →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
