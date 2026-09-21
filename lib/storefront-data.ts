import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, productImages, products, productVariants, siteSettings } from "@/db/schema";

export async function getStoreNavCategories() {
  try {
    const db = getDb();
    return await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder), asc(categories.name));
  } catch (error) {
    console.error("Kategoriler alınamadı:", error);
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getStoreSettings(): Promise<Record<string, any>> {
  try {
    const db = getDb();
    const rows = await db.select().from(siteSettings);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map: Record<string, any> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  } catch (error) {
    console.error("Ayarlar alınamadı:", error);
    return {};
  }
}

export async function getFeaturedProducts() {
  try {
    const db = getDb();
    const prods = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        categoryId: products.categoryId,
        shortDescription: products.shortDescription,
        fragranceNotes: products.fragranceNotes,
        isFeatured: products.isFeatured,
      })
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(desc(products.isFeatured), desc(products.createdAt));

    const result = [];
    for (const prod of prods) {
      // Varyantlar
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

      // Resim
      const [img] = await db
        .select({ url: productImages.url })
        .from(productImages)
        .where(eq(productImages.productId, prod.id))
        .orderBy(asc(productImages.sortOrder))
        .limit(1);

      result.push({
        ...prod,
        variants,
        imageUrl: img?.url ?? "/images/dr-mars-hero.png",
      });
    }

    return result;
  } catch (error) {
    console.error("Öne çıkan ürünler alınamadı:", error);
    return [];
  }
}
