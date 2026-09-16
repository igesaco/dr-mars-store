import { NextRequest, NextResponse } from "next/server";
import { and, eq, ilike, or } from "drizzle-orm";
import { getDb } from "@/db";
import { productImages, products, productVariants } from "@/db/schema";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const db = getDb();
    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        shortDescription: products.shortDescription,
        price: productVariants.price,
        imageUrl: productImages.url,
      })
      .from(products)
      .leftJoin(productVariants, eq(products.id, productVariants.productId))
      .leftJoin(productImages, eq(products.id, productImages.productId))
      .where(
        and(
          eq(products.isActive, true),
          or(
            ilike(products.name, `%${q}%`),
            ilike(products.slug, `%${q}%`),
            ilike(products.shortDescription, `%${q}%`),
            ilike(productVariants.sku, `%${q}%`)
          )
        )
      )
      .limit(6);

    // Tekilleştirme (farklı varyantlar aynı ürünü çoğaltmasın)
    const seen = new Set<string>();
    const unique = rows.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

    return NextResponse.json({ results: unique });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
