"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

export async function saveSeoSettingsAction(form: FormData) {
  await requireAdmin();
  const db = getDb();

  const gaId = String(form.get("gaId") ?? "").trim();
  const metaPixelId = String(form.get("metaPixelId") ?? "").trim();
  const defaultTitle = String(form.get("defaultTitle") ?? "").trim();
  const defaultDescription = String(form.get("defaultDescription") ?? "").trim();

  const value = {
    gaId,
    metaPixelId,
    defaultTitle,
    defaultDescription,
  };

  await db
    .insert(siteSettings)
    .values({ key: "seo_analytics", value })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value, updatedAt: new Date() },
    });

  revalidatePath("/admin");
  revalidatePath("/admin/seo");
}
