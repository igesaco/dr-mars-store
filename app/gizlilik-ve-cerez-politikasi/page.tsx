import type { Metadata } from "next";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gizlilik ve Çerez Politikası | Dr. Mars",
  description: "Dr. Mars veri güvenliği, gizlilik ve çerez kullanım politikası.",
};

export default async function PrivacyPolicyPage() {
  const [navCategories, settings] = await Promise.all([
    getStoreNavCategories(),
    getStoreSettings(),
  ]);

  const announcement = settings.announcement?.text ?? "1500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ";

  return (
    <main className="min-h-screen bg-[#f5f4ee] text-[#0b1724]">
      <Header categories={navCategories} announcementText={announcement} />

      <section className="mx-auto max-w-4xl px-6 py-16 sm:px-12">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 sm:p-12 shadow-xs space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <p className="eyebrow dark">GÜVENLİK VE GİZLİLİK</p>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-stone-900">
            Gizlilik ve Çerez Politikası
          </h1>

          <div className="space-y-4 pt-4 border-t border-stone-100">
            <h2 className="text-base font-bold text-stone-900">Veri Güvenliği Taahhüdü</h2>
            <p>
              Dr. Mars olarak ziyaretçilerimizin ve müşterilerimizin kişisel verilerinin gizliliğine ve güvenliğine en üst düzeyde önem veriyoruz. Sitemizde gerçekleştirdiğiniz tüm işlemler 256-Bit SSL (Secure Sockets Layer) şifreleme protokolü ile güvence altındadır. Kredi kartı ve ödeme bilgileriniz sunucularımızda asla saklanmaz.
            </p>

            <h2 className="text-base font-bold text-stone-900 pt-2">Çerez (Cookie) Kullanımı</h2>
            <p>
              İnternet sitemizde gezinme deneyiminizi iyileştirmek, alışveriş sepetinizi hatırlamak ve oturumunuzun güvenliğini sağlamak amacıyla zorunlu çerezler kullanılmaktadır. Sitemizi kullanarak bu zorunlu çerezlerin kullanımını kabul etmiş sayılırsınız.
            </p>

            <h2 className="text-base font-bold text-stone-900 pt-2">Üçüncü Taraflarla Paylaşım</h2>
            <p>
              Kişisel bilgileriniz, yasal zorunluluklar ve siparişinizin tarafınıza ulaştırılması için gereken lojistik iş ortaklarımız (kargo şirketi vb.) haricinde hiçbir üçüncü şahıs veya kurumla ticari amaçla paylaşılmaz.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
