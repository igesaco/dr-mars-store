import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { categories, productImages, products, productVariants } from "@/db/schema";
import ProductForm from "../product-form";
import { updateProduct } from "../actions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let product;
  let categoryRows: { id: string; name: string }[] = [];
  try {
    const db = getDb();
    const [rows, list, imgRows] = await Promise.all([
      db.select({
        id: products.id, variantId: productVariants.id, name: products.name, slug: products.slug,
        shortDescription: products.shortDescription, description: products.description, fragranceNotes: products.fragranceNotes,
        categoryId: products.categoryId, featured: products.isFeatured, active: products.isActive,
        seoTitle: products.seoTitle, seoDescription: products.seoDescription,
        sku: productVariants.sku, volumeMl: productVariants.volumeMl, price: productVariants.price,
        compareAtPrice: productVariants.compareAtPrice, unitCost: productVariants.unitCost,
        stock: productVariants.stockQuantity, lowStockThreshold: productVariants.lowStockThreshold,
        imageUrl: productImages.url,
      }).from(products).leftJoin(productVariants, eq(products.id, productVariants.productId))
        .leftJoin(productImages, and(eq(products.id, productImages.productId), eq(productImages.sortOrder, 0)))
        .where(eq(products.id, id)).limit(1),
      db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.sortOrder), asc(categories.name)),
      db.select({ url: productImages.url }).from(productImages)
        .where(eq(productImages.productId, id))
        .orderBy(asc(productImages.sortOrder)),
    ]);
    product = rows[0];
    categoryRows = list;
    const allImages = imgRows.map(r => r.url).filter(Boolean);
    if (product) {
      (product as any).images = allImages;
      if (allImages.length > 0 && !product.imageUrl) {
        product.imageUrl = allImages[0];
      }
    }
  } catch { /* not found page below */ }
  if (!product?.variantId) notFound();
  return <main className="admin-main catalog-main">
    <header className="editor-page-head"><div><Link href="/admin/urunler">← Ürünlere dön</Link><p className="admin-kicker">KATALOG / ÜRÜN DÜZENLE</p><h1>{product.name}</h1><p>Ürün bilgisi, fiyat, maliyet, stok ve SEO ayarlarını tek ekrandan güncelle.</p></div></header>
    <ProductForm categories={categoryRows} action={updateProduct} mode="edit" data={{ ...product, variantId: product.variantId, images: (product as any).images }} />
  </main>;
}
