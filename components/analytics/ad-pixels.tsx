import Script from "next/script";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { AdIntegrationsConfig } from "@/app/admin/reklamlar/actions";

export async function AdPixels() {
  let metaPixelId = "";
  let googleConversionId = "";
  let tiktokPixelId = "";

  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "ad_integrations"));

    if (rows[0]?.value) {
      const config = rows[0].value as AdIntegrationsConfig;
      if (config.meta?.enabled && config.meta?.pixelId) {
        metaPixelId = config.meta.pixelId.trim();
      }
      if (config.google?.enabled && config.google?.conversionId) {
        googleConversionId = config.google.conversionId.trim();
      }
      if (config.tiktok?.enabled && config.tiktok?.pixelId) {
        tiktokPixelId = config.tiktok.pixelId.trim();
      }
    }

    // Fallback: Check legacy seo_analytics if metaPixelId was configured there
    if (!metaPixelId || !googleConversionId) {
      const [legacyRow] = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, "seo_analytics"))
        .limit(1);

      if (legacyRow?.value) {
        const legacy = legacyRow.value as any;
        if (!metaPixelId && legacy.metaPixelId) {
          metaPixelId = String(legacy.metaPixelId).trim();
        }
        if (!googleConversionId && legacy.gaId) {
          googleConversionId = String(legacy.gaId).trim();
        }
      }
    }
  } catch {
    // If DB is unavailable during build time or migration, fail safely without crashing storefront
  }

  return (
    <>
      {/* 1. Meta Pixel (Facebook & Instagram) */}
      {metaPixelId && (
        <>
          <Script id="meta-pixel-init" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* 2. Google Ads & Google Tag (gtag.js) */}
      {googleConversionId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleConversionId}`}
            strategy="afterInteractive"
          />
          <Script id="google-gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleConversionId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {/* 3. TikTok Pixel */}
      {tiktokPixelId && (
        <Script id="tiktok-pixel-init" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,s=d.createElement("script");s.type="text/javascript",s.async=!0,s.src=i+"?sdkid="+e+"&lib="+t;var r=d.getElementsByTagName("script")[0];r.parentNode.insertBefore(s,r)};
              ttq.load('${tiktokPixelId}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}
    </>
  );
}
