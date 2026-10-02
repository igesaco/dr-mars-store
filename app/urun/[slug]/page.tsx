import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, productImages, productReviews, products, productVariants } from "@/db/schema";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";
import { ProductView } from "./product-view";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const db = getDb();
    const [product] = await db
      .select({
        name: products.name,
        shortDescription: products.shortDescription,
        seoTitle: products.seoTitle,
        seoDescription: products.seoDescription,
      })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (!product) return { title: "Ürün Bulunamadı | Dr. Mars" };

    return {
      title: product.seoTitle ?? `${product.name} | Dr. Mars Modern Cologne`,
      description: product.seoDescription ?? product.shortDescription ?? "Dr. Mars kolonya serisi.",
    };
  } catch {
    return { title: "Dr. Mars | Modern Cologne" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const db = getDb();

  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      description: products.description,
      fragranceNotes: products.fragranceNotes,
      categoryId: products.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product) {
    notFound();
  }

  // Varyantları çek
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
    .where(eq(productVariants.productId, product.id))
    .orderBy(asc(productVariants.volumeMl));

  // Resimler
  const imageRows = await db
    .select({ url: productImages.url })
    .from(productImages)
    .where(eq(productImages.productId, product.id))
    .orderBy(asc(productImages.sortOrder));

  const imageUrls = imageRows.map((i) => i.url).filter(Boolean);
  const primaryImage = imageUrls[0] ?? null;

  // Onaylanmış Yorumlar
  let reviews: {
    id: string;
    authorName: string;
    rating: number;
    title: string | null;
    comment: string;
    createdAt: Date;
  }[] = [];

  try {
    reviews = await db
      .select({
        id: productReviews.id,
        authorName: productReviews.authorName,
        rating: productReviews.rating,
        title: productReviews.title,
        comment: productReviews.comment,
        createdAt: productReviews.createdAt,
      })
      .from(productReviews)
      .where(and(eq(productReviews.productId, product.id), eq(productReviews.isApproved, true)))
      .orderBy(desc(productReviews.createdAt));
  } catch (error) {
    console.error("Yorumlar yüklenirken hata:", error);
    reviews = [];
  }

  const [navCategories, settings] = await Promise.all([
    getStoreNavCategories(),
    getStoreSettings(),
  ]);

  const announcement = settings.announcement?.text ?? "1500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ";

  return (
    <main className="min-h-screen bg-[#f5f4ee] text-[#0b1724]">
      <Header categories={navCategories} announcementText={announcement} />
      <ProductView
        product={{
          ...product,
          variants,
          imageUrl: primaryImage,
          images: imageUrls,
        }}
        reviews={reviews}
      />
      <Footer />
    </main>
  );
}
