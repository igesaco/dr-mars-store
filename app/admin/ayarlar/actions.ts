"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

export async function saveSiteSettingsAction(form: FormData) {
  await requireAdmin();
  const db = getDb();

  const announcementText = String(form.get("announcementText") ?? "").trim();
  const announcementActive = form.get("announcementActive") === "on";

  const freeThreshold = Number(form.get("freeThreshold") ?? 1500);
  const standardCost = Number(form.get("standardCost") ?? 59);
  const cargoCompany = String(form.get("cargoCompany") ?? "Yurtiçi Kargo").trim();

  const phone = String(form.get("phone") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const address = String(form.get("address") ?? "").trim();
  const workingHours = String(form.get("workingHours") ?? "").trim();

  const instagram = String(form.get("instagram") ?? "").trim();
  const facebook = String(form.get("facebook") ?? "").trim();

  const updates = [
    {
      key: "announcement",
      value: { text: announcementText, active: announcementActive },
    },
    {
      key: "shipping",
      value: { freeThreshold, standardCost, cargoCompany },
    },
    {
      key: "contact",
      value: { phone, email, address, workingHours },
    },
    {
      key: "social",
      value: { instagram, facebook },
    },
  ];

  for (const s of updates) {
    await db
      .insert(siteSettings)
      .values({ key: s.key, value: s.value })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: s.value, updatedAt: new Date() },
      });
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/ayarlar");
}
