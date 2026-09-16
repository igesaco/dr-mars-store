"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { coupons } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function saveCouponAction(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "").trim();
  const code = String(form.get("code") ?? "").trim().toUpperCase();
  const type = String(form.get("type") ?? "percent").trim() as "percent" | "fixed";
  const value = String(form.get("value") ?? "0").trim();
  const minimumOrderAmount = String(form.get("minimumOrderAmount") ?? "").trim() || null;
  const usageLimitStr = String(form.get("usageLimit") ?? "").trim();
  const usageLimit = usageLimitStr ? parseInt(usageLimitStr, 10) : null;
  const isActive = form.get("isActive") === "on";

  if (!code || code.length < 3 || Number(value) <= 0) {
    throw new Error("Kupon kodu ve indirim değeri geçerli olmalıdır.");
  }

  const db = getDb();
  const values = {
    code,
    type,
    value,
    minimumOrderAmount,
    usageLimit,
    isActive,
    updatedAt: new Date(),
  };

  if (id && uuidPattern.test(id)) {
    await db.update(coupons).set(values).where(eq(coupons.id, id));
  } else {
    await db.insert(coupons).values(values);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/kuponlar");
}

export async function toggleCouponAction(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "").trim();
  const active = form.get("active") === "true";

  if (!id || !uuidPattern.test(id)) {
    throw new Error("Geçersiz kupon ID.");
  }

  const db = getDb();
  await db
    .update(coupons)
    .set({
      isActive: active,
      updatedAt: new Date(),
    })
    .where(eq(coupons.id, id));

  revalidatePath("/admin");
  revalidatePath("/admin/kuponlar");
}
