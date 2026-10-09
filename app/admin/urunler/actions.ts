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
const sanitizeUrl = (val: string): string | null => {
  const v = String(val || "").trim();
  if (!v) return null;
  if (v.startsWith("/") || v.startsWith("data:")) {
    return v;
  }
  try {
    const parsed = new URL(v);
    if (["http:", "https:"].includes(parsed.protocol)) {
      return parsed.toString();
    }
  } catch {
    if (v.startsWith("/")) return v;
  }
  return null;
};

const getFormImages = (form: FormData): string[] => {
  const list: string[] = [];

  // 1. JSON array olarak gönderilmişse (imageUrls)
  const jsonRaw = read(form, "imageUrls");
  if (jsonRaw) {
    try {
      const parsed = JSON.parse(jsonRaw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const sanitized = sanitizeUrl(item);
          if (sanitized && !list.includes(sanitized)) {
            list.push(sanitized);
          }
        }
      }
    } catch {
      // JSON parse başarısız olursa devam et
    }
  }

  // 2. Birden fazla 'productImages' form alanı
  const allImages = form.getAll("productImages");
  for (const item of allImages) {
    const sanitized = sanitizeUrl(String(item));
    if (sanitized && !list.includes(sanitized)) {
      list.push(sanitized);
    }
  }

  // 3. Fallback: Tekil 'imageUrl' alanı
  const single = sanitizeUrl(read(form, "imageUrl"));
  if (single && !list.includes(single)) {
    list.unshift(single);
  }

  return list;
};

const refreshCatalog = () => {
  revalidatePath("/admin");
  revalidatePath("/admin/urunler");
  revalidatePath("/admin/urunler/yeni");
  revalidatePath("/admin/kategoriler");
  revalidatePath("/");
  revalidatePath("/kategori/[slug]", "page");
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
  const sortOrder = integer(form, "sortOrder", 0);
  const db = getDb();
  await db.transaction(async tx => {
    const [product] = await tx.insert(products).values({
      name, slug, categoryId: categoryId(form),
      shortDescription: read(form, "shortDescription").slice(0, 500) || null,
      description: read(form, "description") || null,
      fragranceNotes,
      sortOrder,
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
    const imagesToSave = getFormImages(form);
    for (let i = 0; i < imagesToSave.length; i++) {
      await tx.insert(productImages).values({
        productId: product.id,
        url: imagesToSave[i],
        altText: `${name} - Görsel ${i + 1}`,
        sortOrder: i,
      });
    }

    const { logAuditEvent } = await import("@/lib/audit-log");
    await logAuditEvent({
      action: "ÜRÜN_EKLENDİ",
      entityType: "product",
      entityId: product.id,
      description: `"${name}" adlı yeni ürün oluşturuldu. Fiyat: ₺${price}, Stok: ${stock} adet.`,
      details: { name, slug, price, stock, sku, volumeMl },
    });
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
    const sortOrder = integer(form, "sortOrder", 0);
    const active = read(form, "status") !== "draft";
    await tx.update(products).set({
      name, slug, categoryId: categoryId(form),
      shortDescription: read(form, "shortDescription").slice(0, 500) || null,
      description: read(form, "description") || null,
      fragranceNotes,
      sortOrder,
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
    const imagesToSave = getFormImages(form);
    await tx.delete(productImages).where(eq(productImages.productId, id));
    for (let i = 0; i < imagesToSave.length; i++) {
      await tx.insert(productImages).values({
        productId: id,
        url: imagesToSave[i],
        altText: `${name} - Görsel ${i + 1}`,
        sortOrder: i,
      });
    }

    const { logAuditEvent } = await import("@/lib/audit-log");
    await logAuditEvent({
      action: "ÜRÜN_GÜNCELLENDİ",
      entityType: "product",
      entityId: id,
      description: `"${name}" adlı ürün güncellendi. Yeni Fiyat: ₺${price}, Stok: ${stock} adet.`,
      details: { name, slug, price, stock, sku, volumeMl },
    });
  });
  refreshCatalog();
  redirect("/admin/urunler?updated=1");
}

export async function bulkProductAction(form: FormData) {
  await requireAdmin();
  const ids = form.getAll("productIds").map(String).filter(id => uuid.test(id)).slice(0, 200);
  const action = read(form, "bulkAction");
  if (!ids.length || !action) throw new Error("Ürün veya toplu işlem seçilmedi.");

  const db = getDb();
  const { logAuditEvent } = await import("@/lib/audit-log");

  if (action === "activate" || action === "archive") {
    const active = action === "activate";
    await db.transaction(async tx => {
      await tx.update(products).set({ isActive: active, updatedAt: new Date() }).where(inArray(products.id, ids));
      await tx.update(productVariants).set({ isActive: active, updatedAt: new Date() }).where(inArray(productVariants.productId, ids));
    });
    await logAuditEvent({
      action: active ? "TOPLU_YAYINA_ALMA" : "TOPLU_ARSIVLEME",
      entityType: "product",
      description: `${ids.length} adet ürün topluca ${active ? "yayına alındı" : "arşivlendi"}.`,
      details: { ids, action },
    });
  } else if (action === "set_stock") {
    const stockVal = Math.max(0, parseInt(read(form, "bulkStockValue") || "0", 10));
    await db.transaction(async tx => {
      await tx.update(productVariants).set({ stockQuantity: stockVal, updatedAt: new Date() }).where(inArray(productVariants.productId, ids));
    });
    await logAuditEvent({
      action: "TOPLU_STOK_GUNCELLEME",
      entityType: "product",
      description: `${ids.length} adet ürünün stoku topluca ${stockVal} adet olarak ayarlandı.`,
      details: { ids, stockVal },
    });
  } else if (action === "add_stock") {
    const addVal = parseInt(read(form, "bulkStockValue") || "0", 10);
    await db.transaction(async tx => {
      const variants = await tx.select({ id: productVariants.id, stock: productVariants.stockQuantity }).from(productVariants).where(inArray(productVariants.productId, ids));
      for (const v of variants) {
        const newStock = Math.max(0, v.stock + addVal);
        await tx.update(productVariants).set({ stockQuantity: newStock, updatedAt: new Date() }).where(eq(productVariants.id, v.id));
      }
    });
    await logAuditEvent({
      action: "TOPLU_STOK_ARTIRIMI",
      entityType: "product",
      description: `${ids.length} adet ürünün stokuna topluca ${addVal} adet eklendi.`,
      details: { ids, addVal },
    });
  } else if (action === "increase_price_percent") {
    const percent = parseFloat(read(form, "bulkPriceValue") || "0");
    if (isNaN(percent) || percent <= -100) throw new Error("Geçerli bir yüzde artış oranı girin.");
    await db.transaction(async tx => {
      const variants = await tx.select({ id: productVariants.id, price: productVariants.price }).from(productVariants).where(inArray(productVariants.productId, ids));
      for (const v of variants) {
        const currentPrice = parseFloat(v.price || "0");
        const newPrice = Math.round((currentPrice * (1 + percent / 100)) * 100) / 100;
        await tx.update(productVariants).set({ price: newPrice.toFixed(2), updatedAt: new Date() }).where(eq(productVariants.id, v.id));
      }
    });
    await logAuditEvent({
      action: "TOPLU_FIYAT_KAR_ARTISI",
      entityType: "product",
      description: `${ids.length} adet ürüne %${percent} oranında kâr marjı / fiyat artışı uygulandı.`,
      details: { ids, percent },
    });
  } else if (action === "increase_price_amount") {
    const amount = parseFloat(read(form, "bulkPriceValue") || "0");
    if (isNaN(amount)) throw new Error("Geçerli bir tutar girin.");
    await db.transaction(async tx => {
      const variants = await tx.select({ id: productVariants.id, price: productVariants.price }).from(productVariants).where(inArray(productVariants.productId, ids));
      for (const v of variants) {
        const currentPrice = parseFloat(v.price || "0");
        const newPrice = Math.max(0, Math.round((currentPrice + amount) * 100) / 100);
        await tx.update(productVariants).set({ price: newPrice.toFixed(2), updatedAt: new Date() }).where(eq(productVariants.id, v.id));
      }
    });
    await logAuditEvent({
      action: "TOPLU_SABIT_FIYAT_ARTISI",
      entityType: "product",
      description: `${ids.length} adet ürüne ${amount} TL fiyat artışı uygulandı.`,
      details: { ids, amount },
    });
  } else if (action === "set_margin_from_cost") {
    const marginPercent = parseFloat(read(form, "bulkPriceValue") || "0");
    if (isNaN(marginPercent) || marginPercent < 0) throw new Error("Geçerli bir kâr marjı yüzdesi girin.");
    await db.transaction(async tx => {
      const variants = await tx.select({ id: productVariants.id, unitCost: productVariants.unitCost, price: productVariants.price }).from(productVariants).where(inArray(productVariants.productId, ids));
      for (const v of variants) {
        const cost = parseFloat(v.unitCost || "0");
        if (cost > 0) {
          const newPrice = Math.round((cost * (1 + marginPercent / 100)) * 100) / 100;
          await tx.update(productVariants).set({ price: newPrice.toFixed(2), updatedAt: new Date() }).where(eq(productVariants.id, v.id));
        }
      }
    });
    await logAuditEvent({
      action: "MALIYETTEN_KAR_MARJI_BELIRLEME",
      entityType: "product",
      description: `${ids.length} adet ürüne maliyet üzerinden %${marginPercent} kâr marjı belirlendi.`,
      details: { ids, marginPercent },
    });
  } else if (action === "move_to_top") {
    await db.transaction(async tx => {
      await tx.update(products).set({ sortOrder: 1, updatedAt: new Date() }).where(inArray(products.id, ids));
    });
    await logAuditEvent({
      action: "TOPLU_VITRIN_SIRALAMA",
      entityType: "product",
      description: `${ids.length} adet ürün vitrinde en üst sıraya (sıra: 1) taşındı.`,
      details: { ids },
    });
  }

  refreshCatalog();
}

export async function updateProductSortOrder(form: FormData) {
  await requireAdmin();
  const id = read(form, "id");
  const sortOrder = parseInt(read(form, "sortOrder") || "0", 10);
  if (!uuid.test(id)) throw new Error("Ürün ID geçersiz.");
  await getDb().update(products).set({ sortOrder, updatedAt: new Date() }).where(eq(products.id, id));
  
  const { logAuditEvent } = await import("@/lib/audit-log");
  await logAuditEvent({
    action: "URUN_VITRIN_SIRA_GUNCELLEME",
    entityType: "product",
    description: `Ürün (#${id}) vitrin sırası #${sortOrder} olarak güncellendi.`,
    details: { id, sortOrder },
  });

  refreshCatalog();
}

export async function saveProductOrderList(input: string[] | FormData) {
  await requireAdmin();
  let ids: string[] = [];
  if (Array.isArray(input)) {
    ids = input;
  } else if (input instanceof FormData) {
    const raw = String(input.get("orderedIds") || "");
    try {
      ids = JSON.parse(raw);
    } catch {
      ids = [];
    }
  }
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Geçerli bir ürün listesi gönderilmedi.");
  }

  const db = getDb();
  await db.transaction(async (tx) => {
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (uuid.test(id)) {
        await tx
          .update(products)
          .set({ sortOrder: i + 1, updatedAt: new Date() })
          .where(eq(products.id, id));
      }
    }
  });

  const { logAuditEvent } = await import("@/lib/audit-log");
  await logAuditEvent({
    action: "ANASAYFA_VITRIN_SIRALAMA_GUNCELLEME",
    entityType: "product",
    description: `${ids.length} adet ürünün anasayfa vitrin sıralaması güncellendi.`,
    details: { orderedIds: ids },
  });

  refreshCatalog();
  return { success: true };
}

export async function toggleProductFeatured(input: { id: string; isFeatured: boolean } | FormData) {
  await requireAdmin();
  let id = "";
  let isFeatured = false;
  if (input instanceof FormData) {
    id = read(input, "id");
    isFeatured = read(input, "isFeatured") === "true";
  } else {
    id = input.id;
    isFeatured = Boolean(input.isFeatured);
  }
  if (!uuid.test(id)) throw new Error("Ürün ID geçersiz.");

  await getDb()
    .update(products)
    .set({ isFeatured, updatedAt: new Date() })
    .where(eq(products.id, id));

  const { logAuditEvent } = await import("@/lib/audit-log");
  await logAuditEvent({
    action: "VITRIN_ONE_CIKAN_GUNCELLEME",
    entityType: "product",
    description: `Ürün (#${id}) vitrinde öne çıkarma durumu ${isFeatured ? "aktif" : "pasif"} yapıldı.`,
    details: { id, isFeatured },
  });

  refreshCatalog();
  return { success: true };
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

export async function deleteCategory(form: FormData) {
  await requireAdmin();
  const id = read(form, "id");
  if (!uuid.test(id)) throw new Error("Kategori geçersiz.");
  const db = getDb();
  await db.transaction(async (tx) => {
    await tx.update(products).set({ categoryId: null }).where(eq(products.categoryId, id));
    await tx.delete(categories).where(eq(categories.id, id));
  });
  refreshCatalog();
}
