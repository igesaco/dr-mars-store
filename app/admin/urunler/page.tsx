import Link from "next/link";
import { and, asc, count, desc, eq, ilike, lte, or } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, productImages, products, productVariants } from "@/db/schema";
import ProductsTable, { type CatalogRow } from "./products-table";

export default async function ProductManagement({ searchParams }: {
  searchParams: Promise<{ q?: string; status?: string; category?: string; created?: string; updated?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim(), status = params.status ?? "all", category = params.category ?? "all";
  let rows: CatalogRow[] = [], categoryRows: { id: string; name: string }[] = [];
  let totals = { all: 0, active: 0, low: 0, draft: 0 };
  let error = "";
  try {
    const db = getDb();
    const conditions = [];
    if (q) conditions.push(or(ilike(products.name, `%${q}%`), ilike(productVariants.sku, `%${q}%`)));
    if (status === "active") conditions.push(eq(products.isActive, true));
    if (status === "draft") conditions.push(eq(products.isActive, false));
    if (status === "low") conditions.push(lte(productVariants.stockQuantity, productVariants.lowStockThreshold));
    if (category !== "all") conditions.push(eq(products.categoryId, category));
    const [results, categoryList, allCount, activeCount, lowCount, draftCount] = await Promise.all([
      db.select({
        id: products.id, name: products.name, slug: products.slug, category: categories.name,
        sku: productVariants.sku, volumeMl: productVariants.volumeMl, price: productVariants.price,
        unitCost: productVariants.unitCost, stock: productVariants.stockQuantity,
        lowStockThreshold: productVariants.lowStockThreshold, active: products.isActive, imageUrl: productImages.url,
      }).from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(productVariants, eq(products.id, productVariants.productId))
        .leftJoin(productImages, and(eq(products.id, productImages.productId), eq(productImages.sortOrder, 0)))
        .where(conditions.length ? and(...conditions) : undefined).orderBy(desc(products.updatedAt)).limit(250),
      db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.sortOrder), asc(categories.name)),
      db.select({ value: count() }).from(products),
      db.select({ value: count() }).from(products).where(eq(products.isActive, true)),
      db.select({ value: count() }).from(productVariants).where(lte(productVariants.stockQuantity, productVariants.lowStockThreshold)),
      db.select({ value: count() }).from(products).where(eq(products.isActive, false)),
    ]);
    rows = results;
    categoryRows = categoryList;
    totals = { all: allCount[0].value, active: activeCount[0].value, low: lowCount[0].value, draft: draftCount[0].value };
  } catch {
    error = "Ürün kataloğu okunamadı. PostgreSQL bağlantısını ve migration işlemini kontrol et.";
  }

  return <main className="admin-main catalog-main">
    <header className="catalog-top">
      <div><p className="admin-kicker">E-TİCARET / KATALOG</p><h1>Ürünler</h1><p className="admin-lead">Kataloğu ara, filtrele ve ürünleri toplu olarak yönet.</p></div>
      <div className="catalog-actions"><Link className="catalog-secondary" href="/admin/kategoriler">Kategoriler</Link><Link className="catalog-primary" href="/admin/urunler/yeni">+ Yeni ürün ekle</Link></div>
    </header>
    {(params.created || params.updated) && <div className="admin-notice"><span />{params.created ? "Ürün başarıyla oluşturuldu." : "Ürün değişiklikleri kaydedildi."}</div>}
    {error && <div className="admin-notice report-error" role="alert">{error}</div>}
    <section className="catalog-metrics">
      <article><span>Tüm ürünler</span><strong>{totals.all}</strong></article>
      <article><span>Yayındaki</span><strong>{totals.active}</strong></article>
      <article><span>Düşük stok</span><strong>{totals.low}</strong></article>
      <article><span>Taslak / arşiv</span><strong>{totals.draft}</strong></article>
    </section>
    <section className="admin-panel catalog-panel">
      <form method="get" className="catalog-filters">
        <label className="catalog-search"><span>Ürün veya SKU ara</span><input name="q" defaultValue={q} placeholder="Örn. Citrus veya DRM-CT-100" /></label>
        <label><span>Durum</span><select name="status" defaultValue={status}><option value="all">Tüm durumlar</option><option value="active">Yayında</option><option value="draft">Taslak / arşiv</option><option value="low">Düşük stok</option></select></label>
        <label><span>Kategori</span><select name="category" defaultValue={category}><option value="all">Tüm kategoriler</option>{categoryRows.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <button type="submit">Filtrele</button>
        {(q || status !== "all" || category !== "all") && <Link href="/admin/urunler">Temizle</Link>}
      </form>
      <ProductsTable rows={rows} />
    </section>
  </main>;
}
