import Link from "next/link";
import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { getDb } from "@/db";
import { orderItems, orders, productImages, productVariants } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { OrdersListTable, OrderListItem, OrderItemPreview } from "@/components/admin/orders-list-table";

export const dynamic = "force-dynamic";

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

  // Siparişlerin kalemlerini, ürün görsellerini ve maliyetlerini çek
  const orderIds = orderRows.map((o) => o.id);
  const allItems =
    orderIds.length > 0
      ? await db
          .select({
            orderId: orderItems.orderId,
            id: orderItems.id,
            productName: orderItems.productName,
            variantName: orderItems.variantName,
            sku: orderItems.sku,
            unitCost: orderItems.unitCost,
            quantity: orderItems.quantity,
            imageUrl: productImages.url,
          })
          .from(orderItems)
          .leftJoin(productVariants, eq(orderItems.variantId, productVariants.id))
          .leftJoin(
            productImages,
            and(eq(productVariants.productId, productImages.productId), eq(productImages.sortOrder, 0))
          )
          .where(inArray(orderItems.orderId, orderIds))
      : [];

  const costByOrder = new Map<string, number>();
  const itemsByOrder = new Map<string, OrderItemPreview[]>();

  for (const item of allItems) {
    const cost = Number(item.unitCost) || 0;
    const current = costByOrder.get(item.orderId) || 0;
    costByOrder.set(item.orderId, current + cost * item.quantity);

    const list = itemsByOrder.get(item.orderId) || [];
    list.push({
      id: item.id,
      productName: item.productName,
      variantName: item.variantName,
      sku: item.sku,
      quantity: item.quantity,
      imageUrl: item.imageUrl,
    });
    itemsByOrder.set(item.orderId, list);
  }

  // Genel Kâr ve Maliyet Raporu İstatistikleri
  const validOrders = orderRows.filter(
    (o) => o.paymentStatus === "paid" && o.status !== "cancelled" && o.status !== "refunded"
  );
  const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const totalCOGS = validOrders.reduce((sum, o) => sum + (costByOrder.get(o.id) || 0), 0);
  const totalNetProfit = totalRevenue - totalCOGS;
  const overallMargin = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;

  // Format orders for table client
  const enrichedOrders: OrderListItem[] = orderRows.map((o) => {
    const addr = o.shippingAddress as Record<string, string>;
    const orderCost = costByOrder.get(o.id) || 0;
    const rev = Number(o.totalAmount);
    const profit = rev - orderCost;
    const margin = rev > 0 ? (profit / rev) * 100 : 0;

    return {
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      totalAmount: o.totalAmount,
      subtotal: o.subtotal,
      shippingAmount: o.shippingAmount,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
      cargoCompany: o.cargoCompany,
      cargoTrackingNumber: o.cargoTrackingNumber,
      recipientName: addr?.recipientName ?? "Misafir Müşteri",
      phone: addr?.phone ?? "",
      email: addr?.email ?? "",
      cost: orderCost,
      netProfit: profit,
      profitMargin: margin,
      items: itemsByOrder.get(o.id) || [],
    };
  });

  return (
    <main className="admin-main catalog-main">
      <header className="catalog-top">
        <div>
          <p className="admin-kicker">E-TİCARET / OPERASYON</p>
          <h1>Siparişler & Kâr Raporu</h1>
          <p className="admin-lead">
            Gelen siparişleri görüntüle, sipariş kalemlerinin küçük fotoğraflarını ve durum çizelgesini incele.
          </p>
        </div>
      </header>

      {/* Kâr ve Maliyet Raporu - Genel Metrik Kartları */}
      <section className="catalog-metrics grid grid-cols-2 sm:grid-cols-5 gap-4">
        <article>
          <span>Toplam Sipariş</span>
          <strong>{orderRows.length}</strong>
        </article>
        <article>
          <span>Toplam Ciro</span>
          <strong>₺{totalRevenue.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}</strong>
        </article>
        <article>
          <span>Toplam Ürün Maliyeti</span>
          <strong style={{ color: "#a83b24" }}>-₺{totalCOGS.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}</strong>
        </article>
        <article>
          <span>Net Tahmini Kâr</span>
          <strong style={{ color: totalNetProfit >= 0 ? "#2e7d32" : "#c62828" }}>
            ₺{totalNetProfit.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
          </strong>
        </article>
        <article>
          <span>Ortalama Kâr Marjı</span>
          <strong style={{ color: overallMargin >= 30 ? "#2e7d32" : "#f57c00" }}>
            %{overallMargin.toFixed(1)}
          </strong>
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
              <option value="refunded">İade</option>
            </select>
          </label>
          <button type="submit">Filtrele</button>
          {(cleanQ || status !== "all") && <Link href="/admin/siparisler">Temizle</Link>}
        </form>

        {/* Orders Table with Expandable 4-stage OrderTimeline and Product Thumbnails */}
        <OrdersListTable orders={enrichedOrders} />
      </section>
    </main>
  );
}
