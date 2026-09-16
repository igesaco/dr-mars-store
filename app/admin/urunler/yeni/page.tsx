import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { categories } from "@/db/schema";
import ProductForm from "../product-form";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  let categoryRows: { id: string; name: string }[] = [];
  let error = "";
  try {
    categoryRows = await getDb().select({ id: categories.id, name: categories.name }).from(categories)
      .where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder), asc(categories.name));
  } catch { error = "Kategoriler okunamadı. Veritabanı bağlantısını kontrol et."; }
  return <main className="admin-main catalog-main">
    <header className="editor-page-head"><div><Link href="/admin/urunler">← Ürünlere dön</Link><p className="admin-kicker">KATALOG / YENİ ÜRÜN</p><h1>Yeni ürün ekle</h1><p>Shopify mantığında, tek akışta gerekli bilgileri doldur.</p></div></header>
    {error && <div className="admin-notice report-error" role="alert">{error}</div>}
    <ProductForm categories={categoryRows} action={createProduct} mode="create" />
  </main>;
}
