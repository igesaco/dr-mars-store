import Link from "next/link";
import { count, eq, lte, and, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, productVariants, products } from "@/db/schema";

export default async function AdminHome() {
  let metrics: { products: number; pending: number; lowStock: number; revenue: number } | null = null;
  let error = "";
  try {
    const db = getDb();
    const [productCount, orderCount, stockCount, sales] = await Promise.all([
      db.select({ value: count() }).from(products),
      db.select({ value: count() }).from(orders).where(eq(orders.status, "pending")),
      db.select({ value: count() }).from(productVariants).where(lte(productVariants.stockQuantity, 5)),
      db.select({ value: sql<string>`coalesce(sum(${orders.totalAmount}), 0)` }).from(orders).where(eq(orders.paymentStatus, "paid")),
    ]);
    metrics = { products: productCount[0].value, pending: orderCount[0].value, lowStock: stockCount[0].value, revenue: Number(sales[0].value) };
  } catch { error = "Veritabanı bağlantısı henüz hazır değil. .env.local ayarını ve migration işlemini kontrol et."; }
  return <main className="admin-main"><p className="admin-kicker">MAĞAZA GENEL BAKIŞ</p><h1>Dr Mars yönetim merkezi</h1>{error && <div className="admin-notice" role="status">{error}</div>}<section className="admin-stat-grid"><article><span>Toplam ciro</span><strong>{metrics ? metrics.revenue.toLocaleString("tr-TR", { style: "currency", currency: "TRY" }) : "—"}</strong><small>Ödenen siparişler</small></article><article><span>Bekleyen sipariş</span><strong>{metrics?.pending ?? "—"}</strong><small>İşlem bekliyor</small></article><article><span>Düşük stok</span><strong>{metrics?.lowStock ?? "—"}</strong><small>5 adet ve altı</small></article><article><span>Ürün</span><strong>{metrics?.products ?? "—"}</strong><small>Katalogdaki ürünler</small></article></section><div className="admin-section-grid"><Link className="admin-section-card" href="/admin/urunler"><span>01 · E-TİCARET</span><h2>Ürün & stok yönetimi</h2><p>Ürünleri, fiyatları, varyantları ve stok seviyelerini düzenle.</p><b>Ürünlere git →</b></Link><Link className="admin-section-card" href="/admin/e-ticaret"><span>01 · E-TİCARET</span><h2>Sipariş & ödeme</h2><p>Satış operasyonuna ve ödeme ayarlarına eriş.</p><b>Alana git →</b></Link><Link className="admin-section-card" href="/admin/seo"><span>02 · BÜYÜME</span><h2>SEO & analiz</h2><p>Arama görünürlüğü ve reklam ölçüm araçlarını yönet.</p><b>Alana git →</b></Link><Link className="admin-section-card" href="/admin/tasarim"><span>03 · MARKA</span><h2>Web tasarımı</h2><p>Mağaza kimliği, katalog ve içerik ayarları.</p><b>Alana git →</b></Link></div></main>;
}
