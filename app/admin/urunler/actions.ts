"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { categories, inventoryMovements, productVariants, products } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const integer = (form: FormData, key: string) => Number(text(form, key));

export async function createProduct(form: FormData) {
  await requireAdmin();
  const name = text(form, "name"), sku = text(form, "sku"), slug = text(form, "slug").toLowerCase();
  const volumeMl = integer(form, "volumeMl"), stock = integer(form, "stock"), price = text(form, "price");
  if (!name || name.length > 180 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !/^[A-Za-z0-9-]{3,100}$/.test(sku)) throw new Error("Ürün adı, URL ve SKU bilgilerini kontrol et.");
  if (!Number.isInteger(volumeMl) || volumeMl < 1 || !Number.isInteger(stock) || stock < 0 || !/^(0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(price)) throw new Error("Fiyat, stok veya hacim geçersiz.");
  const db = getDb();
  const categorySlug = text(form, "category");
  const [category] = categorySlug ? await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1) : [];
  await db.transaction(async tx => {
    const [product] = await tx.insert(products).values({ name, slug, categoryId: category?.id, shortDescription: text(form, "description").slice(0, 500), seoTitle: text(form, "seoTitle").slice(0, 160) || null, seoDescription: text(form, "seoDescription").slice(0, 320) || null }).returning({ id: products.id });
    const [variant] = await tx.insert(productVariants).values({ productId: product.id, name: `${volumeMl} ML`, sku, volumeMl, price, stockQuantity: stock }).returning({ id: productVariants.id });
    if (stock) await tx.insert(inventoryMovements).values({ variantId: variant.id, type: "in", quantity: stock, note: "İlk stok" });
  });
  revalidatePath("/admin/urunler"); revalidatePath("/admin");
}

export async function updateProduct(form: FormData) {
  await requireAdmin();
  const id = text(form, "id"), variantId = text(form, "variantId"), name = text(form, "name"), price = text(form, "price"), stock = integer(form, "stock");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f-]{36}$/i.test(variantId) || !name || name.length > 180 || !/^(0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(price) || !Number.isInteger(stock) || stock < 0) throw new Error("Ürün bilgileri geçersiz.");
  const db = getDb();
  await db.transaction(async tx => {
    const [old] = await tx.select({ stock: productVariants.stockQuantity }).from(productVariants).where(and(eq(productVariants.id, variantId), eq(productVariants.productId, id))).limit(1);
    if (!old) throw new Error("Ürün varyantı bulunamadı.");
    await tx.update(products).set({ name, updatedAt: new Date() }).where(eq(products.id, id));
    await tx.update(productVariants).set({ price, stockQuantity: stock, updatedAt: new Date() }).where(eq(productVariants.id, variantId));
    const delta = stock - old.stock;
    if (delta) await tx.insert(inventoryMovements).values({ variantId, type: "adjustment", quantity: delta, note: "Yönetim panelinde stok güncellemesi" });
  });
  revalidatePath("/admin/urunler"); revalidatePath("/admin");
}

export async function archiveProduct(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Geçersiz ürün.");
  await getDb().update(products).set({ isActive: false, updatedAt: new Date() }).where(eq(products.id, id));
  revalidatePath("/admin/urunler"); revalidatePath("/admin");
}
