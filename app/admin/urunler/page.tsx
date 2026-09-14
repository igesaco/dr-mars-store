import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, products, productVariants } from "@/db/schema";
import { archiveProduct, createProduct, updateProduct } from "./actions";

export default async function ProductManagement() {
  let rows: { id: string; variantId: string | null; name: string; slug: string; sku: string | null; volumeMl: number | null; price: string | null; stock: number | null; active: boolean }[] = [];
  let categoryRows: { name: string; slug: string }[] = [];
  let error = "";
  try {
    const db = getDb();
    [rows, categoryRows] = await Promise.all([
      db.select({ id: products.id, variantId: productVariants.id, name: products.name, slug: products.slug, sku: productVariants.sku, volumeMl: productVariants.volumeMl, price: productVariants.price, stock: productVariants.stockQuantity, active: products.isActive }).from(products).leftJoin(productVariants, eq(products.id, productVariants.productId)).orderBy(desc(products.createdAt)).limit(100),
      db.select({ name: categories.name, slug: categories.slug }).from(categories).orderBy(asc(categories.sortOrder)),
    ]);
  } catch { error = "Veritabanına erişilemedi. .env.local ve pnpm db:migrate adımlarını kontrol et."; }

  return <main className="admin-main"><p className="admin-kicker">E-TİCARET / KATALOG</p><h1>Ürün yönetimi</h1><p className="admin-lead">Ürünleri, fiyatları, hacimleri ve stokları kalıcı olarak yönet.</p>{error && <div className="admin-notice" role="alert">{error}</div>}
    <section className="admin-panel" style={{ marginBottom: 20 }}><div className="panel-title"><div><p className="admin-kicker">YENİ ÜRÜN</p><h2>Ürün ekle</h2></div></div><form className="product-admin-form" action={createProduct}><label>Ürün adı<input name="name" required maxLength={180} placeholder="Örn. Citrus No. 01" /></label><label>URL kısa adı<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="citrus-no-01" /></label><label>Kategori<select name="category"><option value="">Kategori seçilmedi</option>{categoryRows.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label><label>Stok kodu (SKU)<input name="sku" required pattern="[A-Za-z0-9-]{3,100}" placeholder="DRM-CT-100" /></label><label>Hacim (ML)<input name="volumeMl" type="number" min="1" required defaultValue="100" /></label><label>Fiyat (₺)<input name="price" type="number" min="0" step="0.01" required /></label><label>Stok (adet)<input name="stock" type="number" min="0" step="1" required defaultValue="0" /></label><label className="product-form-wide">Kısa açıklama<textarea name="description" rows={2} maxLength={500} /></label><label>SEO başlığı<input name="seoTitle" maxLength={160} /></label><label>SEO açıklaması<input name="seoDescription" maxLength={320} /></label><button type="submit" disabled={!!error}>Ürünü kaydet</button></form></section>
    <section className="admin-panel"><div className="panel-title"><div><p className="admin-kicker">KATALOG</p><h2>Ürünler ve varyantlar</h2></div><span>{rows.length} varyant</span></div>{!rows.length && <p className="admin-lead">Henüz kayıtlı ürün yok. Yukarıdaki formdan ilk ürünü ekleyebilirsin.</p>}<div className="product-admin-list">{rows.map(row => <article key={row.variantId ?? row.id} className="product-admin-row"><div><strong>{row.name}</strong><small>{row.slug} · {row.volumeMl ?? "—"} ML · {row.sku ?? "—"} · {row.active ? "Aktif" : "Arşivde"}</small></div>{row.variantId && <form action={updateProduct} className="product-admin-edit"><input type="hidden" name="id" value={row.id} /><input type="hidden" name="variantId" value={row.variantId} /><label>Ürün adı<input name="name" defaultValue={row.name} required /></label><label>Fiyat ₺<input name="price" type="number" min="0" step="0.01" defaultValue={row.price ?? "0"} required /></label><label>Stok<input name="stock" type="number" min="0" step="1" defaultValue={row.stock ?? 0} required /></label><button type="submit">Güncelle</button></form>}{row.active && <form action={archiveProduct}><input type="hidden" name="id" value={row.id} /><button className="product-archive" type="submit">Arşivle</button></form>}</article>)}</div></section>
  </main>;
}
