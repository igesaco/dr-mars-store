import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import AdsManagerClient from "./ads-manager-client";
import { AdIntegrationsConfig } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdsAdminPage() {
  await requireAdmin();
  const db = getDb();

  const [row] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, "ad_integrations"))
    .limit(1);

  const defaultConfig: AdIntegrationsConfig = {
    meta: {
      enabled: false,
      pixelId: "",
      capiToken: "",
      testEventCode: "",
    },
    google: {
      enabled: false,
      conversionId: "",
      purchaseLabel: "",
      enhancedConversions: true,
    },
    tiktok: {
      enabled: false,
      pixelId: "",
      eventsApiToken: "",
    },
    utmDefaultCampaign: "dr_mars_lansman",
  };

  const config: AdIntegrationsConfig = (row?.value as AdIntegrationsConfig) ?? defaultConfig;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://drmarsparfum.com";

  return (
    <main className="admin-main catalog-main">
      <header className="catalog-top">
        <div>
          <p className="admin-kicker">PAZARLAMA & BÜYÜME</p>
          <h1>Çok Kanallı Reklam Yönetimi</h1>
          <p className="admin-lead">
            Meta Ads (Instagram & Facebook), Google Ads & Alışveriş ve TikTok Ads hesaplarınızı tek merkezden bağlayın;
            dinamik ürün katalog feedlerinizi ve UTM kampanyalarınızı yönetin.
          </p>
        </div>
      </header>

      <AdsManagerClient initialConfig={config} baseUrl={baseUrl} />
    </main>
  );
}
