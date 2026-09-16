import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://drmars.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/yonetici-giris", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
