"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  coupons,
  inventoryMovements,
  orderItems,
  orders,
  productVariants,
  users,
} from "@/db/schema";

type CheckoutItem = {
  variantId: string;
  quantity: number;
};

type CheckoutFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  addressLine: string;
  postalCode?: string;
  paymentMethod: "credit_card" | "bank_transfer" | "cash_on_delivery";
  couponCode?: string;
  customerNote?: string;
  items: CheckoutItem[];
};

export async function createOrderAction(data: CheckoutFormData) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      city,
      district,
      addressLine,
      postalCode,
      paymentMethod,
      couponCode,
      customerNote,
      items,
    } = data;

    if (!firstName || !lastName || !email || !phone || !city || !district || !addressLine) {
      return { success: false, message: "Lütfen zorunlu iletişim ve adres alanlarını doldurunuz." };
    }

    if (!items || items.length === 0) {
      return { success: false, message: "Sepetiniz boş." };
    }

    const db = getDb();

    // 1. Varyantları veritabanından doğrula
    const variantIds = items.map((i) => i.variantId);
    const dbVariants = await db
      .select({
        id: productVariants.id,
        productId: productVariants.productId,
        name: productVariants.name,
        sku: productVariants.sku,
        price: productVariants.price,
        unitCost: productVariants.unitCost,
        stock: productVariants.stockQuantity,
      })
      .from(productVariants)
      .where(inArray(productVariants.id, variantIds));

    if (dbVariants.length !== variantIds.length) {
      return { success: false, message: "Sepetinizdeki bazı ürünler güncel değil. Lütfen sepetinizi yenileyin." };
    }

    const variantMap = new Map(dbVariants.map((v) => [v.id, v]));

    // Stok kontrolü
    for (const item of items) {
      const v = variantMap.get(item.variantId);
      if (!v || v.stock < item.quantity) {
        return {
          success: false,
          message: `"${v?.name ?? "Ürün"}" için yeterli stok bulunmuyor. Kalan stok: ${v?.stock ?? 0}`,
        };
      }
    }

    // 2. Tutar hesaplamaları
    let subtotal = 0;
    for (const item of items) {
      const v = variantMap.get(item.variantId)!;
      subtotal += Number(v.price) * item.quantity;
    }

    let discountAmount = 0;
    let verifiedCoupon: any = null;

    if (couponCode) {
      const cleanCoupon = couponCode.trim().toUpperCase();
      const [cp] = await db
        .select()
        .from(coupons)
        .where(and(eq(coupons.code, cleanCoupon), eq(coupons.isActive, true)))
        .limit(1);

      if (cp) {
        const meetsMin = !cp.minimumOrderAmount || subtotal >= Number(cp.minimumOrderAmount);
        const withinLimit = !cp.usageLimit || cp.usageCount < cp.usageLimit;
        if (meetsMin && withinLimit) {
          verifiedCoupon = cp;
          if (cp.type === "percent") {
            discountAmount = Math.round(((subtotal * Number(cp.value)) / 100) * 100) / 100;
          } else {
            discountAmount = Math.min(subtotal, Number(cp.value));
          }
        }
      }
    }

    const shippingAmount = subtotal >= 1500 ? 0 : 59;
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount);

    // 3. Benzersiz Sipariş Numarası Üret
    const orderNumber = `DRM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const shippingAddress = {
      recipientName: `${firstName} ${lastName}`,
      phone,
      email,
      city,
      district,
      addressLine,
      postalCode: postalCode ?? "",
    };

    // Ödeme ve sipariş durumu belirle
    // Kredi kartı simülasyonu -> paid, Havale/Kapıda -> pending
    const isPaid = paymentMethod === "credit_card";
    const orderStatusVal = isPaid ? "paid" : "pending";
    const paymentStatusVal = isPaid ? "paid" : "pending";

    // 4. PostgreSQL Transaction
    await db.transaction(async (tx) => {
      // Siparişi oluştur
      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber,
          status: orderStatusVal,
          paymentStatus: paymentStatusVal,
          subtotal: subtotal.toFixed(2),
          shippingAmount: shippingAmount.toFixed(2),
          discountAmount: discountAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          couponCode: verifiedCoupon ? verifiedCoupon.code : null,
          shippingAddress,
          billingAddress: shippingAddress,
          cargoCompany: "Yurtiçi Kargo",
          customerNote: customerNote ? customerNote.slice(0, 500) : null,
        })
        .returning({ id: orders.id });

      // Sipariş kalemlerini ekle, stokları düş ve hareketleri kaydet
      for (const item of items) {
        const v = variantMap.get(item.variantId)!;
        const lineTotal = (Number(v.price) * item.quantity).toFixed(2);

        await tx.insert(orderItems).values({
          orderId: order.id,
          variantId: v.id,
          productName: `Dr. Mars Kolonya`,
          variantName: v.name,
          sku: v.sku,
          unitPrice: v.price,
          unitCost: v.unitCost,
          quantity: item.quantity,
          lineTotal,
        });

        // Stok miktarını düş
        await tx
          .update(productVariants)
          .set({
            stockQuantity: sql`${productVariants.stockQuantity} - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(productVariants.id, v.id));

        // Stok çıkış hareketi kaydet
        await tx.insert(inventoryMovements).values({
          variantId: v.id,
          type: "out",
          quantity: item.quantity,
          note: `Sipariş #${orderNumber} satışı`,
        });
      }

      // Kupon kullanımını artır
      if (verifiedCoupon) {
        await tx
          .update(coupons)
          .set({
            usageCount: sql`${coupons.usageCount} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(coupons.id, verifiedCoupon.id));
      }
    });

    return {
      success: true,
      orderNumber,
    };
  } catch (error: any) {
    console.error("Sipariş oluşturma hatası:", error);
    return {
      success: false,
      message: error?.message || "Sipariş oluşturulurken beklenmeyen bir hata oluştu.",
    };
  }
}
