import Link from "next/link";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { getDb } from "@/db";
import { productImages, products, productVariants } from "@/db/schema";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { ProductCard } from "@/components/storefront/product-card";
import { getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const cleanQ = q.trim();
  const db = getDb();

  let items = [];
  if (cleanQ.length >= 2) {
    const prods = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        shortDescription: products.shortDescription,
        fragranceNotes: products.fragranceNotes,
      })
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          or(
            ilike(products.name, `%${cleanQ}%`),
            ilike(products.slug, `%${cleanQ}%`),
            ilike(products.shortDescription, `%${cleanQ}%`)
          )
        )
      )
      .orderBy(desc(products.createdAt));

    for (const prod of prods) {
      const variants = await db
        .select({
          id: productVariants.id,
          name: productVariants.name,
          sku: productVariants.sku,
          volumeMl: productVariants.volumeMl,
          price: productVariants.price,
          compareAtPrice: productVariants.compareAtPrice,
          stock: productVariants.stockQuantity,
        })
        .from(productVariants)
        .where(eq(productVariants.productId, prod.id))
        .orderBy(asc(productVariants.volumeMl));

      const [img] = await db
        .select({ url: productImages.url })
        .from(productImages)
        .where(eq(productImages.productId, prod.id))
        .orderBy(asc(productImages.sortOrder))
        .limit(1);

      items.push({
        ...prod,
        variants,
        imageUrl: img?.url ?? "/images/dr-mars-hero.png",
      });
    }
  }

  const [navCategories, settings] = await Promise.all([
    getStoreNavCategories(),
    getStoreSettings(),
  ]);

  const announcement = settings.announcement?.text ?? "1500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ";

  return (
    <main className="min-h-screen bg-[#f5f4ee] text-[#0b1724]">
      <Header categories={navCategories} announcementText={announcement} />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-12">
        <div className="mb-10">
          <p className="eyebrow dark">ARAMA SONUÇLARI</p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900">
            {cleanQ ? `"${cleanQ}" için sonuçlar` : "Arama Yapın"}
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            {items.length} ürün bulundu.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white p-12 text-center">
            <p className="text-stone-600">Aradığınız kriterlere uygun ürün bulunamadı.</p>
            <Link href="/" className="mt-4 inline-block font-bold text-sm text-stone-900 underline">
              Tüm ürünleri keşfedin →
            </Link>
          </div>
        ) : (
          <div className="product-grid">
            {items.map((p, i) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                shortDescription={p.shortDescription}
                fragranceNotes={p.fragranceNotes}
                variants={p.variants}
                imageUrl={p.imageUrl}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
