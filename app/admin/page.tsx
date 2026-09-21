import Link from "next/link";
import { and, count, desc, eq, gte, notInArray } from "drizzle-orm";
import { getDb } from "@/db";
import { carts, orderItems, orders, products, productVariants, users } from "@/db/schema";
import { ReportCharts, type DayPoint } from "./report-charts";
import { AlertTriangle, ArrowRight, Box, Package, Plus, Tag, Truck } from "lucide-react";
import "./report.css";

const money = (amount: number | null) =>
  amount === null
    ? "—"
    : new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        maximumFractionDigits: 2,
      }).format(amount);

const number = (value: number) => new Intl.NumberFormat("tr-TR").format(value);

const dayKey = (date: Date) =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const isPaid = (order: { paymentStatus: string; status: string }) =>
  order.paymentStatus === "paid" && order.status !== "cancelled" && order.status !== "refunded";

const statuses: Record<string, string> = {
  pending: "Bekliyor",
  paid: "Ödendi",
  preparing: "Hazırlanıyor",
  shipped: "Kargoda",
  delivered: "Teslim edildi",
  cancelled: "İptal",
  refunded: "İade",
};

type OrderRow = {
  id: string;
  orderNumber: string;
  createdAt: Date;
  userId: string | null;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  subtotal: string;
  shippingAmount: string;
  discountAmount: string;
};

type ItemRow = {
  orderId: string;
  name: string;
  sku: string | null;
  quantity: number;
  lineTotal: string;
  unitCost: string | null;
};

type VariantRow = {
  name: string;
  sku: string;
  stock: number;
  threshold: number;
  price: string;
  unitCost: string | null;
};

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const requested = (await searchParams).days;
  const days = requested === "7" ? 7 : requested === "90" ? 90 : 30;
  const now = new Date();
  const start = new Date(now.getTime() - days * 86_400_000);
  const shownDays = new Set(
    Array.from({ length: days }, (_, offset) =>
      dayKey(new Date(now.getTime() - offset * 86_400_000))
    )
  );

  let error = "";
  let orderRows: OrderRow[] = [];
  let itemRows: ItemRow[] = [];
  let variantRows: VariantRow[] = [];
  let customerCount = 0;
  let cartCount = 0;
  let productCount = 0;

  try {
    const db = getDb();
    const [recentOrders, soldItems, stock, customers, cartsResult, productsResult] =
      await Promise.all([
        db
          .select({
            id: orders.id,
            orderNumber: orders.orderNumber,
            createdAt: orders.createdAt,
            userId: orders.userId,
            status: orders.status,
            paymentStatus: orders.paymentStatus,
            totalAmount: orders.totalAmount,
            subtotal: orders.subtotal,
            shippingAmount: orders.shippingAmount,
            discountAmount: orders.discountAmount,
          })
          .from(orders)
          .where(gte(orders.createdAt, start))
          .orderBy(desc(orders.createdAt)),
        db
          .select({
            orderId: orderItems.orderId,
            name: orderItems.productName,
            sku: orderItems.sku,
            quantity: orderItems.quantity,
            lineTotal: orderItems.lineTotal,
            unitCost: orderItems.unitCost,
          })
          .from(orderItems)
          .innerJoin(orders, eq(orderItems.orderId, orders.id))
          .where(
            and(
              gte(orders.createdAt, start),
              eq(orders.paymentStatus, "paid"),
              notInArray(orders.status, ["cancelled", "refunded"])
            )
          ),
        db
          .select({
            name: products.name,
            sku: productVariants.sku,
            stock: productVariants.stockQuantity,
            threshold: productVariants.lowStockThreshold,
            price: productVariants.price,
            unitCost: productVariants.unitCost,
          })
          .from(productVariants)
          .innerJoin(products, eq(productVariants.productId, products.id))
          .where(and(eq(products.isActive, true), eq(productVariants.isActive, true))),
        db.select({ value: count() }).from(users).where(eq(users.role, "customer")),
        db.select({ value: count() }).from(carts),
        db.select({ value: count() }).from(products).where(eq(products.isActive, true)),
      ]);

    orderRows = recentOrders.filter((order) => shownDays.has(dayKey(order.createdAt)));
    const shownOrderIds = new Set(orderRows.map((order) => order.id));
    itemRows = soldItems.filter((item) => shownOrderIds.has(item.orderId));
    variantRows = stock;
    customerCount = customers[0].value;
    cartCount = cartsResult[0].value;
    productCount = productsResult[0].value;
  } catch {
    error =
      "Rapor verileri okunamadı. PostgreSQL bağlantısını ve corepack pnpm db:migrate işlemini kontrol et.";
  }

  const paidOrders = orderRows.filter(isPaid);
  const refundedOrders = orderRows.filter(
    (order) => order.paymentStatus === "refunded" || order.status === "refunded"
  );
  const revenue = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const discounts = paidOrders.reduce((sum, order) => sum + Number(order.discountAmount), 0);
  const shipping = paidOrders.reduce((sum, order) => sum + Number(order.shippingAmount), 0);
  const refunds = refundedOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const units = itemRows.reduce((sum, item) => sum + item.quantity, 0);
  const merchandiseRevenue =
    itemRows.reduce((sum, item) => sum + Number(item.lineTotal), 0) - discounts;
  const completeCosts =
    paidOrders.length > 0 &&
    itemRows.length > 0 &&
    itemRows.every((item) => item.unitCost !== null) &&
    paidOrders.every((order) => itemRows.some((item) => item.orderId === order.id));
  const cogs = completeCosts
    ? itemRows.reduce((sum, item) => sum + Number(item.unitCost) * item.quantity, 0)
    : null;
  const grossProfit = cogs === null ? null : merchandiseRevenue - cogs;
  const lowStock = variantRows
    .filter((item) => item.stock <= item.threshold)
    .sort((a, b) => a.stock - b.stock);
  const costCoverage = variantRows.length
    ? variantRows.filter((item) => item.unitCost !== null).length
    : 0;
  const inventoryCost =
    variantRows.length && costCoverage === variantRows.length
      ? variantRows.reduce((sum, item) => sum + Number(item.unitCost) * item.stock, 0)
      : null;
  const inventoryRetail = variantRows.reduce(
    (sum, item) => sum + Number(item.price) * item.stock,
    0
  );
  const statusCounts = Object.entries(statuses).map(([key, label]) => ({
    key,
    label,
    value: orderRows.filter((order) => order.status === key).length,
  }));

  const pendingShipmentCount = orderRows.filter(
    (o) => o.status === "paid" || o.status === "preparing"
  ).length;

  const topProducts = [
    ...itemRows
      .reduce((map, item) => {
        const key = item.sku ?? item.name;
        const current = map.get(key) ?? { name: item.name, sku: item.sku, units: 0, amount: 0 };
        current.units += item.quantity;
        current.amount += Number(item.lineTotal);
        map.set(key, current);
        return map;
      }, new Map<string, { name: string; sku: string | null; units: number; amount: number }>())
      .values(),
  ]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);

  const points = new Map<string, DayPoint>();
  for (let offset = days - 1; offset >= 0; offset--) {
    const day = dayKey(new Date(now.getTime() - offset * 86_400_000));
    points.set(day, {
      day,
      label: day.slice(8, 10) + "." + day.slice(5, 7),
      revenue: 0,
      orders: 0,
      paid: 0,
    });
  }
  for (const order of orderRows) {
    const point = points.get(dayKey(order.createdAt));
    if (!point) continue;
    point.orders++;
    if (isPaid(order)) {
      point.paid++;
      point.revenue += Number(order.totalAmount);
    }
  }

  return (
    <main className="admin-main report-main">
      {/* Üst Başlık & Dönem Seçici */}
      <div className="report-head">
        <div>
          <p className="admin-kicker">DR. MARS · OPERASYONEL YÖNETİM MERKEZİ</p>
          <h1>Genel Bakış & Kontrol Paneli</h1>
          <p>Satış performansı, sipariş akışı, stok sağlığı ve anlık operasyon verileri.</p>
        </div>
        <div className="report-period" aria-label="Rapor dönemi">
          {[7, 30, 90].map((value) => (
            <a
              key={value}
              href={`/admin?days=${value}`}
              aria-current={days === value ? "page" : undefined}
              className={days === value ? "selected" : ""}
            >
              Son {value} gün
            </a>
          ))}
        </div>
      </div>

      {/* Hızlı İşlem Kısayolları */}
      <div className="flex flex-wrap items-center gap-3 py-2">
        <Link
          href="/admin/urunler/yeni"
          className="flex items-center gap-1.5 rounded-xl bg-[#0c1117] px-4 py-2.5 text-xs font-bold text-[#dfcca8] hover:bg-stone-800 transition-colors shadow-xs"
        >
          <Plus size={14} /> Yeni Ürün Ekle
        </Link>
        <Link
          href="/admin/siparisler"
          className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 hover:border-stone-900 transition-colors shadow-xs"
        >
          <Package size={14} /> Siparişleri Yönet
        </Link>
        <Link
          href="/admin/kuponlar"
          className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 hover:border-stone-900 transition-colors shadow-xs"
        >
          <Tag size={14} /> Kupon Tanımla
        </Link>
        <Link
          href="/admin/urunler?status=low"
          className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 hover:border-stone-900 transition-colors shadow-xs"
        >
          <Box size={14} /> Düşük Stok Takibi ({lowStock.length})
        </Link>
      </div>

      {/* Operasyonel Canlı Alarmlar */}
      {pendingShipmentCount > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-amber-700 shrink-0" />
            <span>
              Kargoya hazırlanmayı bekleyen <strong>{pendingShipmentCount} adet sipariş</strong>{" "}
              bulunuyor.
            </span>
          </div>
          <Link
            href="/admin/siparisler?status=preparing"
            className="font-bold underline text-amber-950 hover:text-black flex items-center gap-1"
          >
            Siparişleri Gör <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {lowStock.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-900">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-600 shrink-0" />
            <span>
              Kritik stok seviyesinin altına inen <strong>{lowStock.length} ürün varyantı</strong>{" "}
              var!
            </span>
          </div>
          <Link
            href="/admin/urunler?status=low"
            className="font-bold underline text-rose-950 hover:text-black flex items-center gap-1"
          >
            Stokları İncele <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {error && (
        <div className="admin-notice report-error" role="alert">
          {error}
        </div>
      )}

      {!error && (
        <p className="report-subnote">
          Canlı PostgreSQL verisi · Son güncelleme{" "}
          {new Intl.DateTimeFormat("tr-TR", {
            timeZone: "Europe/Istanbul",
            dateStyle: "short",
            timeStyle: "short",
          }).format(now)}{" "}
          · Seçili dönemdeki siparişler
        </p>
      )}

      {/* KPI Kartları */}
      <section className="report-kpis" aria-label="Satış göstergeleri">
        {[
          ["Tahsil edilen ciro", error ? "—" : money(revenue), "Ödenmiş, iptal/iade edilmemiş siparişler"],
          ["Toplam sipariş", error ? "—" : number(orderRows.length), "Seçili dönemde oluşturulan"],
          ["Ödenen sipariş", error ? "—" : number(paidOrders.length), "Başarılı tahsilat"],
          [
            "Ortalama sepet",
            error || !paidOrders.length ? "—" : money(revenue / paidOrders.length),
            "Ödenmiş sipariş başına",
          ],
          ["Satılan adet", error ? "—" : number(units), "Ödenmiş sipariş kalemleri"],
          ["İndirim tutarı", error ? "—" : money(discounts), "Ödenmiş siparişlerde"],
          ["Kargo tahsilatı", error ? "—" : money(shipping), "Ciroya dahil; kargo gideri değil"],
          ["İade tutarı", error ? "—" : money(refunds), "İade durumundaki siparişler"],
        ].map(([label, value, detail]) => (
          <article className="report-kpi" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{detail}</small>
          </article>
        ))}
      </section>

      {/* Satış Grafiği */}
      <ReportCharts data={[...points.values()]} />

      {/* 2'li Rapor Kolonları */}
      <div className="report-columns">
        <section className="report-card">
          <div className="report-card-heading">
            <div>
              <span>FİNANS & KARLILIK</span>
              <h2>Maliyet ve Kârlılık Özeti</h2>
            </div>
          </div>
          <div className="report-line">
            <span>Ürün satışları − indirim</span>
            <strong>{error || !itemRows.length ? "—" : money(merchandiseRevenue)}</strong>
          </div>
          <div className="report-line">
            <span>Satılan ürün maliyeti (COGS)</span>
            <strong>{error ? "—" : money(cogs)}</strong>
          </div>
          <div className="report-line emphasized">
            <span>Ürün bazlı brüt kâr</span>
            <strong>{error ? "—" : money(grossProfit)}</strong>
          </div>
          <div className="report-line">
            <span>Brüt marj</span>
            <strong>
              {grossProfit === null || merchandiseRevenue <= 0
                ? "—"
                : `%${((100 * grossProfit) / merchandiseRevenue).toFixed(1)}`}
            </strong>
          </div>
          <p className="report-caption">
            {cogs === null
              ? "Geçmiş sipariş kalemlerinin birim maliyet kaydı eksik; kâr hesaplanamaz."
              : "Brüt kâr yalnız ürün satışları − indirim − kayıtlı maliyet hesabıdır."}
          </p>
        </section>

        <section className="report-card">
          <div className="report-card-heading">
            <div>
              <span>OPERASYON</span>
              <h2>Sipariş Durumları Dağılımı</h2>
            </div>
            <strong>{number(orderRows.length)}</strong>
          </div>
          {orderRows.length ? (
            <div className="report-status-list">
              {statusCounts.map((row) => (
                <div className="report-status" key={row.key}>
                  <span>{row.label}</span>
                  <div>
                    <i
                      style={{
                        width: `${(row.value / orderRows.length) * 100}%`,
                      }}
                    />
                  </div>
                  <strong>{row.value}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="report-empty short">Bu dönemde sipariş yok.</p>
          )}
        </section>
      </div>

      <div className="report-columns">
        <section className="report-card">
          <div className="report-card-heading">
            <div>
              <span>ÜRÜN PERFORMANSI</span>
              <h2>En Çok Gelir Getiren Ürünler</h2>
            </div>
          </div>
          {topProducts.length ? (
            <div className="report-table">
              <div className="report-table-head">
                <span>Ürün / SKU</span>
                <span>Adet</span>
                <span>Tutar</span>
              </div>
              {topProducts.map((item) => (
                <div className="report-table-row" key={item.sku ?? item.name}>
                  <span>
                    <b>{item.name}</b>
                    <small>{item.sku ?? "SKU yok"}</small>
                  </span>
                  <span>{number(item.units)}</span>
                  <strong>{money(item.amount)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="report-empty short">
              Satış gerçekleştiğinde ürün sıralaması burada oluşacak.
            </p>
          )}
        </section>

        <section className="report-card">
          <div className="report-card-heading">
            <div>
              <span>ENVANTER</span>
              <h2>Stok Sağlığı & Değeri</h2>
            </div>
            <strong>{error ? "—" : number(productCount)} ürün</strong>
          </div>
          <div className="report-mini-grid">
            <div>
              <span>Aktif varyant</span>
              <strong>{error ? "—" : number(variantRows.length)}</strong>
            </div>
            <div>
              <span>Düşük stok</span>
              <strong>{error ? "—" : number(lowStock.length)}</strong>
            </div>
            <div>
              <span>Stok satış değeri</span>
              <strong>{error ? "—" : money(inventoryRetail)}</strong>
            </div>
            <div>
              <span>Stok maliyeti</span>
              <strong>{error ? "—" : money(inventoryCost)}</strong>
            </div>
          </div>
          {lowStock.length > 0 && (
            <div className="report-alert-list">
              <b>Kritik Stok Uyarıları (İlk 5)</b>
              {lowStock.slice(0, 5).map((item) => (
                <div key={item.sku}>
                  <span>
                    {item.name} <small>{item.sku}</small>
                  </span>
                  <strong>{item.stock} adet</strong>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Son Siparişler Tablosu (Tıklanabilir İnceleme Linkleriyle) */}
      <section className="report-card report-last">
        <div className="report-card-heading">
          <div>
            <span>SON İŞLEMLER</span>
            <h2>Son Gelen Siparişler</h2>
          </div>
          <Link
            href="/admin/siparisler"
            className="text-xs font-bold text-stone-700 hover:text-black underline"
          >
            Tümünü Gör ({number(orderRows.length)}) →
          </Link>
        </div>
        {orderRows.length ? (
          <div className="report-table">
            <div className="report-table-head">
              <span>Sipariş</span>
              <span>Durum</span>
              <span>Tutar</span>
            </div>
            {orderRows.slice(0, 8).map((order) => (
              <Link
                href={`/admin/siparisler/${order.id}`}
                className="report-table-row hover:bg-stone-50 transition-colors block"
                key={order.id}
              >
                <span>
                  <b className="text-stone-900">#{order.orderNumber}</b>
                  <small>
                    {new Intl.DateTimeFormat("tr-TR", {
                      timeZone: "Europe/Istanbul",
                      dateStyle: "medium",
                    }).format(order.createdAt)}
                  </small>
                </span>
                <span>
                  {statuses[order.status] ?? order.status} ·{" "}
                  {order.paymentStatus === "paid" ? "Tahsil edildi" : "Tahsil edilmedi"}
                </span>
                <strong>{money(Number(order.totalAmount))}</strong>
              </Link>
            ))}
          </div>
        ) : (
          <p className="report-empty short">Bu dönemde sipariş oluşmadı.</p>
        )}
      </section>
    </main>
  );
}
