"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
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

  revalidatePath("/admin");
  revalidatePath("/admin/siparisler");
  revalidatePath(`/admin/siparisler/${orderId}`);
}
