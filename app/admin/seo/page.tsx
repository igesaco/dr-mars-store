import Link from "next/link";
import { eq } from "drizzle-orm";
import { ExternalLink, Globe, Search, ShieldCheck } from "lucide-react";
import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { saveSeoSettingsAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SeoAdmin() {
  await requireAdmin();
  const db = getDb();
  const [row] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, "seo_analytics"))
    .limit(1);

  const seo = (row?.value as any) ?? {
    gaId: "",
    metaPixelId: "",
    defaultTitle: "Dr. Mars | Modern Cologne",
    defaultDescription: "Dr. Mars köklü kolonya geleneğini modern ferahlıkla yeniden tanımlar.",
  };

  return (
    <main className="admin-main catalog-main">
      <header className="catalog-top">
        <div>
          <p className="admin-kicker">PAZARLAMA & GÖRÜNÜRLÜK</p>
          <h1>SEO & Web Analiz</h1>
          <p className="admin-lead">
            Google Analytics, Meta Pixel, varsayılan meta etiketleri ve indeksleme durumunu yönetin.
          </p>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 max-w-5xl">
        {/* Form */}
        <section className="admin-panel p-6 sm:p-8 space-y-6">
          <form action={saveSeoSettingsAction} className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
                1. Arama Motoru (SEO) Varsayılanları
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Varsayılan Mağaza Başlığı (Title)
                  </label>
                  <input
                    name="defaultTitle"
                    defaultValue={seo.defaultTitle}
                    placeholder="Dr. Mars | Modern Cologne"
                    className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Varsayılan Meta Açıklaması (Description)
                  </label>
                  <textarea
                    name="defaultDescription"
                    rows={3}
                    defaultValue={seo.defaultDescription}
                    placeholder="Mağaza hakkında Google'da görünecek açıklama..."
                    className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
                2. Analitik & Dönüşüm Kodları
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Google Analytics (GA4) Ölçüm Kimliği
                  </label>
                  <input
                    name="gaId"
                    defaultValue={seo.gaId}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full rounded border border-stone-300 p-2.5 text-xs font-mono outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Meta (Facebook) Pixel ID
                  </label>
                  <input
                    name="metaPixelId"
                    defaultValue={seo.metaPixelId}
                    placeholder="Örn: 123456789012345"
                    className="w-full rounded border border-stone-300 p-2.5 text-xs font-mono outline-none focus:border-stone-900"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-[#101e2c] px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-black transition-colors"
            >
              SEO & Analiz Ayarlarını Kaydet
            </button>
          </form>
        </section>

        {/* Technical SEO Quick Links */}
        <aside className="space-y-6">
          <div className="admin-panel p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-1.5">
              <Globe size={15} /> Teknik SEO Durumu
            </h3>

            <div className="space-y-3 text-xs">
              <div className="rounded-lg bg-stone-50 p-3 border border-stone-100 flex items-center justify-between">
                <div>
                  <strong className="block text-stone-900 font-bold">XML Site Haritası</strong>
                  <span className="text-stone-500">Tüm ürün ve kategoriler</span>
                </div>
                <Link
                  href="/sitemap.xml"
                  target="_blank"
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                >
                  Aç <ExternalLink size={13} />
                </Link>
              </div>

              <div className="rounded-lg bg-stone-50 p-3 border border-stone-100 flex items-center justify-between">
                <div>
                  <strong className="block text-stone-900 font-bold">Robots.txt</strong>
                  <span className="text-stone-500">Arama motoru kuralları</span>
                </div>
                <Link
                  href="/robots.txt"
                  target="_blank"
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                >
                  Aç <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#101e2c] text-white p-6 space-y-2">
            <ShieldCheck className="text-lime-300" size={24} />
            <h4 className="font-bold text-sm">Google İndeksleme</h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Dinamik sitemap sayesinde veritabanına eklenen her yeni kategori ve ürün otomatik olarak arama motorlarının taramasına sunulur.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}