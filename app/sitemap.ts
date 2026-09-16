import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, products } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://drmars.com";

  // Sabit sayfalar
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/kategori/kolonyalar`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/hakkimizda`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/iletisim`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/siparis-takip`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  try {
    const db = getDb();

    // Ürünler
    const activeProducts = await db
      .select({ slug: products.slug, updatedAt: products.updatedAt })
      .from(products)
      .where(eq(products.isActive, true));

    const productRoutes: MetadataRoute.Sitemap = activeProducts.map((p) => ({
      url: `${baseUrl}/urun/${p.slug}`,
      lastModified: p.updatedAt ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // Kategoriler
    const activeCategories = await db
      .select({ slug: categories.slug, updatedAt: categories.updatedAt })
      .from(categories)
      .where(eq(categories.isActive, true));

    const categoryRoutes: MetadataRoute.Sitemap = activeCategories.map((c) => ({
      url: `${baseUrl}/kategori/${c.slug}`,
      lastModified: c.updatedAt ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return staticRoutes;
  }
}
