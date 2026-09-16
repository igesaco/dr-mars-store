import type { Metadata } from "next";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | Dr. Mars",
  description: "6698 Sayılı Kişisel Verilerin Korunması Kanunu uyarınca aydınlatma metni.",
};

export default async function KvkkPage() {
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
          <p className="eyebrow dark">YASAL UYUM</p>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-stone-900">
            KVKK Aydınlatma Metni
          </h1>

          <div className="space-y-4 pt-4 border-t border-stone-100">
            <p>
              Dr. Mars Kozmetik San. ve Tic. A.Ş. (&quot;Şirket&quot;) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca veri sorumlusu sıfatıyla, kişisel verilerinizin güvenliğine ve hukuka uygun işlenmesine azami özen göstermekteyiz.
            </p>

            <h2 className="text-base font-bold text-stone-900 pt-2">İşlenen Kişisel Verileriniz ve Amaçları</h2>
            <p>
              Adınız, soyadınız, iletişim adresiniz, telefon numaranız ve e-posta adresiniz; siparişlerinizin oluşturulması, teslimatının sağlanması, faturalandırma işlemlerinin yürütülmesi ve satış sonrası müşteri destek hizmetlerinin sunulması amaçlarıyla sınırlı olarak işlenmektedir.
            </p>

            <h2 className="text-base font-bold text-stone-900 pt-2">Kişisel Veri Sahibinin Hakları</h2>
            <p>
              KVKK&apos;nın 11. maddesi uyarınca veri sahipleri; kişisel verilerinin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, verilerin amacına uygun kullanılıp kullanılmadığını öğrenme, verilerin düzeltilmesini veya silinmesini talep etme haklarına sahiptir.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
