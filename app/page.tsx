import Link from "next/link";
import {
  ArrowRight,
  Gift,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { HomeProductShowcase } from "@/components/storefront/home-product-showcase";
import { WhatsAppButton } from "@/components/storefront/whatsapp-button";
import { ScrollToTop } from "@/components/storefront/scroll-to-top";
import { getFeaturedProducts, getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, products, settings] = await Promise.all([
    getStoreNavCategories(),
    getFeaturedProducts(),
    getStoreSettings(),
  ]);

  const announcement =
    (typeof settings.announcement === "object" && settings.announcement !== null && "text" in settings.announcement
      ? String(settings.announcement.text)
      : null) ?? "MARDİN OSB LABORATUVARLARINDAN · 1.500 TL VE ÜZERİ SİPARİŞLERDE SİGORTALI ÜCRETSİZ KARGO";

  return (
    <main className="min-h-screen bg-[#fbfaf8] text-[#111620]">
      {/* Lüks Header */}
      <Header categories={categories} announcementText={announcement} />

      {/* Üst Güven & Avantaj Şeridi */}
      <section className="border-b border-stone-200 bg-white py-3.5 px-4 sm:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold text-stone-700">
          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <Truck size={18} className="text-[#8f7351] shrink-0" />
            <span>Aynı Gün Kargo (15:00&apos;a kadar)</span>
          </div>
          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <PackageCheck size={18} className="text-[#8f7351] shrink-0" />
            <span>%100 Sigortalı Kırılmaz Ambalaj</span>
          </div>
          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <Gift size={18} className="text-[#8f7351] shrink-0" />
            <span>Her Siparişe 2 Adet Tester Hediye</span>
          </div>
          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <ShieldCheck size={18} className="text-[#8f7351] shrink-0" />
            <span>Mardin OSB & Sağlık Bakanlığı Onaylı</span>
          </div>
        </div>
      </section>

      {/* DOĞRUDAN ÖNE ÇIKAN VE EN ÇOK TERCİH EDİLEN ÜRÜNLER VİTRİNİ */}
      <HomeProductShowcase categories={categories} products={products} />

      {/* SAYFA ALTI: KATEGORİ KEŞİF VİTRİNİ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-2 border-b border-stone-200 gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8f7351] block mb-1">
              KOLEKSİYONLARI KEŞFEDİN
            </span>
            <h2 className="text-xl sm:text-2xl font-serif text-stone-900 font-normal">
              Dr. Mars Koku Dünyası
            </h2>
          </div>
          <Link
            href="/#urunler"
            className="text-xs font-bold text-[#8f7351] hover:text-stone-900 inline-flex items-center gap-1 self-start sm:self-auto transition-colors"
          >
            <span>Tüm Ürünleri İncele</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href="/kategori/kolonyalar"
            className="group rounded-2xl border border-stone-200 bg-white p-5 hover:border-stone-800 transition-all hover:shadow-sm flex flex-col justify-between"
          >
            <div>
              <span className="text-2xl mb-2.5 block">🌿</span>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900 group-hover:text-[#8f7351] transition-colors">
                Kolonyalar
              </h3>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                Hakiki akik taşlı flakonda 80° ferahlatıcı imza serisi
              </p>
            </div>
            <span className="text-[10.5px] font-bold text-[#8f7351] mt-4 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Koleksiyonu Gör →
            </span>
          </Link>

          <Link
            href="/kategori/oda-kokulari"
            className="group rounded-2xl border border-stone-200 bg-white p-5 hover:border-stone-800 transition-all hover:shadow-sm flex flex-col justify-between"
          >
            <div>
              <span className="text-2xl mb-2.5 block">🏠</span>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900 group-hover:text-[#8f7351] transition-colors">
                Oda Kokuları
              </h3>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                Bambu çubuklu ve spreyli doğal esansiyel difüzörler
              </p>
            </div>
            <span className="text-[10.5px] font-bold text-[#8f7351] mt-4 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Koleksiyonu Gör →
            </span>
          </Link>

          <Link
            href="/kategori/oto-kokulari"
            className="group rounded-2xl border border-stone-200 bg-white p-5 hover:border-stone-800 transition-all hover:shadow-sm flex flex-col justify-between"
          >
            <div>
              <span className="text-2xl mb-2.5 block">🚗</span>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900 group-hover:text-[#8f7351] transition-colors">
                Oto Kokuları
              </h3>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                Kayın ahşap difüzör kapaklı yoğun asma esanslar
              </p>
            </div>
            <span className="text-[10.5px] font-bold text-[#8f7351] mt-4 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Koleksiyonu Gör →
            </span>
          </Link>

          <Link
            href="/kategori/hediye-setleri"
            className="group rounded-2xl border border-stone-200 bg-white p-5 hover:border-stone-800 transition-all hover:shadow-sm flex flex-col justify-between"
          >
            <div>
              <span className="text-2xl mb-2.5 block">🎁</span>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900 group-hover:text-[#8f7351] transition-colors">
                Hediye Setleri
              </h3>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                Prestijli kadife ambalajında unutulmaz koku hediyesi
              </p>
            </div>
            <span className="text-[10.5px] font-bold text-[#8f7351] mt-4 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Koleksiyonu Gör →
            </span>
          </Link>
        </div>
      </section>

      {/* Akik Taşı & Bilimsel Zarafet Açık Tonlu Bilgi Alanı */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8 py-12">
        <div className="rounded-3xl border border-stone-200/80 bg-white p-8 sm:p-12 shadow-sm grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-[11px] font-bold tracking-wider text-[#8f7351] uppercase block">
              PATENTLİ FORMÜLASYON · MARDİN OSB
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Flakondaki Hakiki Akik Taşı ve %80 Doğal Alkol
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Dr. Mars formülasyonları; kurucumuz Kimya Mühendisi Hamdullah Adsoy gözetiminde geliştirilen, şişe içerisindeki doğal akik taşı kristalleriyle koku esansını dinlendiren patentli bir teknolojiye sahiptir.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <span className="rounded-lg bg-[#f4f2ec] px-3 py-1.5 text-xs font-bold text-stone-800">
                ✓ 80° Hijyenik Etil Alkol
              </span>
              <span className="rounded-lg bg-[#f4f2ec] px-3 py-1.5 text-xs font-bold text-stone-800">
                ✓ 12+ Saat Yayılım
              </span>
              <span className="rounded-lg bg-[#f4f2ec] px-3 py-1.5 text-xs font-bold text-stone-800">
                ✓ T.C. ÜTS Lisanslı
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-[#faf8f4] border border-stone-200/60 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
              <div className="flex items-center gap-1.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} className="fill-current" />
                ))}
                <span className="text-xs font-bold text-stone-900 ml-1">4.9 / 5.0</span>
              </div>
              <span className="text-[11px] font-bold text-stone-500">1.450+ Doğrulanmış Müşteri</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed italic">
              &quot;Akik taşlı flakon kolonyanın masamdaki duruşu muhteşem. Kokunun kalıcılığı ve ferahlığı alışılmış kolonyaların çok ötesinde, tam bir niş parfüm seviyesinde.&quot;
            </p>
            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
              <span className="font-bold text-stone-900">Zeynep K. — İstanbul</span>
              <span className="text-emerald-700 font-semibold">Doğrulanmış Alıcı</span>
            </div>
          </div>
        </div>
      </section>

      {/* Kurumsal Hikaye Butonu */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8 pb-16 text-center">
        <div className="inline-flex flex-col sm:flex-row items-center gap-4 rounded-2xl bg-white border border-stone-200 p-6 shadow-xs max-w-2xl mx-auto">
          <div className="text-left flex-1">
            <h3 className="text-sm font-bold text-stone-900">Dr. Mars Marka Hikayesini Merak Ediyor Musunuz?</h3>
            <p className="text-xs text-stone-500 mt-0.5">Mardin OSB fabrikamız, kimya mühendisliği ve kadim mirasımız.</p>
          </div>
          <Link
            href="/hakkimizda"
            className="rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-stone-800 transition-colors shrink-0 flex items-center gap-1.5"
          >
            Kurumsal Hikayemiz <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* Canlı WhatsApp Destek Butonu */}
      <WhatsAppButton />

      {/* Yukarı Çık Butonu */}
      <ScrollToTop />

      {/* Footer */}
      <Footer />
    </main>
  );
}
