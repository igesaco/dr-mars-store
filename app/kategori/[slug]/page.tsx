import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, productImages, products, productVariants } from "@/db/schema";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { ProductCard } from "@/components/storefront/product-card";
import { getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const db = getDb();
    const [cat] = await db
      .select({
        name: categories.name,
        description: categories.description,
        seoTitle: categories.seoTitle,
        seoDescription: categories.seoDescription,
      })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (!cat) {
      if (slug === "kolonyalar") {
        return {
          title: "Tüm Kolonyalar | Dr. Mars Modern Cologne",
          description: "Dr. Mars imza kolonya koleksiyonunu keşfedin.",
        };
      }
      return { title: "Kategori | Dr. Mars" };
    }

    return {
      title: cat.seoTitle ?? `${cat.name} | Dr. Mars`,
      description: cat.seoDescription ?? cat.description ?? "Dr. Mars özel koleksiyonu.",
    };
  } catch {
    return { title: "Koleksiyon | Dr. Mars" };
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const db = getDb();

  let currentCategory: { id: string; name: string; slug: string; description: string | null } | null = null;

  if (slug !== "all") {
    const [found] = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
      })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    currentCategory = found ?? null;
  }

  // Eğer slug "kolonyalar" veya özel bir kategori ise, ona ait ürünleri getir
  const conditions = [eq(products.isActive, true)];
  if (currentCategory && slug !== "kolonyalar") {
    conditions.push(eq(products.categoryId, currentCategory.id));
  }

  const prods = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      fragranceNotes: products.fragranceNotes,
    })
    .from(products)
    .where(and(...conditions))
    .orderBy(desc(products.isFeatured), desc(products.createdAt));

  const items = [];
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

  const [navCategories, settings] = await Promise.all([
    getStoreNavCategories(),
    getStoreSettings(),
  ]);

  const announcement = settings.announcement?.text ?? "1500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ";
  const title = currentCategory ? currentCategory.name : "Tüm Kolonyalar";
  const description = currentCategory?.description ?? "Dr. Mars imza kolonya koleksiyonu.";

  return (
    <main className="min-h-screen bg-[#f5f4ee] text-[#0b1724]">
      <Header categories={navCategories} announcementText={announcement} />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-12">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500 mb-6">
          <Link href="/" className="hover:text-black">
            Ana Sayfa
          </Link>
          <span>/</span>
          <span className="text-stone-900">{title}</span>
        </div>

        {/* Category Header */}
        <div className="mb-12">
          <p className="eyebrow dark">DR MARS · KOLEKSİYON</p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-stone-900">
            {title}
          </h1>
          <p className="mt-3 max-w-xl text-base text-stone-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Product Grid */}
        {items.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white p-12 text-center">
            <h3 className="text-lg font-bold text-stone-800">Bu kategoride henüz ürün bulunmuyor</h3>
            <p className="mt-1 text-sm text-stone-500">Çok yakında yeni ürünlerimiz bu alanda yer alacaktır.</p>
            <Link href="/" className="mt-6 inline-block rounded bg-[#101e2c] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white">
              Ana Sayfaya Dön
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
