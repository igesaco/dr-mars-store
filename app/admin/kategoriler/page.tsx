import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, products } from "@/db/schema";
import { deleteCategory, saveCategory, toggleCategory } from "../urunler/actions";

export default async function CategoriesPage() {
  let rows: { id: string; name: string; slug: string; description: string | null; sortOrder: number; active: boolean; productCount: number }[] = [];
  let error = "";
  try {
    rows = await getDb().select({
      id: categories.id, name: categories.name, slug: categories.slug, description: categories.description,
      sortOrder: categories.sortOrder, active: categories.isActive, productCount: count(products.id),
    }).from(categories).leftJoin(products, eq(categories.id, products.categoryId))
      .groupBy(categories.id).orderBy(asc(categories.sortOrder), asc(categories.name));
  } catch { error = "Kategoriler okunamadı. PostgreSQL bağlantısını kontrol et."; }
  return <main className="admin-main catalog-main">
    <header className="catalog-top">
      <div><p className="admin-kicker">E-TİCARET / KATALOG</p><h1>Kategoriler</h1><p className="admin-lead">Ürünleri mağazada anlaşılır gruplar altında düzenle.</p></div>
      <div className="catalog-actions"><Link className="catalog-secondary" href="/admin/urunler">← Ürünlere dön</Link></div>
    </header>
    {error && <div className="admin-notice report-error" role="alert">{error}</div>}
    <div className="category-layout">
      <section className="editor-card category-create">
        <div className="editor-title"><span>+</span><div><h2>Yeni kategori</h2><p>Kategori adı, URL ve liste sırası.</p></div></div>
        <form action={saveCategory} className="category-form">
          <label>Kategori adı<input name="name" required maxLength={120} placeholder="Örn. Kolonyalar" /></label>
          <label>URL kısa adı<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="kolonyalar" /></label>
          <label>Sıralama<input name="sortOrder" type="number" min="0" step="1" defaultValue="0" required /></label>
          <label className="editor-wide">Açıklama<textarea name="description" rows={4} /></label>
          <label className="editor-featured"><input name="isActive" type="checkbox" defaultChecked /> Aktif kategori</label>
          <button type="submit">Kategoriyi oluştur</button>
        </form>
      </section>
      <section className="admin-panel category-list">
        <div className="panel-title"><div><p className="admin-kicker">KATEGORİ LİSTESİ</p><h2>{rows.length} kategori</h2></div></div>
        {rows.map(row => <article className="category-row" key={row.id}>
          <form action={saveCategory} className="category-edit">
            <input type="hidden" name="id" value={row.id} />
            <label>Ad<input name="name" defaultValue={row.name} required /></label>
            <label>URL<input name="slug" defaultValue={row.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" required /></label>
            <label>Sıra<input name="sortOrder" type="number" min="0" defaultValue={row.sortOrder} required /></label>
            <label className="category-description">Açıklama<input name="description" defaultValue={row.description ?? ""} /></label>
            <input type="hidden" name="isActive" value={row.active ? "on" : ""} />
            <button type="submit">Kaydet</button>
          </form>
          <div className="category-meta"><span>{row.productCount} ürün</span><span className={row.active ? "catalog-status active" : "catalog-status"}>{row.active ? "Aktif" : "Pasif"}</span>
            <form action={toggleCategory}><input type="hidden" name="id" value={row.id} /><input type="hidden" name="active" value={row.active ? "false" : "true"} /><button type="submit">{row.active ? "Pasife al" : "Aktifleştir"}</button></form>
            <form action={deleteCategory}><input type="hidden" name="id" value={row.id} /><button type="submit" style={{ color: "#dc2626", borderColor: "#fecaca" }}>Sil</button></form>
          </div>
        </article>)}
        {!rows.length && <p className="catalog-empty">Henüz kategori oluşturulmadı.</p>}
      </section>
    </div>
  </main>;
}
