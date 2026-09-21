"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

export type AdIntegrationsConfig = {
  meta: {
    enabled: boolean;
    pixelId: string;
    capiToken: string;
    testEventCode: string;
  };
  google: {
    enabled: boolean;
    conversionId: string;
    purchaseLabel: string;
    enhancedConversions: boolean;
  };
  tiktok: {
    enabled: boolean;
    pixelId: string;
    eventsApiToken: string;
  };
  utmDefaultCampaign: string;
};

const clean = (val: FormDataEntryValue | null) => String(val ?? "").trim();

export async function saveAdIntegrationsAction(formData: FormData) {
  await requireAdmin();

  const config: AdIntegrationsConfig = {
    meta: {
      enabled: clean(formData.get("meta_enabled")) === "on",
      pixelId: clean(formData.get("meta_pixel_id")),
      capiToken: clean(formData.get("meta_capi_token")),
      testEventCode: clean(formData.get("meta_test_event_code")),
    },
    google: {
      enabled: clean(formData.get("google_enabled")) === "on",
      conversionId: clean(formData.get("google_conversion_id")),
      purchaseLabel: clean(formData.get("google_purchase_label")),
      enhancedConversions: clean(formData.get("google_enhanced_conversions")) === "on",
    },
    tiktok: {
      enabled: clean(formData.get("tiktok_enabled")) === "on",
      pixelId: clean(formData.get("tiktok_pixel_id")),
      eventsApiToken: clean(formData.get("tiktok_events_api_token")),
    },
    utmDefaultCampaign: clean(formData.get("utm_default_campaign")) || "dr_mars_lansman",
  };

  const db = getDb();
  await db
    .insert(siteSettings)
    .values({
      key: "ad_integrations",
      value: config,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: {
        value: config,
        updatedAt: new Date(),
      },
    });

  revalidatePath("/admin/reklamlar");
  revalidatePath("/");
  return { success: true };
}
