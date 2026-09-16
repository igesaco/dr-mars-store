"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { categories, inventoryMovements, productImages, productVariants, products } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

const read = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const moneyPattern = /^(0|[1-9]\d{0,9})(?:\.\d{1,2})?$/;

const nullableMoney = (form: FormData, key: string) => {
  const value = read(form, key);
  if (value && !moneyPattern.test(value)) throw new Error(`${key} geçersiz.`);
  return value || null;
};
const integer = (form: FormData, key: string, min = 0) => {
  const value = Number(read(form, key));
  if (!Number.isInteger(value) || value < min) throw new Error(`${key} geçersiz.`);
  return value;
};
const categoryId = (form: FormData) => {
  const value = read(form, "categoryId");
  if (value && !uuid.test(value)) throw new Error("Kategori geçersiz.");
  return value || null;
};
const imageUrl = (form: FormData) => {
  const value = read(form, "imageUrl");
  if (!value) return null;
  const parsed = new URL(value);
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Görsel bağlantısı geçersiz.");
  return parsed.toString();
};
const refreshCatalog = () => {
  revalidatePath("/admin");
  revalidatePath("/admin/urunler");
  revalidatePath("/admin/urunler/yeni");
  revalidatePath("/admin/kategoriler");
};

export async function createProduct(form: FormData) {
  await requireAdmin();
  const name = read(form, "name");
  const slug = read(form, "slug").toLowerCase();
  const sku = read(form, "sku").toUpperCase();
  const price = read(form, "price");
  const volumeMl = integer(form, "volumeMl", 1);
  const stock = integer(form, "stock");
  const lowStockThreshold = integer(form, "lowStockThreshold");
  if (!name || name.length > 180 || !slugPattern.test(slug) || !/^[A-Z0-9-]{3,100}$/.test(sku) || !moneyPattern.test(price)) {
    throw new Error("Ürün adı, URL, SKU veya fiyat bilgisini kontrol et.");
  }
  const fragranceNotesRaw = read(form, "fragranceNotes");
  const fragranceNotes = fragranceNotesRaw ? fragranceNotesRaw.split(",").map(s => s.trim()).filter(Boolean) : null;
  const db = getDb();
  await db.transaction(async tx => {
    const [product] = await tx.insert(products).values({
      name, slug, categoryId: categoryId(form),
      shortDescription: read(form, "shortDescription").slice(0, 500) || null,
      description: read(form, "description") || null,
      fragranceNotes,
      isFeatured: read(form, "isFeatured") === "on",
      isActive: read(form, "status") !== "draft",
      seoTitle: read(form, "seoTitle").slice(0, 160) || null,
      seoDescription: read(form, "seoDescription").slice(0, 320) || null,
    }).returning({ id: products.id });
    const [variant] = await tx.insert(productVariants).values({
      productId: product.id, name: `${volumeMl} ML`, sku, volumeMl, price,
      compareAtPrice: nullableMoney(form, "compareAtPrice"),
      unitCost: nullableMoney(form, "unitCost"), stockQuantity: stock,
      lowStockThreshold, isActive: read(form, "status") !== "draft",
    }).returning({ id: productVariants.id });
    if (stock) await tx.insert(inventoryMovements).values({
      variantId: variant.id, type: "in", quantity: stock, note: "Ürün oluşturulurken ilk stok",
    });
    const url = imageUrl(form);
    if (url) await tx.insert(productImages).values({ productId: product.id, url, altText: name, sortOrder: 0 });
  });
  refreshCatalog();
  redirect("/admin/urunler?created=1");
}

export async function updateProduct(form: FormData) {
  await requireAdmin();
  const id = read(form, "id"), variantId = read(form, "variantId");
  const name = read(form, "name"), slug = read(form, "slug").toLowerCase(), sku = read(form, "sku").toUpperCase();
  const price = read(form, "price"), volumeMl = integer(form, "volumeMl", 1);
  const stock = integer(form, "stock"), lowStockThreshold = integer(form, "lowStockThreshold");
  if (!uuid.test(id) || !uuid.test(variantId) || !name || name.length > 180 || !slugPattern.test(slug) ||
      !/^[A-Z0-9-]{3,100}$/.test(sku) || !moneyPattern.test(price)) throw new Error("Ürün bilgileri geçersiz.");
  const db = getDb();
  await db.transaction(async tx => {
    const [old] = await tx.select({ stock: productVariants.stockQuantity }).from(productVariants)
      .where(and(eq(productVariants.id, variantId), eq(productVariants.productId, id))).limit(1);
    if (!old) throw new Error("Ürün varyantı bulunamadı.");
    const fragranceNotesRaw = read(form, "fragranceNotes");
    const fragranceNotes = fragranceNotesRaw ? fragranceNotesRaw.split(",").map(s => s.trim()).filter(Boolean) : null;
    const active = read(form, "status") !== "draft";
    await tx.update(products).set({
      name, slug, categoryId: categoryId(form),
      shortDescription: read(form, "shortDescription").slice(0, 500) || null,
      description: read(form, "description") || null,
      fragranceNotes,
      isFeatured: read(form, "isFeatured") === "on", isActive: active,
      seoTitle: read(form, "seoTitle").slice(0, 160) || null,
      seoDescription: read(form, "seoDescription").slice(0, 320) || null, updatedAt: new Date(),
    }).where(eq(products.id, id));
    await tx.update(productVariants).set({
      name: `${volumeMl} ML`, sku, volumeMl, price,
      compareAtPrice: nullableMoney(form, "compareAtPrice"), unitCost: nullableMoney(form, "unitCost"),
      stockQuantity: stock, lowStockThreshold, isActive: active, updatedAt: new Date(),
    }).where(eq(productVariants.id, variantId));
    const delta = stock - old.stock;
    if (delta) await tx.insert(inventoryMovements).values({
      variantId, type: "adjustment", quantity: delta, note: "Ürün düzenleme ekranında stok güncellemesi",
    });
    const url = imageUrl(form);
    await tx.delete(productImages).where(eq(productImages.productId, id));
    if (url) await tx.insert(productImages).values({ productId: id, url, altText: name, sortOrder: 0 });
  });
  refreshCatalog();
  redirect("/admin/urunler?updated=1");
}

export async function bulkProductAction(form: FormData) {
  await requireAdmin();
  const ids = form.getAll("productIds").map(String).filter(id => uuid.test(id)).slice(0, 200);
  const action = read(form, "bulkAction");
  if (!ids.length || !["activate", "archive"].includes(action)) throw new Error("Ürün veya toplu işlem seçilmedi.");
  const active = action === "activate";
  const db = getDb();
  await db.transaction(async tx => {
    await tx.update(products).set({ isActive: active, updatedAt: new Date() }).where(inArray(products.id, ids));
    await tx.update(productVariants).set({ isActive: active, updatedAt: new Date() }).where(inArray(productVariants.productId, ids));
  });
  refreshCatalog();
}

export async function saveCategory(form: FormData) {
  await requireAdmin();
  const id = read(form, "id"), name = read(form, "name"), slug = read(form, "slug").toLowerCase();
  const sortOrder = integer(form, "sortOrder");
  if (!name || name.length > 120 || !slugPattern.test(slug)) throw new Error("Kategori adı veya URL bilgisi geçersiz.");
  const values = {
    name, slug, description: read(form, "description") || null, sortOrder,
    isActive: read(form, "isActive") === "on", updatedAt: new Date(),
  };
  if (id) {
    if (!uuid.test(id)) throw new Error("Kategori geçersiz.");
    await getDb().update(categories).set(values).where(eq(categories.id, id));
  } else {
    await getDb().insert(categories).values(values);
  }
  refreshCatalog();
}

export async function toggleCategory(form: FormData) {
  await requireAdmin();
  const id = read(form, "id");
  if (!uuid.test(id)) throw new Error("Kategori geçersiz.");
  await getDb().update(categories).set({
    isActive: read(form, "active") === "true", updatedAt: new Date(),
  }).where(eq(categories.id, id));
  refreshCatalog();
}
