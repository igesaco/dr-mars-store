"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";


export async function updateOrderStatusAction(form: FormData) {
  await requireAdmin();
  const orderId = String(form.get("orderId") ?? "").trim();
  const status = String(form.get("status") ?? "").trim();
  const paymentStatus = String(form.get("paymentStatus") ?? "").trim();

  if (!orderId || !status) {
    throw new Error("Sipariş veya durum bilgisi eksik.");
  }

  const db = getDb();
  const updates: any = {
    status: status as any,
    updatedAt: new Date(),
  };

  if (paymentStatus) {
    updates.paymentStatus = paymentStatus as any;
  }

  await db.update(orders).set(updates).where(eq(orders.id, orderId));

  const { logAuditEvent } = await import("@/lib/audit-log");
  await logAuditEvent({
    action: "SİPARİŞ_DURUMU_GÜNCELLENDİ",
    entityType: "order",
    entityId: orderId,
    description: `Sipariş (${orderId}) durumu "${status}" olarak güncellendi.${paymentStatus ? ` Ödeme durumu: "${paymentStatus}".` : ""}`,
    details: updates,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/siparisler");
  revalidatePath(`/admin/siparisler/${orderId}`);
}

export async function updateCargoAction(form: FormData) {
  await requireAdmin();
  const orderId = String(form.get("orderId") ?? "").trim();
  const cargoCompany = String(form.get("cargoCompany") ?? "").trim();
  const cargoTrackingNumber = String(form.get("cargoTrackingNumber") ?? "").trim();

  if (!orderId) {
    throw new Error("Sipariş ID eksik.");
  }

  const db = getDb();
  await db
    .update(orders)
    .set({
      cargoCompany: cargoCompany || null,
      cargoTrackingNumber: cargoTrackingNumber || null,
      status: cargoTrackingNumber ? "shipped" : undefined,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  const { logAuditEvent } = await import("@/lib/audit-log");
  await logAuditEvent({
    action: "KARGO_TAKİP_GİRİLDİ",
    entityType: "order",
    entityId: orderId,
    description: `Sipariş (${orderId}) için ${cargoCompany || "Kargo"} takip numarası (${cargoTrackingNumber || "kaldırıldı"}) girildi.`,
    details: { cargoCompany, cargoTrackingNumber },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/siparisler");
  revalidatePath(`/admin/siparisler/${orderId}`);
}

export async function createShipmentForOrderAction(form: FormData) {
  await requireAdmin();
  const orderId = String(form.get("orderId") ?? "").trim();
  if (!orderId) throw new Error("Sipariş ID eksik.");

  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error("Sipariş bulunamadı.");

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  const totalItemCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);

  const addr = (order.shippingAddress as Record<string, string>) || {};
  const payerType = (form.get("payerType") === "receiver" ? "receiver" : "sender") as "sender" | "receiver";

  const shipmentData = {
    orderNumber: order.orderNumber,
    recipientName: addr.recipientName || "Müşteri",
    recipientPhone: addr.phone || "05550000000",
    recipientEmail: addr.email,
    addressLine: addr.addressLine || "",
    district: addr.district || "",
    city: addr.city || "",
    totalAmount: Number(order.totalAmount) || 0,
    paymentMethod: order.paymentStatus === "paid" ? "credit_card" : "cash_on_delivery",
    itemsCount: totalItemCount || 1,
    payerType,
  };

  const { createCargoShipment } = await import("@/lib/cargo-service");
  const result = await createCargoShipment(shipmentData);

  if (result.success && result.trackingNumber) {
    await db
      .update(orders)
      .set({
        cargoCompany: result.cargoCompany,
        cargoTrackingNumber: result.trackingNumber,
        status: "shipped",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    const { logAuditEvent: logAudit } = await import("@/lib/audit-log");
    await logAudit({
      action: "KARGO_ETİKETİ_YAZDIRILDI",
      entityType: "order",
      entityId: orderId,
      description: `Sipariş #${order.orderNumber} için Yurtiçi Kargo sevkiyat kodu (${result.trackingNumber}) oluşturuldu.`,
      details: { ...shipmentData, trackingNumber: result.trackingNumber },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/siparisler");
    revalidatePath(`/admin/siparisler/${orderId}`);
    revalidatePath("/siparis-takip");
    revalidatePath(`/siparis-tamamlandi/${order.orderNumber}`);
  }
}


