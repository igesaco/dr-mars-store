import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, productImages, products, productVariants } from "@/db/schema";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { ProductCard } from "@/components/storefront/product-card";
import { WhatsAppButton } from "@/components/storefront/whatsapp-button";
import { ScrollToTop } from "@/components/storefront/scroll-to-top";
import { getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";
import { ChevronDown, ChevronRight, SlidersHorizontal } from "lucide-react";

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
          title: "Kolonya | Dr. Mars",
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

  if (slug !== "all" && slug !== "kolonyalar") {
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
      isFeatured: products.isFeatured,
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

  const announcement = settings.announcement?.text ?? "MARDİN OSB LABORATUVARLARINDAN · 1.500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ";
  const title = currentCategory ? currentCategory.name : "Kolonya";

  return (
    <main className="min-h-screen bg-white text-[#111620]">
      <Header categories={navCategories} announcementText={announcement} />

      <section className="mx-auto max-w-7xl px-4 sm:px-8 py-10 sm:py-14">
        {/* Üst Satır: [ Filtreleme > ]  [ Kolonya (Ortalı Başlık) ]  [ Sıralama Seçiniz v ] */}
        <div className="relative flex items-center justify-between gap-4 pb-4">
          {/* Sol: Filtreleme Butonu */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 cursor-pointer">
            <span>Filtreleme</span>
            <ChevronRight size={14} className="text-stone-500" />
          </div>

          {/* Orta: Başlık */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#1b2b22] tracking-normal font-normal">
              {title}
            </h1>
          </div>

          {/* Sağ: Sıralama Dropdown */}
          <div className="relative">
            <select
              defaultValue="featured"
              className="appearance-none bg-transparent pr-6 text-xs sm:text-sm font-medium text-stone-700 hover:text-stone-900 cursor-pointer outline-none text-right"
            >
              <option value="featured">Sıralama Seçiniz</option>
              <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
              <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
              <option value="name-asc">Ürün Adı: A - Z</option>
            </select>
            <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500" />
          </div>
        </div>

        {/* Alt Satır: [ EN ÇOK SATAN ]  [ TÜM ÜRÜNLER ] */}
        <div className="flex items-center justify-center gap-3 pt-2 pb-4">
          <Link
            href="/kategori/kolonyalar"
            className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#27382f] text-white shadow-xs"
          >
            EN ÇOK SATAN
          </Link>

          <Link
            href="/kategori/kolonyalar"
            className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-stone-900"
          >
            TÜM ÜRÜNLER
          </Link>
        </div>

        {/* İnce Çizgi Ayracı */}
        <hr className="border-stone-200 mb-8" />

        {/* Ürün Listeleme Grid'i */}
        {items.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
              <SlidersHorizontal size={22} />
            </div>
            <h3 className="mt-3 text-sm font-bold text-stone-800">Bu kategoride henüz ürün bulunmuyor</h3>
            <p className="mt-1 text-xs text-stone-500">Çok yakında yeni ürünlerimiz bu alanda yer alacaktır.</p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-lg bg-[#27382f] px-5 py-2.5 text-xs font-semibold text-white shadow-xs"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
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

      <WhatsAppButton />
      <ScrollToTop />
      <Footer />
    </main>
  );
}
