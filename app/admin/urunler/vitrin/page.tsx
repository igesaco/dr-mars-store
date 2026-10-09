import Link from "next/link";
import { asc, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, productImages, products, productVariants } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import VitrinSorter, { type VitrinItem } from "./vitrin-sorter";

export const dynamic = "force-dynamic";

export default async function VitrinSiralamaPage() {
  await requireAdmin();
  const db = getDb();

  const prods = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sortOrder: products.sortOrder,
      isFeatured: products.isFeatured,
      isActive: products.isActive,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.isActive, true))
    .orderBy(
      sql`CASE WHEN ${products.sortOrder} > 0 THEN ${products.sortOrder} ELSE 999999 END ASC`,
      desc(products.isFeatured),
      desc(products.createdAt)
    );

  const items: VitrinItem[] = await Promise.all(
    prods.map(async (p) => {
      const [img] = await db
        .select({ url: productImages.url })
        .from(productImages)
        .where(eq(productImages.productId, p.id))
        .orderBy(asc(productImages.sortOrder))
        .limit(1);

      const [variant] = await db
        .select({ price: productVariants.price })
        .from(productVariants)
        .where(eq(productVariants.productId, p.id))
        .orderBy(asc(productVariants.price))
        .limit(1);

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sortOrder: p.sortOrder ?? 0,
        isFeatured: p.isFeatured ?? false,
        categoryName: p.categoryName || "Kategorisiz",
        imageUrl: img?.url || null,
        price: variant?.price || null,
      };
    })
  );

  return (
    <main className="admin-main catalog-main" style={{ maxWidth: "1100px", margin: "0 auto", paddingBottom: "60px" }}>
      <header className="catalog-top" style={{ marginBottom: "24px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Link
              href="/admin/urunler"
              style={{
                fontSize: "0.8rem",
                color: "#64748b",
                textDecoration: "none",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              ← Ürün Kataloğuna Dön
            </Link>
          </div>
          <p className="admin-kicker">KATALOG & ANASAYFA YÖNETİMİ</p>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px", margin: "4px 0" }}>
            ⭐ Anasayfa & Vitrin Ürün Sıralaması
          </h1>
          <p className="admin-lead">
            Anasayfa vitrininde ürünlerin hangi sırada listeleneceğini buradan belirleyin.
            İlk noktada (1. kutu) gözükmesini istediğiniz ürünü tek tıkla 1. sıraya taşıyabilir,
            diğer ürünlerin sıralamasını dilediğiniz gibi düzenleyebilirsiniz.
          </p>
        </div>

        <div className="catalog-actions">
          <Link
            href="/admin/urunler"
            className="catalog-secondary"
            style={{ textDecoration: "none" }}
          >
            Tüm Ürünler
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="catalog-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
              backgroundColor: "#f8fafc",
              borderColor: "#cbd5e1",
            }}
          >
            🌐 Anasayfayı Canlı Gör ↗
          </a>
        </div>
      </header>

      <VitrinSorter initialItems={items} />
    </main>
  );
}
