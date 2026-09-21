import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, productImages, products, productVariants } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const channel = url.searchParams.get("channel") ?? "all";
    const format = url.searchParams.get("format") ?? (channel === "json" ? "json" : "xml");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://drmarsparfum.com";
    const db = getDb();

    // Aktif ürünleri ve varsayılan varyantlarını çek
    const rows = await db
      .select({
        productId: products.id,
        name: products.name,
        slug: products.slug,
        shortDescription: products.shortDescription,
        description: products.description,
        categoryName: categories.name,
        variantId: productVariants.id,
        sku: productVariants.sku,
        price: productVariants.price,
        compareAtPrice: productVariants.compareAtPrice,
        stock: productVariants.stockQuantity,
        volumeMl: productVariants.volumeMl,
        imageUrl: productImages.url,
      })
      .from(products)
      .innerJoin(productVariants, and(eq(products.id, productVariants.productId), eq(productVariants.isActive, true)))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productImages, and(eq(products.id, productImages.productId), eq(productImages.sortOrder, 0)))
      .where(eq(products.isActive, true));

    // JSON Formatı (TikTok / API Entegrasyonları için)
    if (format === "json") {
      const items = rows.map((r) => ({
        id: r.sku || r.variantId,
        title: r.name,
        description: r.shortDescription || r.description || `${r.name} - Lüks Dr. Mars Kolonyası`,
        link: `${baseUrl}/urun/${r.slug}`,
        image_link: r.imageUrl || `${baseUrl}/images/hero-cologne.png`,
        availability: (r.stock ?? 0) > 0 ? "in_stock" : "out_of_stock",
        price: `${r.price} TRY`,
        sale_price: r.compareAtPrice ? `${r.price} TRY` : undefined,
        brand: "Dr. Mars",
        category: r.categoryName || "Parfümeri & Kolonya",
        inventory: r.stock ?? 0,
      }));

      return NextResponse.json({
        store: "Dr. Mars Haute Parfumerie",
        channel,
        total_products: items.length,
        products: items,
      });
    }

    // Standart XML Formatı (Google Merchant Center & Meta Commerce Manager standardı)
    const xmlEscape = (str?: string | null) =>
      (str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    const itemsXml = rows
      .map((r) => {
        const title = xmlEscape(r.name);
        const desc = xmlEscape(r.shortDescription || r.description || `${r.name} - Mardin Doğal Akik Taşlı Kolonya`);
        const link = `${baseUrl}/urun/${r.slug}`;
        const image = r.imageUrl || `${baseUrl}/images/hero-cologne.png`;
        const availability = (r.stock ?? 0) > 0 ? "in_stock" : "out_of_stock";
        const price = `${Number(r.price).toFixed(2)} TRY`;

        return `    <item>
      <g:id>${xmlEscape(r.sku || r.variantId)}</g:id>
      <g:title>${title}</g:title>
      <g:description>${desc}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${image}</g:image_link>
      <g:brand>Dr. Mars</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:google_product_category>Health &amp; Beauty &gt; Personal Care &gt; Cosmetics &gt; Perfume &amp; Cologne</g:google_product_category>
      <g:product_type>${xmlEscape(r.categoryName || "Kolonya")}</g:product_type>
    </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Dr. Mars Haute Parfumerie - Ürün Kataloğu</title>
    <link>${baseUrl}</link>
    <description>Mardin OSB Doğal Akik Taşlı Niş Kolonya ve Parfüm Koleksiyonu</description>
${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Catalog feed generation error:", error);
    return new NextResponse("Katalog feed oluşturulurken hata oluştu.", { status: 500 });
  }
}
